import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Read httpOnly cookie set by backend
  const authToken = request.cookies.get('authToken')?.value;

  const isProtectedRoute = pathname.startsWith('/dashboard');
  const isLoginPage = pathname === '/login';

  // ── Not logged in → block dashboard ──────────────────────────────────────
  if (isProtectedRoute && !authToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // ── Already logged in → skip login page ──────────────────────────────────
  if (isLoginPage && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};