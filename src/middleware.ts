import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/auth?mode=login', request.url));
  }

  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/auth?mode=register', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

