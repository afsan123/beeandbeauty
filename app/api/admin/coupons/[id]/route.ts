import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  toggleCouponStatus,
  deleteCoupon,
} from '../../../../../lib/services/couponService.ts';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { isActive } = body;

    const ok = await toggleCouponStatus(id, Boolean(isActive));
    return NextResponse.json({ success: ok, message: 'Coupon status updated.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating coupon.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const ok = await deleteCoupon(id);
    return NextResponse.json({ success: ok, message: 'Coupon removed.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting coupon.' },
      { status: 500 }
    );
  }
}
