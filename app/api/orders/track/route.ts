import { NextRequest, NextResponse } from 'next/server';
import { trackOrderByPhone } from '../../../../lib/services/orderService';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../../lib/security/rateLimit.ts';

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`track:${getClientIp(req)}`, 20, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const { orderNumber, phone } = await req.json();

    if (!orderNumber?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter your Order Reference Number (e.g. BB-2026-10492).',
        },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please enter the mobile number used when placing the order.',
        },
        { status: 400 }
      );
    }

    const result = await trackOrderByPhone(orderNumber, phone);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error:
            'No matching order found for this Order Number and Mobile Number. Please verify your details or message our WhatsApp concierge at +880 1754-502430.',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...result.order,
        accessToken: undefined,
      },
      timeline: result.timeline,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to track order.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
