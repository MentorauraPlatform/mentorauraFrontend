import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PATH = '/auth?mode=login';

function isProtectedRoute(pathname: string): boolean {
  // Public directory and profile routes are strictly public
  if (pathname === '/mentors' || pathname.startsWith('/mentors/')) {
    return false;
  }

  return (
    pathname === '/mentor' ||
    pathname.startsWith('/mentor/') ||
    pathname === '/mentee' ||
    pathname.startsWith('/mentee/') ||
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth?mode=login', request.url));
  }

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth?mode=register', request.url));
  }

  if (isProtectedRoute(pathname)) {
    const token =
      request.cookies.get('access_token')?.value ||
      request.cookies.get('accessToken')?.value;
    const refreshToken =
      request.cookies.get('refresh_token')?.value ||
      request.cookies.get('refreshToken')?.value;

    if (!token && !refreshToken) {
      return NextResponse.redirect(new URL(AUTH_PATH, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

