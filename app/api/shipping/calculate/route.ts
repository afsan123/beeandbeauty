import { NextRequest, NextResponse } from 'next/server';
import { calculateShipping } from '../../../../lib/services/shippingService';

export async function POST(req: NextRequest) {
  try {
    const { district, subtotal } = await req.json();

    const result = calculateShipping(district || 'dhaka', Number(subtotal || 0));

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Shipping calculation failed.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
