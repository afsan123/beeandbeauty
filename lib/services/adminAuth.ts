import { cookies } from 'next/headers.js';
import type { AdminRole, AdminUser } from './adminAuthToken.ts';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SESSION_COOKIE_NAME,
  SESSION_SECRET,
  createAdminToken,
  hasAdminRole,
  resolveAdminUser,
  validateAdminCredentials,
  verifyAdminToken,
} from './adminAuthToken.ts';

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    return verifyAdminToken(token);
  } catch {
    return null;
  }
}

export async function requireCurrentAdmin(required?: AdminRole | AdminRole[]): Promise<AdminUser> {
  const user = await getCurrentAdminUser();
  if (!hasAdminRole(user, required)) {
    const error = new Error(
      required ? 'Insufficient executive privileges.' : 'Unauthorized executive access.'
    );
    (error as Error & { status: number }).status = required ? 403 : 401;
    throw error;
  }
  return user as AdminUser;
}

export {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SESSION_COOKIE_NAME,
  SESSION_SECRET,
  createAdminToken,
  hasAdminRole,
  resolveAdminUser,
  validateAdminCredentials,
  verifyAdminToken,
};
export type { AdminRole, AdminUser };
