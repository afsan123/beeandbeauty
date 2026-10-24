import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllBanners,
  createBanner,
} from '../../../../lib/services/bannerService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const banners = await getAllBanners(true);
    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching banners.' },
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
    if (!body.title || !body.ctaText || !body.ctaHref) {
      return NextResponse.json(
        { error: 'Banner title, CTA text, and CTA link are required.' },
        { status: 400 }
      );
    }

    const created = await createBanner(body);
    return NextResponse.json({
      success: true,
      banner: created,
      message: 'Banner created successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating banner.' },
      { status: 500 }
    );
  }
}
