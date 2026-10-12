import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static assets and API routes bypass middleware
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/models') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Redirect legacy dashboard routes to new portal routes
  if (pathname === '/dashboard/student') {
    return NextResponse.redirect(new URL('/student/dashboard', req.url));
  }
  if (pathname === '/dashboard/examiner') {
    return NextResponse.redirect(new URL('/examiner/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
