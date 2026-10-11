import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '../../../../lib/services/orderService';

export async function GET(
  _req: NextRequest,
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

    return NextResponse.json({
      success: true,
      order,
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
