import { cookies } from 'next/headers.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@beeandbeauty.bd';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'beeAdmin2026!';
const SESSION_COOKIE_NAME = 'bb_admin_session';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'bb_secret_session_key_2026_luxury';

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
  
  // Basic signature simulation for tamper-proofing
  const signature = Buffer.from(`${base64Payload}:${SESSION_SECRET}`)
    .toString('base64url')
    .slice(0, 32);

  return `${base64Payload}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): AdminUser | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expectedSig = Buffer.from(`${base64Payload}:${SESSION_SECRET}`)
    .toString('base64url')
    .slice(0, 32);

  if (signature !== expectedSig) return null;

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

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export { SESSION_COOKIE_NAME, ADMIN_EMAIL, ADMIN_PASSWORD };
