import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import { updateInquiryStatus } from '../../../../../lib/services/inquiryService.ts';

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!['new', 'in_progress', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value.' }, { status: 400 });
    }

    const updated = await updateInquiryStatus(id, status);
    return NextResponse.json({
      success: true,
      inquiry: updated,
      message: 'Inquiry status updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating inquiry.' },
      { status: 500 }
    );
  }
}
