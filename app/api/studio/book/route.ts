import { NextResponse } from 'next/server.js';
import { createBooking } from '../../../../lib/services/studioService.ts';

export async function POST(request: Request) {
  const { checkRateLimit, getClientIp, rateLimitResponse } = await import('../../../../lib/security/rateLimit.ts');
  const limit = checkRateLimit(`studio-book:${getClientIp(request)}`, 6, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const body = await request.json();
    if (!body.clientName || !body.clientPhone || !body.serviceType || !body.preferredDate) {
      return NextResponse.json(
        { error: 'Name, phone number, service type, and date are required.' },
        { status: 400 }
      );
    }

    const booking = await createBooking({
      clientName: body.clientName,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail || '',
      serviceType: body.serviceType,
      preferredDate: body.preferredDate,
      preferredTime: body.preferredTime || '',
      notes: body.notes || '',
    });

    return NextResponse.json({
      success: true,
      booking,
      message: 'Your Pro Beauty Studio session request has been received. Our concierge will contact you via WhatsApp to confirm your slot.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating studio booking.' },
      { status: 500 }
    );
  }
}
