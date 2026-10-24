import { NextResponse } from 'next/server.js';
import { getActiveTutorials } from '../../../../lib/services/studioService.ts';

export async function GET() {
  try {
    const tutorials = await getActiveTutorials();
    return NextResponse.json({ success: true, tutorials });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load studio tutorials.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
