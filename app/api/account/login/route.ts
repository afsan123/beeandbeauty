import { NextResponse } from 'next/server.js';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../../lib/security/rateLimit.ts';
import { createServerSupabaseClient } from '../../../../lib/supabase/server.ts';

export async function POST(request: Request) {
  const limit = checkRateLimit(`account-login:${getClientIp(request)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), { status: 429 });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: 'Customer accounts are unavailable until Supabase public keys are configured.' },
      { status: 503 }
    );
  }

  const { email, password } = await request.json();
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: String(email).trim().toLowerCase(),
    password: String(password),
  });

  if (error || !data.user) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    user: { id: data.user.id, email: data.user.email },
  });
}
