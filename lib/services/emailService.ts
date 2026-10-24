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

  const res = await fetch('https://api.resend.com/emails', {
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

  return res.ok;
}

export function buildSetPasswordEmail(params: {
  name: string;
  orderNumber: string;
  setPasswordUrl: string;
}): { subject: string; html: string; text: string } {
  const site = getSiteUrl();
  const subject = `Your Bee & Beauty order ${params.orderNumber} — set your account password`;
  const text = `Hi ${params.name},\n\nYour order ${params.orderNumber} is confirmed. Create a password to track this and future orders:\n${params.setPasswordUrl}\n\nWhatsApp concierge: +8801754502430\n${site}`;
  const html = `
    <div style="font-family:Karla,Arial,sans-serif;color:#2C2C2C;background:#FFF9F5;padding:24px">
      <h1 style="font-family:'Cormorant Garamond',Georgia,serif;color:#6A1B6D">Order confirmed</h1>
      <p>Hi ${params.name},</p>
      <p>Your Bee &amp; Beauty order <strong>${params.orderNumber}</strong> is confirmed. We emailed this receipt — we have not sent an SMS.</p>
      <p>Create a password to view your order history:</p>
      <p><a href="${params.setPasswordUrl}" style="background:#6A1B6D;color:#fff;padding:12px 18px;text-decoration:none;border-radius:4px">Set password</a></p>
      <p>Concierge: +8801754502430 · beeandbeauty.bd@gmail.com</p>
    </div>
  `;
  return { subject, html, text };
}
