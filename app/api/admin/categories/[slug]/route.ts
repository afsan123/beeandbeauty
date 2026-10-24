import { NextResponse } from 'next/server.js';
import { errorStatus } from '../../../../../lib/services/serviceError.ts';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  updateCategory,
  deleteCategory,
} from '../../../../../lib/services/categoryService.ts';

export async function PUT(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { slug } = await context.params;
  try {
    const body = await request.json();
    const updated = await updateCategory(slug, body);
    if (!updated) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      category: updated,
      message: 'Category updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating category.' },
      { status: errorStatus(error) }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { slug } = await context.params;
  try {
    const deleted = await deleteCategory(slug);
    if (!deleted) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting category.' },
      { status: errorStatus(error) }
    );
  }
}
