import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../../lib/services/adminAuth.ts';
import {
  updateBookingStatus,
  deleteBooking,
} from '../../../../../../lib/services/studioService.ts';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    const updated = await updateBookingStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      booking: updated,
      message: `Booking status updated to ${body.status}.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating booking.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const deleted = await deleteBooking(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting booking.' },
      { status: 500 }
    );
  }
}
