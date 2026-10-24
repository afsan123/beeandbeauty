import { cleanEnv, getSiteUrl } from '../env.ts';

export interface TransactionalEmail {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendTransactionalEmail(message: TransactionalEmail): Promise<boolean> {
  const apiKey = cleanEnv(process.env.RESEND_API_KEY);
  if (!apiKey) return false;

  const from =
    cleanEnv(process.env.RESEND_FROM_EMAIL) ||
    `Bee & Beauty <${cleanEnv(process.env.NEXT_PUBLIC_OFFICIAL_EMAIL) || 'beeandbeauty.bd@gmail.com'}>`;

  let res: Response;
  try {
    res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [message.to],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
    });
  } catch (err) {
    console.error('[email] Resend request failed:', err);
    return false;
  }

  if (!res.ok) {
    console.error('[email] Resend rejected the message:', res.status);
  }
  return res.ok;
}

export function isResendConfigured(): boolean {
  return Boolean(cleanEnv(process.env.RESEND_API_KEY));
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildSetPasswordEmail(params: {
  name: string;
  orderNumber: string;
  setPasswordUrl: string;
}): { subject: string; html: string; text: string } {
  const site = getSiteUrl();
  const name = escapeHtml(params.name);
  const orderNumber = escapeHtml(params.orderNumber);
  const url = escapeHtml(params.setPasswordUrl);
  const subject = `Your Bee & Beauty order ${params.orderNumber} — set your account password`;
  const text = `Hi ${params.name},\n\nYour order ${params.orderNumber} is confirmed. Create a password to track this and future orders:\n${params.setPasswordUrl}\n\nWhatsApp concierge: +8801754502430\n${site}`;
  const html = `
    <div style="font-family:Karla,Arial,sans-serif;color:#2C2C2C;background:#FFF9F5;padding:24px">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;color:#6A1B6D">Order confirmed</h1>
      <p>Hi ${name},</p>
      <p>Your Bee &amp; Beauty order <strong>${orderNumber}</strong> is confirmed. We emailed this receipt — we have not sent an SMS.</p>
      <p>Create a password to view your order history:</p>
      <p><a href="${url}" style="background:#6A1B6D;color:#fff;padding:12px 18px;text-decoration:none;border-radius:4px">Set password</a></p>
      <p>Concierge: +8801754502430 · beeandbeauty.bd@gmail.com</p>
    </div>
  `;
  return { subject, html, text };
}

export function buildPasswordResetEmail(params: {
  resetUrl: string;
}): { subject: string; html: string; text: string } {
  const url = escapeHtml(params.resetUrl);
  const subject = 'Reset your Bee & Beauty password';
  const text = `We received a request to reset your Bee & Beauty password. Choose a new one here:\n${params.resetUrl}\n\nIf you did not ask for this, you can ignore this email.`;
  const html = `
    <div style="font-family:Karla,Arial,sans-serif;color:#2C2C2C;background:#FFF9F5;padding:24px">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;color:#6A1B6D">Reset your password</h1>
      <p>We received a request to reset your Bee &amp; Beauty password.</p>
      <p><a href="${url}" style="background:#6A1B6D;color:#fff;padding:12px 18px;text-decoration:none;border-radius:4px">Choose a new password</a></p>
      <p>If you did not ask for this, you can ignore this email.</p>
    </div>
  `;
  return { subject, html, text };
}
