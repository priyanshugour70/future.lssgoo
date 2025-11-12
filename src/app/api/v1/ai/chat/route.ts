import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { generateStreamingResponse } from '@/lib/gemini';
import { SendMessageSchema } from '@/types/ai';
import type { APIResponse } from '@/types';

// POST /api/v1/ai/chat - Send message and get streaming AI response
export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    if (!sessionData?.user) {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 401 });
    }

    const body = await req.json();
    const validation = SendMessageSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation error:', validation.error.issues);
      const response: APIResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: validation.error.issues as any,
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 400 });
    }

    const { conversationId, message, model } = validation.data;

    // Get or create conversation
    let conversation;
    if (conversationId && conversationId !== null) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: sessionData.user.id,
        },
      });
      if (!conversation) {
        const response: APIResponse = {
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Conversation not found',
          },
          timestamp: new Date().toISOString(),
        };
        return NextResponse.json(response, { status: 404 });
      }
    } else {
      // Create new conversation with title from first message
      const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
      conversation = await prisma.conversation.create({
        data: {
          userId: sessionData.user.id,
          title,
          model,
        },
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: message,
      },
    });

    // Generate AI response with streaming
    const stream = await generateStreamingResponse(message, model);

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    let fullResponse = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text();
            fullResponse += text;
            
            // Send chunk to client
            controller.enqueue(
              encoder.encode(
                JSON.stringify({
                  type: 'chunk',
                  content: text,
                  conversationId: conversation!.id,
                }) + '\n'
              )
            );
          }

          // Save assistant message to database
          await prisma.message.create({
            data: {
              conversationId: conversation!.id,
              role: 'ASSISTANT',
              content: fullResponse,
            },
          });

          // Update conversation lastMessageAt
          await prisma.conversation.update({
            where: { id: conversation!.id },
            data: { lastMessageAt: new Date() },
          });

          // Send completion signal
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'done',
                conversationId: conversation!.id,
                fullResponse,
              }) + '\n'
            )
          );

          controller.close();
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'error',
                error: error.message || 'Failed to generate response',
              }) + '\n'
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Error in AI chat:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to process chat',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

