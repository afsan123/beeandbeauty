import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getAllInquiries } from '../../../../lib/services/inquiryService.ts';

export async function GET(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    const inquiries = await getAllInquiries(status);
    return NextResponse.json({ inquiries });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching customer inquiries.' },
      { status: 500 }
    );
  }
}
