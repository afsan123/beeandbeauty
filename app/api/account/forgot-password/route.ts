import { NextResponse } from 'next/server.js';
import { requestPasswordReset } from '../../../../lib/services/customerAccount.ts';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../../lib/security/rateLimit.ts';
import { createServerSupabaseClient } from '../../../../lib/supabase/server.ts';

const GENERIC_OK = {
  success: true,
  message: 'If an account exists for that email, we have sent a link to reset your password.',
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`account-forgot:${ip}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), { status: 429 });
  }

  let email = '';
  try {
    const body = await request.json();
    email = String(body?.email || '').trim().toLowerCase();
  } catch {
    // fall through to validation
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  }

  const perEmail = checkRateLimit(`account-forgot-email:${email}`, 3, 60 * 60 * 1000);
  if (!perEmail.ok) {
    // Same response as success so the endpoint cannot be used to probe accounts.
    return NextResponse.json(GENERIC_OK);
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Customer accounts are unavailable right now.' }, { status: 503 });
  }

  try {
    // The cookie-aware server client uses PKCE, so the code verifier is stored
    // in this browser and /auth/callback can exchange the emailed code.
    await requestPasswordReset(email, (address, redirectTo) =>
      supabase.auth.resetPasswordForEmail(address, { redirectTo })
    );
  } catch (err) {
    console.error('[account] forgot-password failed:', err);
  }

  return NextResponse.json(GENERIC_OK);
}
