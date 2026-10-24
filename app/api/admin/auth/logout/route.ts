import { NextResponse } from 'next/server.js';
import { cookies } from 'next/headers.js';
import { SESSION_COOKIE_NAME, verifyAdminSessionToken } from '../../../../../lib/services/adminAuth.ts';
import { revokeAdminSession } from '../../../../../lib/services/adminSessionRevocation.ts';
import { csrfFailureResponse, isSameOriginRequest } from '../../../../../lib/security/csrf.ts';

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json(csrfFailureResponse(), { status: 403 });
  }

  const cookieStore = await cookies();
  const session = verifyAdminSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  // Always clear the cookie on this device.
  cookieStore.delete(SESSION_COOKIE_NAME);

  if (!session) {
    return NextResponse.json({ success: true, revoked: false, message: 'Logged out.' });
  }

  const revoked = await revokeAdminSession(session.sessionId, session.expiresAt);
  if (!revoked) {
    return NextResponse.json(
      {
        success: false,
        revoked: false,
        error:
          'Signed out on this device, but the server could not revoke the session. Copies of this session cookie may still work until it expires.',
      },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true, revoked: true, message: 'Logged out successfully.' });
}
