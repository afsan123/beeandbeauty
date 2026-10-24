import { NextRequest, NextResponse } from 'next/server';
import { subscribeNewsletter } from '../../../lib/services/newsletterService';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../lib/security/rateLimit.ts';

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`newsletter:${getClientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const { email } = await req.json();
    const result = await subscribeNewsletter(email);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Newsletter subscription failed.';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
