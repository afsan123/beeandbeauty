import { NextRequest, NextResponse } from 'next/server';
import { isProductionRuntime } from '../../../../lib/env.ts';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getOrderById, updatePaymentStatus, updateOrderStatus } from '../../../../lib/services/orderService';

export async function POST(req: NextRequest) {
  if (isProductionRuntime()) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const admin = await getCurrentAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  try {
    const { orderNumber, transactionId, paymentMethod, status } = await req.json();

    if (!orderNumber) {
      return NextResponse.json(
        { success: false, error: 'orderNumber is required.' },
        { status: 400 }
      );
    }

    const order = await getOrderById(orderNumber);
    if (!order) {
      return NextResponse.json(
        { success: false, error: `Order #${orderNumber} not found.` },
        { status: 404 }
      );
    }

    const paymentStatus = status === 'success' ? 'paid' : 'failed';
    await updatePaymentStatus(order.orderNumber, paymentStatus);
    if (paymentStatus === 'paid') {
      await updateOrderStatus(order.orderNumber, 'processing');
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentStatus,
      transactionId: transactionId || `DEV-${Date.now()}`,
      paymentMethod: paymentMethod || order.paymentMethod,
      message: `Development-only payment callback marked #${orderNumber} as ${paymentStatus}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment callback simulation failed.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
