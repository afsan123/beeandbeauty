import { NextRequest, NextResponse } from 'next/server';
import { createOrder, CreateOrderPayload } from '../../../lib/services/orderService';

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderPayload = await req.json();
    const order = await createOrder(body);

    return NextResponse.json(
      {
        success: true,
        order,
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
