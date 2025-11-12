import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Redirect to NextAuth Google provider
  const origin = request.nextUrl.origin;
  const callbackUrl = `${origin}/`;
  
  return NextResponse.redirect(
    `${origin}/api/auth/signin/google?callbackUrl=${encodeURIComponent(callbackUrl)}`
  );
}
