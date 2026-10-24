import { NextResponse } from 'next/server.js';
import { getActiveBanners } from '../../../lib/services/bannerService.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'hero' | 'promo' | 'announcement' | undefined;
    const refresh = searchParams.get('refresh') === 'true';

    const banners = await getActiveBanners(type, refresh);
    const res = NextResponse.json({ banners });
    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching banners.' },
      { status: 500 }
    );
  }
}
