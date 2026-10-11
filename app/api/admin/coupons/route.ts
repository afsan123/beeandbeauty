import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllCoupons,
  createCoupon,
} from '../../../../lib/services/couponService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const coupons = await getAllCoupons();
    return NextResponse.json({ coupons });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching coupons.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const coupon = await createCoupon(body);
    return NextResponse.json({
      success: true,
      coupon,
      message: `Coupon ${coupon.code} activated.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating coupon.' },
      { status: 400 }
    );
  }
}
