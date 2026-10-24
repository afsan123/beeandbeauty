import { NextResponse } from 'next/server.js';
import { getOrdersForCustomer } from '../../../../lib/services/orderService.ts';
import { getCurrentCustomer } from '../../../../lib/supabase/server.ts';

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) {
    return NextResponse.json({ error: 'Please sign in to view your orders.' }, { status: 401 });
  }

  const orders = await getOrdersForCustomer(customer.id);
  return NextResponse.json({
    success: true,
    orders: orders.map((order) => ({ ...order, accessToken: undefined })),
  });
}
