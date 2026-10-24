import { NextResponse } from 'next/server.js';
import { getAllCatalogProducts } from '../../../lib/services/productService.ts';
import { filterProducts } from '../../../lib/filters.ts';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const badge = searchParams.get('badge') as 'new' | 'bestseller' | 'clean' | 'exclusive' | null;
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const refresh = searchParams.get('refresh') === 'true';

    // Fetch products with optional force refresh
    const allProducts = await getAllCatalogProducts(refresh);

    let filtered = allProducts;

    if (category) {
      if (category === 'under499') {
        filtered = filtered.filter((p) => p.isUnder499 || p.price <= 499);
      } else if (category !== 'all') {
        filtered = filtered.filter((p) => p.categorySlug === category);
      }
    }

    if (badge) {
      if (badge === 'bestseller') {
        filtered = filtered.filter((p) => p.isBestseller || p.badges?.some((b) => b.type === 'bestseller'));
      } else if (badge === 'new') {
        filtered = filtered.filter((p) => p.isNewLaunch || p.badges?.some((b) => b.type === 'new'));
      } else {
        filtered = filtered.filter((p) => p.badges?.some((b) => b.type === (badge as any)));
      }
    }

    if (inStockOnly) {
      filtered = filtered.filter((p) => p.inStock);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const result = limit ? filtered.slice(0, limit) : filtered;

    const res = NextResponse.json({
      success: true,
      products: result,
      total,
    });

    res.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Error fetching store products.' },
      { status: 500 }
    );
  }
}
