import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getAllCustomers } from '../../../../lib/services/customerService.ts';

export async function GET(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase();
    const tier = searchParams.get('tier');

    let customers = await getAllCustomers();

    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.phone.includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.district.toLowerCase().includes(search)
      );
    }

    if (tier && tier !== 'all') {
      customers = customers.filter((c) => c.tier.toLowerCase().includes(tier.toLowerCase()));
    }

    return NextResponse.json({ customers });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching customer ledger.' },
      { status: 500 }
    );
  }
}
