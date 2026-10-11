import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  getCustomerById,
  updateCustomerNotes,
} from '../../../../../lib/services/customerService.ts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  const customer = await getCustomerById(decodeURIComponent(id));
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
  }

  return NextResponse.json({ customer });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  const customerId = decodeURIComponent(id);

  try {
    const body = await request.json();
    if (typeof body.notes === 'string') {
      await updateCustomerNotes(customerId, body.notes);
    }

    const updated = await getCustomerById(customerId);
    return NextResponse.json({
      success: true,
      customer: updated,
      message: 'Customer notes updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating customer notes.' },
      { status: 500 }
    );
  }
}
