import { z } from 'zod';
import { Company as PrismaCompany, ContactSource as PrismaContactSource } from '@prisma/client';

// Re-export Prisma types
export type { Company, ContactSource } from '@prisma/client';

// Tech Stack Options (20-30 technologies)
export const TECH_STACK_OPTIONS = [
  // Languages
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Go',
  'Rust',
  'Ruby',
  'PHP',
  'C#',
  'Swift',
  'Kotlin',
  
  // Frontend Frameworks
  'React',
  'Vue.js',
  'Angular',
  'Next.js',
  'Svelte',
  
  // Backend Frameworks
  'Node.js',
  'Django',
  'Flask',
  'Spring Boot',
  'Express.js',
  'FastAPI',
  'Ruby on Rails',
  
  // Mobile
  'React Native',
  'Flutter',
  'iOS Native',
  'Android Native',
  
  // Database
  'PostgreSQL',
  'MongoDB',
  'MySQL',
  'Redis',
  'Elasticsearch',
  
  // Cloud & DevOps
  'AWS',
  'Google Cloud',
  'Azure',
  'Docker',
  'Kubernetes',
  
  // AI/ML
  'TensorFlow',
  'PyTorch',
  'Machine Learning',
  'AI/LLM',
  
  // Other
  'GraphQL',
  'REST API',
  'Microservices',
  'Blockchain',
  'Web3',
] as const;

export const COMPANY_SIZE_OPTIONS = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
] as const;

export const FUNDING_STAGE_OPTIONS = [
  'Pre-seed',
  'Seed',
  'Series A',
  'Series B',
  'Series C',
  'Series D+',
  'IPO',
  'Bootstrapped',
] as const;

// Validation Schemas
export const CreateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  tagline: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  companySize: z.string().optional(),
  techStack: z.array(z.string()).default([]),
  domain: z.string().optional(),
  sector: z.string().optional(),
  vision: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  fundingStage: z.string().optional(),
  acceleratorId: z.string().uuid().optional().or(z.literal('')),
  
  // Contact Source (created inline with company)
  contactSource: z.object({
    instagram: z.string().optional().or(z.literal('')),
    linkedin: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    facebook: z.string().optional().or(z.literal('')),
    contactNumber: z.string().optional().or(z.literal('')),
    emails: z.array(z.string().email()).default([]),
  }).optional(),
});

export const UpdateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').optional(),
  tagline: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  companySize: z.string().optional(),
  techStack: z.array(z.string()).optional(),
  domain: z.string().optional(),
  sector: z.string().optional(),
  vision: z.string().optional(),
  foundedYear: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  website: z.string().url().optional().or(z.literal('')),
  logoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().optional(),
  fundingStage: z.string().optional(),
  acceleratorId: z.string().uuid().optional().or(z.literal('')),
  
  // Contact Source updates
  contactSource: z.object({
    instagram: z.string().optional().or(z.literal('')),
    linkedin: z.string().optional().or(z.literal('')),
    twitter: z.string().optional().or(z.literal('')),
    facebook: z.string().optional().or(z.literal('')),
    contactNumber: z.string().optional().or(z.literal('')),
    emails: z.array(z.string().email()).optional(),
  }).optional(),
});

export type CreateCompanyInput = z.infer<typeof CreateCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof UpdateCompanySchema>;

// Extended types with relations
export interface CompanyWithRelations extends PrismaCompany {
  accelerator?: {
    id: string;
    title: string;
  } | null;
  contactSource?: PrismaContactSource | null;
}

