import { NextResponse } from 'next/server.js';
import { getActiveOffers } from '../../../lib/services/limitedOfferService.ts';

export async function GET() {
  try {
    const offers = await getActiveOffers();
    return NextResponse.json({ offers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching active offers.' },
      { status: 500 }
    );
  }
}
