import { NextResponse } from 'next/server.js';
import { cookies } from 'next/headers.js';
import {
  validateAdminCredentials,
  createAdminToken,
  SESSION_COOKIE_NAME,
  ADMIN_EMAIL,
} from '../../../../../lib/services/adminAuth.ts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const isValid = validateAdminCredentials(email, password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid executive credentials. Please check your email and password.' },
        { status: 401 }
      );
    }

    const adminUser = {
      email: (email || ADMIN_EMAIL).trim().toLowerCase(),
      name: 'Executive Director',
      role: 'superadmin' as const,
    };

    const token = createAdminToken(adminUser);
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      success: true,
      user: adminUser,
      message: 'Executive session initiated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}
