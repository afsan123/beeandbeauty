import crypto from 'node:crypto';
import { cleanEnv, isTestRuntime } from '../env.ts';
import { timingSafeEqualEncoded, timingSafeEqualString } from '../security/crypto.ts';

export type AdminRole = 'superadmin' | 'manager';

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
}

export const SESSION_COOKIE_NAME = 'bb_admin_session';

const TEST_EMAIL = 'admin@beeandbeauty.bd';
const TEST_PASSWORD = 'test-admin-password';
const TEST_SECRET = 'test-admin-session-secret-at-least-32-chars';

function readRequiredSecret(name: string, testFallback: string): string {
  const value = cleanEnv(process.env[name]);
  if (value) return value;
  if (isTestRuntime()) return testFallback;
  return '';
}

export const ADMIN_EMAIL = readRequiredSecret('ADMIN_EMAIL', TEST_EMAIL);
export const ADMIN_PASSWORD = readRequiredSecret('ADMIN_PASSWORD', TEST_PASSWORD);
export const SESSION_SECRET = readRequiredSecret('ADMIN_SESSION_SECRET', TEST_SECRET);
export const MANAGER_EMAIL = cleanEnv(process.env.ADMIN_MANAGER_EMAIL) || '';
export const MANAGER_PASSWORD = cleanEnv(process.env.ADMIN_MANAGER_PASSWORD) || '';

function isConfiguredAdmin(): boolean {
  return Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && SESSION_SECRET);
}

export function resolveAdminRole(email: string): AdminRole {
  const clean = (email || '').trim().toLowerCase();
  if (MANAGER_EMAIL && clean === MANAGER_EMAIL.toLowerCase()) {
    return 'manager';
  }
  return 'superadmin';
}

export function validateAdminCredentials(email: string, password: string): boolean {
  return resolveAdminUser(email, password) !== null;
}

export function resolveAdminUser(email: string, password: string): AdminUser | null {
  if (!isConfiguredAdmin()) {
    return null;
  }

  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanPassword = password || '';

  if (
    timingSafeEqualString(cleanEmail, ADMIN_EMAIL.toLowerCase()) &&
    timingSafeEqualString(cleanPassword, ADMIN_PASSWORD)
  ) {
    return {
      email: ADMIN_EMAIL.toLowerCase(),
      name: 'Executive Director',
      role: 'superadmin',
    };
  }

  if (
    MANAGER_EMAIL &&
    MANAGER_PASSWORD &&
    timingSafeEqualString(cleanEmail, MANAGER_EMAIL.toLowerCase()) &&
    timingSafeEqualString(cleanPassword, MANAGER_PASSWORD)
  ) {
    return {
      email: MANAGER_EMAIL.toLowerCase(),
      name: 'Store Manager',
      role: 'manager',
    };
  }

  return null;
}

export function createAdminToken(user: AdminUser): string {
  if (!SESSION_SECRET) {
    throw new Error('ADMIN_SESSION_SECRET is required to issue executive sessions.');
  }

  const role: AdminRole = user.role === 'manager' ? 'manager' : 'superadmin';
  const payload = {
    email: user.email,
    name: user.name,
    role,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
  };
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  return `${base64Payload}.${signature}`;
}

export function verifyAdminToken(token: string | undefined): AdminUser | null {
  if (!token || !SESSION_SECRET) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [base64Payload, signature] = parts;
  const expected = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(base64Payload)
    .digest('base64url');

  if (!timingSafeEqualEncoded(expected, signature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64url').toString('utf8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return null;
    }
    if (payload.role !== 'superadmin' && payload.role !== 'manager') {
      return null;
    }
    return {
      email: payload.email,
      name: payload.name || 'Executive Admin',
      role: payload.role,
    };
  } catch {
    return null;
  }
}

export function hasAdminRole(user: AdminUser | null, required?: AdminRole | AdminRole[]): boolean {
  if (!user) return false;
  if (!required) return true;
  const allowed = Array.isArray(required) ? required : [required];
  if (allowed.includes('manager') && user.role === 'superadmin') {
    return true;
  }
  return allowed.includes(user.role);
}
