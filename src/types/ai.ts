import { z } from 'zod';
import { Conversation, Message, MessageRole } from '@prisma/client';

// Re-export Prisma types
export type { Conversation, Message, MessageRole } from '@prisma/client';

// Validation Schemas
export const SendMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1, 'Message is required'),
  model: z.string().default('gemini-2.0-flash-exp'),
});

export type SendMessageInput = z.infer<typeof SendMessageSchema>;

// Extended types with relations
export interface ConversationWithMessages extends Conversation {
  messages: Message[];
  _count?: {
    messages: number;
  };
}

export interface MessageWithMetadata extends Message {
  conversation?: {
    id: string;
    title: string | null;
  };
}

