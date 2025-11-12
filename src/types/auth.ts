import { z } from 'zod';
import { APIResponse } from './api';
import {
  Role,
  AuthProvider,
  type User,
  type Session,
} from '@prisma/client';

// Re-export Prisma types
export { Role, AuthProvider };
export type { User, Session };

// Auth Response Types
export interface AuthResponse extends APIResponse<{
  user: User;
  session: Session;
  accessToken: string;
  refreshToken: string;
}> {}

export interface SessionResponse extends APIResponse<{
  session: Session | null;
  user: User | null;
}> {}

export interface UserResponse extends APIResponse<User> {}

// Auth Request Schemas
export const SignInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  avatarUrl: z.string().url('Invalid URL').optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

// Request Types
export type SignInRequest = z.infer<typeof SignInSchema>;
export type SignUpRequest = z.infer<typeof SignUpSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>;
export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>;

// OAuth Types
export interface OAuthCallbackParams {
  code?: string;
  state?: string;
  error?: string;
  error_description?: string;
}

export interface OAuthState {
  provider: AuthProvider;
  redirectUrl?: string;
  timestamp: number;
}

// Permission Types
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
}

export type PermissionCheck = (user: User, permission: Permission) => boolean;

