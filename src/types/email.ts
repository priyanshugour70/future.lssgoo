import { z } from 'zod';
import { Email as PrismaEmail, EmailStatus } from '@prisma/client';

// Re-export Prisma types
export type { Email, EmailStatus } from '@prisma/client';
export { EmailStatus as EmailStatusEnum } from '@prisma/client';

// Validation Schemas
export const SendEmailSchema = z.object({
  to: z.array(z.string().email()).min(1, 'At least one recipient is required'),
  cc: z.array(z.string().email()).default([]),
  bcc: z.array(z.string().email()).default([]),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Email body is required'),
  bodyHtml: z.string().optional(),
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

// Extended type with sender info
export interface EmailWithSender extends PrismaEmail {
  sender: {
    id: string;
    name: string | null;
    email: string;
  };
}

