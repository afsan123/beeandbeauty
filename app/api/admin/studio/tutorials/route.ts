import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  getAllTutorials,
  createTutorial,
} from '../../../../../lib/services/studioService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const tutorials = await getAllTutorials();
    return NextResponse.json({ tutorials });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching studio tutorials.' },
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
    if (!body.title || !body.category) {
      return NextResponse.json(
        { error: 'Tutorial title and category are required.' },
        { status: 400 }
      );
    }

    const created = await createTutorial(body);
    return NextResponse.json({
      success: true,
      tutorial: created,
      message: 'Tutorial created successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating tutorial.' },
      { status: 500 }
    );
  }
}
