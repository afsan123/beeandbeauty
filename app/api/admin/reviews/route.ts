import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllReviews,
  toggleReviewVerified,
  deleteReview,
} from '../../../../lib/services/reviewService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const reviews = await getAllReviews();
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching reviews.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, isVerified } = body;
    const ok = await toggleReviewVerified(id, Boolean(isVerified));
    return NextResponse.json({ success: ok, message: 'Review status modified.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating review.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Review ID is required.' }, { status: 400 });
    }

    const ok = await deleteReview(id);
    return NextResponse.json({ success: ok, message: 'Review deleted.' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting review.' },
      { status: 500 }
    );
  }
}
