import { NextResponse } from 'next/server.js';
import { getActiveBanners } from '../../../lib/services/bannerService.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'hero' | 'promo' | 'announcement' | undefined;
    const banners = await getActiveBanners(type);
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching banners.' },
      { status: 500 }
    );
  }
}
