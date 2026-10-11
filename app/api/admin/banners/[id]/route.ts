import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  updateBanner,
  deleteBanner,
} from '../../../../../lib/services/bannerService.ts';

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
    const updated = await updateBanner(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Banner not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      banner: updated,
      message: 'Banner updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating banner.' },
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
    const deleted = await deleteBanner(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Banner not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Banner deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting banner.' },
      { status: 500 }
    );
  }
}
