import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  getAllCatalogProducts,
  createCatalogProduct,
} from '../../../../lib/services/productService.ts';
import { updateProductInventory } from '../../../../lib/services/inventoryService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const products = await getAllCatalogProducts(true);
    return NextResponse.json({ products });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching catalog products.' },
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
    if (!body.title || !body.price || !body.categorySlug) {
      return NextResponse.json(
        { error: 'Product title, price, and category are required.' },
        { status: 400 }
      );
    }

    const created = await createCatalogProduct(body);
    return NextResponse.json({
      success: true,
      product: created,
      message: 'Product created successfully.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error creating product.' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.productId) {
      return NextResponse.json({ error: 'Product ID is required.' }, { status: 400 });
    }

    const updated = await updateProductInventory(body);
    return NextResponse.json({
      success: true,
      product: updated,
      message: 'Product inventory updated.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error updating product inventory.' },
      { status: 500 }
    );
  }
}
