import { NextRequest, NextResponse } from 'next/server';
import { validateCoupon } from '../../../../lib/services/couponService';

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();

    const result = await validateCoupon(code, Number(subtotal || 0));

    return NextResponse.json({
      success: result.valid,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Coupon validation failed.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
