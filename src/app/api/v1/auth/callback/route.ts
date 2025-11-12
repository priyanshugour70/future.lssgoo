import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get('next') ?? '/';

  // Redirect to the next URL or home
  return NextResponse.redirect(new URL(next, request.url));
}
