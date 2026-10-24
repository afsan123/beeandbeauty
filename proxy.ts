import { NextResponse } from 'next/server.js';
import type { NextRequest } from 'next/server.js';
import {
  verifyAdminToken,
  SESSION_COOKIE_NAME,
} from './lib/services/adminAuthToken.ts';
import { applySecurityHeaders } from './lib/security/headers.ts';
import { refreshCustomerSession } from './lib/supabase/proxySession.ts';
import { csrfFailureResponse, isSameOriginRequest } from './lib/security/csrf.ts';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const user = verifyAdminToken(token);

    if (pathname === '/admin/login') {
      if (user) {
        return applySecurityHeaders(NextResponse.redirect(new URL('/admin', request.url)));
      }
      return applySecurityHeaders(NextResponse.next());
    }

    if (!user) {
      return applySecurityHeaders(NextResponse.redirect(new URL('/admin/login', request.url)));
    }

    return applySecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/api/admin')) {
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

      if (!isSameOriginRequest(request)) {
        return applySecurityHeaders(
          NextResponse.json(csrfFailureResponse(), { status: 403 })
        );
      }
    }

    return applySecurityHeaders(NextResponse.next());
  }

  const customerResponse = await refreshCustomerSession(request);
  return applySecurityHeaders(customerResponse);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm)$).*)',
  ],
};
