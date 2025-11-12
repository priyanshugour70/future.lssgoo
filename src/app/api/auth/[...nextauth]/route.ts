import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, createToken, setSessionCookie } from '@/lib/auth';
import { createSession } from '@/lib/session';

// Simple Google OAuth handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  const { nextauth } = await context.params;
  const provider = nextauth[0];

  if (provider === 'signin' && nextauth[1] === 'google') {
    // Redirect to Google OAuth
    const origin = request.nextUrl.origin;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${origin}/api/auth/callback/google`;
    
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    })}`;

    return NextResponse.redirect(googleAuthUrl);
  }

  if (provider === 'callback' && nextauth[1] === 'google') {
    // Handle Google OAuth callback
    const code = request.nextUrl.searchParams.get('code');

    if (!code) {
      return NextResponse.redirect(`${request.nextUrl.origin}/?error=oauth_failed`);
    }

    try {
      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          redirect_uri: `${request.nextUrl.origin}/api/auth/callback/google`,
          grant_type: 'authorization_code',
        }),
      });

      const tokens = await tokenResponse.json();

      // Get user info
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      const googleUser = await userInfoResponse.json();

      // Find or create user
      let user = await prisma.user.findUnique({
        where: { email: googleUser.email },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            name: googleUser.name,
            image: googleUser.picture,
            avatarUrl: googleUser.picture,
            authProvider: 'GOOGLE',
            emailVerified: new Date(),
          },
        });
      } else {
        // Update user info
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: googleUser.name || user.name,
            image: googleUser.picture || user.image,
            avatarUrl: googleUser.picture || user.avatarUrl,
            lastLoginAt: new Date(),
          },
        });
      }

      // Create or update account
      await prisma.account.upsert({
        where: {
          provider_providerAccountId: {
            provider: 'google',
            providerAccountId: googleUser.id,
          },
        },
        create: {
          userId: user.id,
          type: 'oauth',
          provider: 'google',
          providerAccountId: googleUser.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
          token_type: tokens.token_type,
          scope: tokens.scope,
          id_token: tokens.id_token,
        },
        update: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: Math.floor(Date.now() / 1000) + tokens.expires_in,
        },
      });

      // Create session
      const headersList = request.headers;
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

      // Redirect to home
      return NextResponse.redirect(`${request.nextUrl.origin}/`);
    } catch (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(`${request.nextUrl.origin}/?error=oauth_failed`);
    }
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
