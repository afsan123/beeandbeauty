import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
} from '../../../../../lib/services/orderService.ts';

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  return NextResponse.json({ order });
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, paymentStatus, courierTrackingCode } = body;

    let updated = await getOrderById(id);
    if (!updated) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    if (status !== undefined || courierTrackingCode !== undefined) {
      updated = await updateOrderStatus(
        id,
        status !== undefined ? status : updated.orderStatus,
        courierTrackingCode
      );
    }

    if (paymentStatus !== undefined && updated) {
      updated = await updatePaymentStatus(id, paymentStatus);
    }

    return NextResponse.json({
      success: true,
      order: updated,
      message: 'Order updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating order.' },
      { status: 500 }
    );
  }
}
