import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';
import { getOrderById } from '../../../../lib/services/orderService';

export async function POST(req: NextRequest) {
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

    // Update in Supabase
    try {
      await supabaseAdmin
        .from('orders')
        .update({
          payment_status: paymentStatus,
          order_status: paymentStatus === 'paid' ? 'processing' : 'pending',
          notes: `Payment verified via ${paymentMethod || order.paymentMethod} (Txn: ${
            transactionId || 'SIMULATED-' + Date.now()
          })`,
          updated_at: new Date().toISOString(),
        })
        .eq('order_number', orderNumber);
    } catch (err) {
      console.warn('Supabase order payment update skipped or failed:', err);
    }

    // Update cached instance
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.orderStatus = 'processing';
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      paymentStatus,
      transactionId: transactionId || 'SIMULATED-' + Date.now(),
      message: `Payment for order #${orderNumber} marked as ${paymentStatus}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment callback simulation failed.';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
