import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || 'your-secret-key-change-in-production'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value;

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if ((payload as any).role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Protect API routes that require authentication
  if (
    request.nextUrl.pathname.startsWith('/api/v1/') &&
    !request.nextUrl.pathname.startsWith('/api/v1/auth/')
  ) {
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
        },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth (NextAuth routes)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

