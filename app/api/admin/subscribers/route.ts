import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getAllSubscribers } from '../../../../lib/services/newsletterService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const subscribers = await getAllSubscribers();
    return NextResponse.json({ subscribers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching newsletter subscribers.' },
      { status: 500 }
    );
  }
}
