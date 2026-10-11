import { NextRequest, NextResponse } from 'next/server';
import { createInquiry, CreateInquiryPayload } from '../../../lib/services/inquiryService';

export async function POST(req: NextRequest) {
  try {
    const body: CreateInquiryPayload = await req.json();
    const inquiry = await createInquiry(body);

    return NextResponse.json(
      {
        success: true,
        ticketNumber: inquiry.ticketNumber,
        inquiry,
        message: `Your inquiry has been received under ticket #${inquiry.ticketNumber}. Our support team will contact you within 4-6 business hours.`,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit inquiry.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
