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
  verifyAdminSessionToken,
  verifyAdminToken,
} from './adminAuthToken.ts';
import { isAdminSessionRevoked } from './adminSessionRevocation.ts';

export async function getCurrentAdminUser(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const session = verifyAdminSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    if (!session) return null;
    if (await isAdminSessionRevoked(session.sessionId)) return null;
    return { email: session.email, name: session.name, role: session.role };
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
  verifyAdminSessionToken,
  verifyAdminToken,
};
export type { AdminRole, AdminUser };
