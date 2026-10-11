import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getAllOrders } from '../../../../lib/services/orderService.ts';

export async function GET(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const paymentStatus = searchParams.get('paymentStatus') || undefined;
    const search = searchParams.get('search') || undefined;
    const zone = searchParams.get('zone') || undefined;

    const orders = await getAllOrders({
      status,
      paymentStatus,
      search,
      zone,
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching orders.' },
      { status: 500 }
    );
  }
}
