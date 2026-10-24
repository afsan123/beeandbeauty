import type { SupabaseClient, User } from '@supabase/supabase-js';
import { getSiteUrl } from '../env.ts';
import { normalizeBdPhone } from '../security/phone.ts';
import { assertSupabaseAdminConfigured, tryGetSupabaseAdmin } from '../supabase/admin.ts';
import {
  buildPasswordResetEmail,
  buildSetPasswordEmail,
  isResendConfigured,
  sendTransactionalEmail,
} from './emailService.ts';

export const SET_PASSWORD_PATH = '/account/set-password';

export interface ProvisionResult {
  customerId: string | null;
  accountCreated: boolean;
  /** Profile upsert and orders.customer_id link both succeeded. */
  linked: boolean;
  emailSent: boolean;
  emailChannel: 'resend' | 'supabase' | 'none';
}

type LinkType = 'invite' | 'recovery';

/** Where Supabase-sent emails redirect after verification. */
export function getAuthRedirectUrl(next = SET_PASSWORD_PATH): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(next)}`;
}

/**
 * Link we put in our own (Resend) emails. Uses the hashed token so
 * /auth/callback can call verifyOtp server-side — works in any browser,
 * unlike PKCE links which need the original browser's code verifier.
 */
export function buildTokenHashLink(hashedToken: string, type: LinkType, next = SET_PASSWORD_PATH): string {
  const params = new URLSearchParams({ token_hash: hashedToken, type, next });
  return `${getSiteUrl()}/auth/callback?${params.toString()}`;
}

function isAlreadyRegistered(error: { code?: string; status?: number; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === 'email_exists' ||
    error.code === 'user_already_exists' ||
    error.status === 422 ||
    /already (been )?registered|already exists/i.test(error.message || '')
  );
}

async function generateLink(
  admin: SupabaseClient,
  type: LinkType,
  email: string,
  metadata?: Record<string, unknown>
): Promise<{ user: User | null; hashedToken: string | null; error: { code?: string; status?: number; message?: string } | null }> {
  const options = { redirectTo: getAuthRedirectUrl(), ...(type === 'invite' && metadata ? { data: metadata } : {}) };
  const { data, error } = await admin.auth.admin.generateLink({ type, email, options } as Parameters<
    SupabaseClient['auth']['admin']['generateLink']
  >[0]);
  return {
    user: data?.user ?? null,
    hashedToken: data?.properties?.hashed_token ?? null,
    error: error ? { code: (error as { code?: string }).code, status: error.status, message: error.message } : null,
  };
}

/**
 * Create (or find) the customer's auth account for an order and email them a
 * set-password link. Best effort: callers must never fail a saved order
 * because of anything that happens here.
 *
 * - New customer:      generateLink('invite')   → Resend, else inviteUserByEmail
 * - Existing customer: generateLink('recovery') → Resend, else resetPasswordForEmail
 *   (skipped when the customer has already signed in with a password)
 */
export async function provisionCustomerForOrder(input: {
  orderId: string;
  orderNumber: string;
  email: string;
  fullName: string;
  phone: string;
}): Promise<ProvisionResult> {
  const none: ProvisionResult = {
    customerId: null,
    accountCreated: false,
    linked: false,
    emailSent: false,
    emailChannel: 'none',
  };
  const admin = tryGetSupabaseAdmin();
  if (!admin) return none;

  const email = input.email.trim().toLowerCase();
  const phone = normalizeBdPhone(input.phone);
  const metadata = { full_name: input.fullName, phone };
  const useResend = isResendConfigured();

  let user: User | null = null;
  let accountCreated = false;
  let hashedToken: string | null = null;
  let linkType: LinkType = 'recovery';
  let emailSent = false;
  let emailChannel: ProvisionResult['emailChannel'] = 'none';

  const { data: existingProfile, error: profileLookupError } = await admin
    .from('customer_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (profileLookupError) {
    console.error('[account] customer_profiles lookup failed:', profileLookupError.message);
  }

  // 1. New customer → invite
  if (!existingProfile?.id) {
    if (useResend) {
      const invite = await generateLink(admin, 'invite', email, metadata);
      if (invite.user) {
        user = invite.user;
        hashedToken = invite.hashedToken;
        linkType = 'invite';
        accountCreated = true;
      } else if (!isAlreadyRegistered(invite.error)) {
        console.error('[account] generateLink(invite) failed:', invite.error?.message);
        return none;
      }
    } else {
      const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
        redirectTo: getAuthRedirectUrl(),
        data: metadata,
      });
      if (data?.user && !error) {
        user = data.user;
        accountCreated = true;
        emailSent = true;
        emailChannel = 'supabase';
      } else if (!isAlreadyRegistered(error)) {
        console.error('[account] inviteUserByEmail failed:', error?.message);
        return none;
      }
    }
  }

  // 2. Existing customer → recovery
  if (!user) {
    const recovery = await generateLink(admin, 'recovery', email);
    if (!recovery.user) {
      console.error('[account] generateLink(recovery) failed:', recovery.error?.message);
      return none;
    }
    user = recovery.user;
    hashedToken = recovery.hashedToken;
    linkType = 'recovery';
  }

  const userId = user.id;

  // 3. Profile + order link. Errors are logged and reported, never thrown.
  let linked = true;
  const { error: upsertError } = await admin.from('customer_profiles').upsert({
    id: userId,
    email,
    phone,
    full_name: input.fullName,
    updated_at: new Date().toISOString(),
  });
  if (upsertError) {
    linked = false;
    console.error('[account] customer_profiles upsert failed:', upsertError.code, upsertError.message);
  } else {
    const { error: linkError } = await admin
      .from('orders')
      .update({ customer_id: userId })
      .eq('id', input.orderId);
    if (linkError) {
      linked = false;
      console.error('[account] orders.customer_id link failed:', linkError.code, linkError.message);
    }
  }

  // 4. Email (if not already sent by inviteUserByEmail).
  const hasPassword = !accountCreated && Boolean(user.last_sign_in_at);
  if (!emailSent && !hasPassword) {
    if (useResend && hashedToken) {
      const message = buildSetPasswordEmail({
        name: input.fullName,
        orderNumber: input.orderNumber,
        setPasswordUrl: buildTokenHashLink(hashedToken, linkType),
      });
      emailSent = await sendTransactionalEmail({ to: email, ...message });
      emailChannel = emailSent ? 'resend' : 'none';
    } else if (!useResend) {
      const { error } = await admin.auth.resetPasswordForEmail(email, { redirectTo: getAuthRedirectUrl() });
      if (error) {
        console.error('[account] resetPasswordForEmail failed:', error.message);
      } else {
        emailSent = true;
        emailChannel = 'supabase';
      }
    }
  }

  return { customerId: userId, accountCreated, linked, emailSent, emailChannel };
}

/**
 * "Forgot password?" — always resolves without revealing whether the email
 * has an account. Uses Resend + a token_hash link when configured, otherwise
 * Supabase's own email via the cookie-aware (PKCE) server client.
 */
export async function requestPasswordReset(
  email: string,
  sendViaSupabase: (email: string, redirectTo: string) => Promise<{ error: { message: string } | null }>
): Promise<void> {
  const clean = email.trim().toLowerCase();
  const admin = tryGetSupabaseAdmin();

  if (admin && isResendConfigured()) {
    const recovery = await generateLink(admin, 'recovery', clean);
    if (!recovery.hashedToken) {
      // Unknown email (or Auth error) — do not reveal which.
      if (recovery.error && !/not found|user.*not/i.test(recovery.error.message || '')) {
        console.error('[account] generateLink(recovery) for reset failed:', recovery.error.message);
      }
      return;
    }
    const message = buildPasswordResetEmail({ resetUrl: buildTokenHashLink(recovery.hashedToken, 'recovery') });
    await sendTransactionalEmail({ to: clean, ...message });
    return;
  }

  const { error } = await sendViaSupabase(clean, getAuthRedirectUrl());
  if (error) {
    console.error('[account] resetPasswordForEmail failed:', error.message);
  }
}

export function requireConfiguredCustomerAuth() {
  assertSupabaseAdminConfigured();
}
