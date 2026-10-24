import { NextResponse, type NextRequest } from 'next/server.js';
import type { EmailOtpType } from '@supabase/supabase-js';
import { safeNextPath } from '../../../lib/security/safeRedirect.ts';
import { createServerSupabaseClient } from '../../../lib/supabase/server.ts';

const OTP_TYPES: EmailOtpType[] = ['invite', 'recovery', 'signup', 'magiclink', 'email', 'email_change'];

/**
 * Supabase Auth email landing route.
 *
 * - `?token_hash=…&type=invite|recovery` (our Resend emails, or a Supabase
 *   template using {{ .TokenHash }}): verified server-side with verifyOtp.
 * - `?code=…` (PKCE, e.g. "Forgot password?" via Supabase's own mailer):
 *   exchanged with exchangeCodeForSession.
 * - Neither: Supabase's built-in invite/admin emails use the implicit flow and
 *   put tokens in the URL fragment, which never reaches the server. We redirect
 *   to `next`; the browser keeps the fragment and the set-password page picks
 *   it up client-side.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = safeNextPath(searchParams.get('next'), '/account');

  const failed = (reason: string) => {
    const url = new URL('/account/login', origin);
    url.searchParams.set('error', 'link');
    console.warn('[auth/callback] verification failed:', reason);
    return NextResponse.redirect(url);
  };

  if (searchParams.get('error')) {
    return failed(searchParams.get('error_code') || searchParams.get('error') || 'provider_error');
  }

  if (!code && !tokenHash) {
    return NextResponse.redirect(new URL(next, origin));
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) return failed('supabase_unconfigured');

  if (tokenHash) {
    if (!type || !OTP_TYPES.includes(type)) return failed('invalid_type');
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (error) return failed(error.code || error.message);
    return NextResponse.redirect(new URL(next, origin));
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code!);
  if (error) return failed(error.code || error.message);
  return NextResponse.redirect(new URL(next, origin));
}
