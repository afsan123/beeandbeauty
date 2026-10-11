import { NextRequest, NextResponse } from 'next/server';
import { subscribeNewsletter } from '../../../lib/services/newsletterService';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const result = await subscribeNewsletter(email);

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Newsletter subscription failed.';
    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}
