import { NextResponse } from 'next/server.js';
import { errorStatus } from '../../../../../lib/services/serviceError.ts';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import {
  getProductById,
  updateCatalogProduct,
  deleteCatalogProduct,
} from '../../../../../lib/services/productService.ts';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const body = await request.json();
    const updated = await updateCatalogProduct(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      product: updated,
      message: 'Product updated successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating product.' },
      { status: errorStatus(error) }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  const { id } = await context.params;
  try {
    const deleted = await deleteCatalogProduct(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error deleting product.' },
      { status: errorStatus(error) }
    );
  }
}
