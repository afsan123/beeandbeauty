import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import { getAllBookings } from '../../../../../lib/services/studioService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const bookings = await getAllBookings();
    return NextResponse.json({ bookings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching studio bookings.' },
      { status: 500 }
    );
  }
}
