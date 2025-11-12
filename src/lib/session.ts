import prisma from './prisma';
import { getSessionFromCookie } from './auth';
import { User, Session } from '@prisma/client';

export interface SessionData {
  user: User | null;
  session: Session | null;
}

// Get current session with user
export async function getCurrentSession(): Promise<SessionData> {
  try {
    const payload = await getSessionFromCookie();
    
    if (!payload) {
      return { user: null, session: null };
    }
    
    // Get session from database
    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    });
    
    if (!session || session.expires < new Date()) {
      return { user: null, session: null };
    }
    
    // Update last active
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: new Date() },
    });
    
    return {
      user: session.user,
      session,
    };
  } catch (error) {
    console.error('Get session error:', error);
    return { user: null, session: null };
  }
}

// Create new session
export async function createSession(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<Session> {
  const sessionToken = crypto.randomUUID();
  const expires = new Date();
  expires.setDate(expires.getDate() + 7); // 7 days
  
  return await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
      ipAddress,
      userAgent,
    },
  });
}

// Delete session
export async function deleteSession(sessionId: string): Promise<void> {
  await prisma.session.delete({
    where: { id: sessionId },
  });
}

// Delete all user sessions
export async function deleteUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({
    where: { userId },
  });
}

