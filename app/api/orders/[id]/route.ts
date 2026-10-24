import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getOrderById, orderMatchesAccessToken } from '../../../../lib/services/orderService';
import { getCurrentCustomer } from '../../../../lib/supabase/server.ts';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: `Order with ID or Number "${id}" was not found.`,
        },
        { status: 404 }
      );
    }

    const admin = await getCurrentAdminUser();
    const customer = await getCurrentCustomer();
    const token = req.nextUrl.searchParams.get('token') || req.headers.get('x-order-token');

    const allowed =
      Boolean(admin) ||
      (customer && order.customerId === customer.id) ||
      orderMatchesAccessToken(order, token);

    if (!allowed) {
      return NextResponse.json(
        { success: false, error: 'Order lookup requires a signed-in account or access token.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        accessToken: undefined,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching order.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
