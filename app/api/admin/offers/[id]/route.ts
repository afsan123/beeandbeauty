import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  updateOffer,
  deleteOffer,
} from '../../../../../lib/services/limitedOfferService.ts';

export async function PUT(
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
    const updated = await updateOffer(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      offer: updated,
      message: 'Offer updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating offer.' },
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
    const deleted = await deleteOffer(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Offer not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Offer deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting offer.' },
      { status: 500 }
    );
  }
}
