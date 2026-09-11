import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read httpOnly cookie set by backend
  const authToken = request.cookies.get('authToken')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard');


  // ── Not logged in → block dashboard ──────────────────────────────────────
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Already logged in → skip login page ──────────────────────────────────


  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};