import { NextResponse } from 'next/server.js';
import { errorStatus } from '../../../../lib/services/serviceError.ts';
import { getOrdersForCustomer } from '../../../../lib/services/orderService.ts';
import { getCurrentCustomer } from '../../../../lib/supabase/server.ts';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 });
  }

  try {
    const orders = await getOrdersForCustomer(customer.id);
    return NextResponse.json({
      success: true,
      orders: orders.map((order) => ({ ...order, accessToken: undefined })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : 'Could not load your orders.' },
      { status: errorStatus(err) }
    );
  }
}
