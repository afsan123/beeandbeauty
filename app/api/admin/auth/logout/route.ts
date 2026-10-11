import { NextResponse } from 'next/server.js';
import { cookies } from 'next/headers.js';
import { SESSION_COOKIE_NAME } from '../../../../../lib/services/adminAuth.ts';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}
