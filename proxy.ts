import { NextResponse } from 'next/server.js';
import type { NextRequest } from 'next/server.js';
import {
  verifyAdminToken,
  SESSION_COOKIE_NAME,
} from './lib/services/adminAuthToken.ts';

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set('X-DNS-Prefetch-Control', 'on');
  return res;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Executive Admin Web Routes Protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = verifyAdminToken(token);

    // If accessing /admin/login while already authenticated -> redirect to dashboard
    if (pathname === '/admin/login') {
      if (user) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    // Unauthenticated access to any protected /admin route -> redirect to login
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Executive Admin API Routes Protection
  if (pathname.startsWith('/api/admin')) {
    // Whitelist login authentication and session telemetry routes
    const isPublicAuthRoute =
      pathname === '/api/admin/auth/login' || pathname === '/api/admin/auth/me';

    if (!isPublicAuthRoute) {
      const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      const user = verifyAdminToken(token);

      if (!user) {
        return applySecurityHeaders(
          NextResponse.json(
            { error: 'Unauthorized executive access. Please authenticate at /admin/login.' },
            { status: 401 }
          )
        );
      }
    }
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icon.svg (icon file)
     * - public asset extensions (svg, png, jpg, jpeg, gif, webp, mp4, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
};
