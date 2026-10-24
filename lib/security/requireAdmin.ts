import { NextResponse } from 'next/server.js';
import type { AdminRole, AdminUser } from '../services/adminAuthToken.ts';
import { getCurrentAdminUser, hasAdminRole } from '../services/adminAuth.ts';
import { csrfFailureResponse, isSameOriginRequest } from './csrf.ts';

export async function requireAdmin(
  req: Request,
  options?: { role?: AdminRole | AdminRole[] }
): Promise<{ user: AdminUser } | { response: NextResponse }> {
  const user = await getCurrentAdminUser();
  if (!user) {
    return {
      response: NextResponse.json(
        { error: 'Unauthorized executive access. Please authenticate at /admin/login.' },
        { status: 401 }
      ),
    };
  }

  if (!hasAdminRole(user, options?.role)) {
    return {
      response: NextResponse.json(
        { error: 'This action requires a superadmin session.' },
        { status: 403 }
      ),
    };
  }

  if (!isSameOriginRequest(req)) {
    return {
      response: NextResponse.json(csrfFailureResponse(), { status: 403 }),
    };
  }

  return { user };
}

export function isAdminGuardResponse(
  result: { user: AdminUser } | { response: NextResponse }
): result is { response: NextResponse } {
  return 'response' in result;
}
