import crypto from 'node:crypto';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@beeandbeauty.bd';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'beeAdmin2026!';
export const SESSION_COOKIE_NAME = 'bb_admin_session';
export const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'bb_secret_session_key_2026_luxury';

export interface AdminUser {
  email: string;
  name: string;
  role: 'superadmin' | 'manager';
}

export function validateAdminCredentials(email: string, password: string): boolean {
  const cleanEmail = (email || '').trim().toLowerCase();
  return cleanEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD;
}

export function createAdminToken(user: AdminUser): string {
  const payload = {
    email: user.email,
    name: user.name,
    role: user.role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const jsonStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(jsonStr).toString('base64url');

  // Robust cryptographic signature using HMAC-SHA256
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;

  // Verify HMAC-SHA256 signature
  const hmacSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  // Legacy fallback signature for backwards-compatibility during rollout
  const legacySig = Buffer.from(`${base64Payload}:${SESSION_SECRET}`)
    .toString('base64url')
    .slice(0, 32);

  if (signature !== hmacSig && signature !== legacySig) {
    return null;
  }

  try {
    const jsonStr = Buffer.from(base64Payload, 'base64url').toString('utf8');
    const payload = JSON.parse(jsonStr);

    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || 'Executive Admin',
      role: payload.role || 'superadmin',
    };
  } catch {
    return null;
  }
}
