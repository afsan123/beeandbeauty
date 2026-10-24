import { NextResponse } from 'next/server.js';
import { getAllCategories } from '../../../lib/services/categoryService.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const refresh = searchParams.get('refresh') === 'true';

    const categories = await getAllCategories(refresh);

    const res = NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });

    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error fetching store categories.' },
      { status: 500 }
    );
  }
}
