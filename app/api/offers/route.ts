import { NextResponse } from 'next/server.js';
import { getActiveOffers } from '../../../lib/services/limitedOfferService.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    const offers = await getActiveOffers(refresh);
    const res = NextResponse.json({ offers });
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching active offers.' },
      { status: 500 }
    );
  }
}
