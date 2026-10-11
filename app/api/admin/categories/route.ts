import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllCategories,
  createCategory,
} from '../../../../lib/services/categoryService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const categories = await getAllCategories();
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching categories.' },
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
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: 'Category name and slug are required.' },
        { status: 400 }
      );
    }

    const created = await createCategory(body);
    return NextResponse.json({
      success: true,
      category: created,
      message: 'Category created successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating category.' },
      { status: 500 }
    );
  }
}
