import prisma from '@/lib/prisma';
import {
  hashPassword,
  verifyPassword,
  createToken,
  setSessionCookie,
  removeSessionCookie,
} from '@/lib/auth';
import { createSession, deleteUserSessions, getCurrentSession } from '@/lib/session';
import {
  User,
  Session,
  Role,
  AuthProvider,
  AuthResponse,
  SessionResponse,
  SignInRequest,
  SignUpRequest,
} from '@/types';
import { headers } from 'next/headers';

export class AuthService {
  // Get current session (server-side)
  static async getSession(): Promise<SessionResponse['data']> {
    return await getCurrentSession();
  }

  // Sign in with email/password
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (!user || !user.password) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Verify password
      const isValid = await verifyPassword(credentials.password, user.password);

      if (!isValid) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Create session
      const headersList = await headers();
      const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
      const userAgent = headersList.get('user-agent') || undefined;

      const session = await createSession(user.id, ipAddress, userAgent);

      // Create JWT token
      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: session.id,
      });

      // Set cookie
      await setSessionCookie(token);

      return {
        success: true,
        data: {
          user: user as User,
          session: session as Session,
          accessToken: token,
          refreshToken: token,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: {
          code: 'SIGN_IN_FAILED',
          message: error.message || 'Sign in failed',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Sign up with email/password
  static async signUp(credentials: SignUpRequest): Promise<AuthResponse> {
    try {
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: credentials.email },
      });

      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'ALREADY_EXISTS',
            message: 'User with this email already exists',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Hash password
      const hashedPassword = await hashPassword(credentials.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: credentials.email,
          password: hashedPassword,
          name: credentials.name,
          authProvider: AuthProvider.EMAIL,
          emailVerified: new Date(), // Auto-verify for now
        },
      });

      // Create session
      const headersList = await headers();
      const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || undefined;
      const userAgent = headersList.get('user-agent') || undefined;

      const session = await createSession(user.id, ipAddress, userAgent);

      // Create JWT token
      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: session.id,
      });

      // Set cookie
      await setSessionCookie(token);

      return {
        success: true,
        data: {
          user: user as User,
          session: session as Session,
          accessToken: token,
          refreshToken: token,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return {
        success: false,
        error: {
          code: 'SIGN_UP_FAILED',
          message: error.message || 'Sign up failed',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Sign out
  static async signOut(): Promise<{ success: boolean }> {
    try {
      const { session } = await getCurrentSession();

      if (session) {
        await prisma.session.delete({
          where: { id: session.id },
        });
      }

      await removeSessionCookie();

      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false };
    }
  }

  // Refresh session
  static async refreshSession(): Promise<AuthResponse> {
    try {
      const { user, session } = await getCurrentSession();

      if (!user || !session) {
        return {
          success: false,
          error: {
            code: 'INVALID_SESSION',
            message: 'No valid session found',
          },
          timestamp: new Date().toISOString(),
        };
      }

      // Create new token
      const token = await createToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionId: session.id,
      });

      // Update cookie
      await setSessionCookie(token);

      return {
        success: true,
        data: {
          user: user as User,
          session: session as Session,
          accessToken: token,
          refreshToken: token,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: error.message || 'Session refresh failed',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Check if user has role
  static hasRole(user: User | null, role: Role): boolean {
    if (!user) return false;
    if (role === Role.ADMIN) {
      return user.role === Role.ADMIN;
    }
    return user.role === Role.USER || user.role === Role.ADMIN;
  }

  // Check if user has permission
  static hasPermission(user: User | null, resource: string, action: string): boolean {
    if (!user) return false;

    // Admins have all permissions
    if (user.role === Role.ADMIN) return true;

    // Add custom permission logic here
    // For now, users can only read
    if (action === 'read') return true;

    return false;
  }
}
