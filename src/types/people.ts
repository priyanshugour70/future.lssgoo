import { z } from 'zod';
import { People as PrismaPeople, PeopleContact as PrismaPeopleContact } from '@prisma/client';

// Re-export Prisma types
export type { People, PeopleContact } from '@prisma/client';

// Validation Schemas
export const CreatePeopleSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  passion: z.string().optional(),
  bio: z.string().optional(),
  profileUrl: z.string().url().optional().or(z.literal('')),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.array(z.string()).default([]),
  companyId: z.string().uuid().optional().or(z.literal('')),
  
  // Contact information (created inline with person)
  contact: z.object({
    linkedin: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    phoneNumber: z.string().optional().or(z.literal('')),
  }).optional(),
});

export const UpdatePeopleSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').optional(),
  passion: z.string().optional(),
  bio: z.string().optional(),
  profileUrl: z.string().url().optional().or(z.literal('')),
  photoUrl: z.string().url().optional().or(z.literal('')),
  notes: z.array(z.string()).optional(),
  companyId: z.string().uuid().optional().or(z.literal('')),
  
  // Contact updates
  contact: z.object({
    linkedin: z.string().optional().or(z.literal('')),
    instagram: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    email: z.string().email().optional().or(z.literal('')),
    phoneNumber: z.string().optional().or(z.literal('')),
  }).optional(),
});

export type CreatePeopleInput = z.infer<typeof CreatePeopleSchema>;
export type UpdatePeopleInput = z.infer<typeof UpdatePeopleSchema>;

// Extended types with relations
export interface PeopleWithRelations extends PrismaPeople {
  company?: {
    id: string;
    name: string;
  } | null;
  contact?: PrismaPeopleContact | null;
}

