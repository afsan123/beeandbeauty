import { NextResponse } from 'next/server.js';
import { cookies } from 'next/headers.js';
import {
  resolveAdminUser,
  createAdminToken,
  SESSION_COOKIE_NAME,
} from '../../../../../lib/services/adminAuth.ts';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../../../lib/security/rateLimit.ts';
import { csrfFailureResponse, isSameOriginRequest } from '../../../../../lib/security/csrf.ts';

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(csrfFailureResponse(), { status: 403 });
  }

  const limit = checkRateLimit(`admin-login:${getClientIp(request)}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const body = await request.json();
    const { email, password } = body;
    const adminUser = resolveAdminUser(email, password);

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid executive credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    const token = createAdminToken(adminUser);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return NextResponse.json({
      success: true,
      user: adminUser,
      message: 'Executive session initiated.',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Authentication error.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
