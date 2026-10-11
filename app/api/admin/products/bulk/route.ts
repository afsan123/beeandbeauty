import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../../lib/services/adminAuth.ts';
import { bulkCreateCatalogProducts } from '../../../../../lib/services/productService.ts';

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const products = Array.isArray(body) ? body : body.products;

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'An array of products is required for bulk upload.' },
        { status: 400 }
      );
    }

    const result = await bulkCreateCatalogProducts(products);
    return NextResponse.json({
      success: true,
      count: result.count,
      products: result.products,
      errors: result.errors,
      message: `Successfully processed bulk upload of ${result.count} products.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error executing bulk product upload.' },
      { status: 500 }
    );
  }
}
