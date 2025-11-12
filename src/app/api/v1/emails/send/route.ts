import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/session';
import { sendEmail } from '@/lib/email';
import { SendEmailSchema } from '@/types/email';
import type { APIResponse } from '@/types';

// POST /api/v1/emails/send - Send an email (ADMIN ONLY)
export async function POST(req: NextRequest) {
  try {
    const sessionData = await getCurrentSession();

    // Check authentication
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

    // Check admin role
    if (sessionData.user.role !== 'ADMIN') {
      const response: APIResponse = {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required',
        },
        timestamp: new Date().toISOString(),
      };
      return NextResponse.json(response, { status: 403 });
    }

    const body = await req.json();
    const validation = SendEmailSchema.safeParse(body);

    if (!validation.success) {
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

    const { to, cc, bcc, subject, body: emailBody, bodyHtml } = validation.data;

    // Create email record in DB (PENDING status)
    const email = await prisma.email.create({
      data: {
        sentBy: sessionData.user.id,
        to,
        cc: cc || [],
        bcc: bcc || [],
        subject,
        body: emailBody,
        bodyHtml: bodyHtml || null,
        status: 'PENDING',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null,
        userAgent: req.headers.get('user-agent') || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send email via SMTP
    const result = await sendEmail({
      to,
      cc,
      bcc,
      subject,
      text: emailBody,
      html: bodyHtml,
    });

    // Update email record with result
    const updatedEmail = await prisma.email.update({
      where: { id: email.id },
      data: {
        status: result.success ? 'SENT' : 'FAILED',
        sentAt: result.success ? new Date() : null,
        messageId: result.messageId || null,
        smtpResponse: result.response || null,
        failureReason: result.error || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    const response: APIResponse<typeof updatedEmail> = {
      success: result.success,
      data: updatedEmail,
      message: result.success ? 'Email sent successfully' : 'Failed to send email',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: result.success ? 200 : 500 });
  } catch (error: any) {
    console.error('Error sending email:', error);
    const response: APIResponse = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || 'Failed to send email',
      },
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(response, { status: 500 });
  }
}

