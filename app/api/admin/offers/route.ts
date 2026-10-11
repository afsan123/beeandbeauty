import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllOffers,
  createOffer,
} from '../../../../lib/services/limitedOfferService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const offers = await getAllOffers();
    return NextResponse.json({ offers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching offers.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.code || !body.title || !body.discountType || body.discountValue === undefined) {
      return NextResponse.json(
        { error: 'Offer code, title, discount type, and value are required.' },
        { status: 400 }
      );
    }

    const created = await createOffer(body);
    return NextResponse.json({
      success: true,
      offer: created,
      message: 'Offer created successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating offer.' },
      { status: 500 }
    );
  }
}
