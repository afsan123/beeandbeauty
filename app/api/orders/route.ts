import { NextRequest, NextResponse } from 'next/server';
import { createOrder, CreateOrderPayload } from '../../../lib/services/orderService';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../../../lib/security/rateLimit.ts';

export async function POST(req: NextRequest) {
  const limit = checkRateLimit(`orders:${getClientIp(req)}`, 8, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const body: CreateOrderPayload = await req.json();
    const order = await createOrder(body);

    return NextResponse.json(
      {
        success: true,
        order: {
          ...order,
          accessToken: undefined,
        },
        notifications: {
          emailSent: order.account?.emailSent === true,
          smsSent: false,
          accountCreated: order.account?.created === true,
          channel: order.account?.channel || 'none',
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to process order.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
