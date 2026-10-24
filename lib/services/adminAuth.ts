import { cookies } from 'next/headers.js';
import type { AdminUser } from './adminAuthToken.ts';
import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SESSION_COOKIE_NAME,
  SESSION_SECRET,
  validateAdminCredentials,
  createAdminToken,
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

export {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  SESSION_COOKIE_NAME,
  SESSION_SECRET,
  validateAdminCredentials,
  createAdminToken,
  verifyAdminToken,
};
export type { AdminUser };
