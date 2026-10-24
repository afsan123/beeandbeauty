import { getSiteUrl } from '../env.ts';
import { normalizeBdPhone } from '../security/phone.ts';
import { assertSupabaseAdminConfigured, tryGetSupabaseAdmin } from '../supabase/admin.ts';
import { buildSetPasswordEmail, sendTransactionalEmail } from './emailService.ts';

export interface ProvisionResult {
  customerId: string | null;
  accountCreated: boolean;
  emailSent: boolean;
  emailChannel: 'resend' | 'supabase' | 'none';
  setPasswordUrl?: string;
}

export async function provisionCustomerForOrder(input: {
  orderId: string;
  email: string;
  fullName: string;
  phone: string;
}): Promise<ProvisionResult> {
  const admin = tryGetSupabaseAdmin();
  if (!admin) {
    return { customerId: null, accountCreated: false, emailSent: false, emailChannel: 'none' };
  }

  const email = input.email.trim().toLowerCase();
  const phone = normalizeBdPhone(input.phone);
  const redirectTo = `${getSiteUrl()}/auth/callback?next=/account/set-password`;

  let userId: string | null = null;
  let accountCreated = false;

  const { data: existingProfile } = await admin
    .from('customer_profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile?.id) {
    userId = existingProfile.id;
  } else {
    const created = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: input.fullName, phone },
      app_metadata: { role: 'customer' },
    });

    if (created.data.user) {
      userId = created.data.user.id;
      accountCreated = true;
    } else {
      const link = await admin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo },
      });
      userId = link.data.user?.id || null;
    }
  }

  if (!userId) {
    return { customerId: null, accountCreated: false, emailSent: false, emailChannel: 'none' };
  }

  await admin.from('customer_profiles').upsert({
    id: userId,
    email,
    phone,
    full_name: input.fullName,
    updated_at: new Date().toISOString(),
  });

  await admin.from('orders').update({ customer_id: userId }).eq('id', input.orderId);

  const { data: linkData } = await admin.auth.admin.generateLink({
    type: accountCreated ? 'invite' : 'recovery',
    email,
    options: { redirectTo },
  });

  const actionLink = linkData?.properties?.action_link;
  const emailBody = buildSetPasswordEmail({
    name: input.fullName,
    orderNumber: input.orderId,
    setPasswordUrl: actionLink || `${getSiteUrl()}/account/set-password`,
  });

  if (await sendTransactionalEmail({ to: email, ...emailBody })) {
    return {
      customerId: userId,
      accountCreated,
      emailSent: true,
      emailChannel: 'resend',
      setPasswordUrl: actionLink,
    };
  }

  if (accountCreated) {
    const invited = await admin.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (!invited.error) {
      return {
        customerId: userId,
        accountCreated,
        emailSent: true,
        emailChannel: 'supabase',
        setPasswordUrl: actionLink,
      };
    }
  }

  return {
    customerId: userId,
    accountCreated,
    emailSent: false,
    emailChannel: 'none',
    setPasswordUrl: actionLink,
  };
}

export function requireConfiguredCustomerAuth() {
  assertSupabaseAdminConfigured();
}
