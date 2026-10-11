import { PRODUCTS } from '../../data/mock/catalogData.ts';
import type { Product } from '../../data/types.ts';
import { supabaseAdmin } from '../supabase/admin.ts';

export interface ProductInventoryOverride {
  productId: string;
  inStock?: boolean;
  price?: number;
  compareAtPrice?: number;
  isBestseller?: boolean;
  isNewLaunch?: boolean;
  isFeatured?: boolean;
  shadesStock?: Record<string, boolean>; // shadeId -> inStock
  updatedAt?: string;
}

// In-memory persistent cache across server-side executions
const inventoryOverridesCache = new Map<string, ProductInventoryOverride>();

export async function fetchRemoteInventoryOverrides(): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('product_inventory')
      .select('*');

    if (!error && data && data.length > 0) {
      data.forEach((row) => {
        inventoryOverridesCache.set(row.product_id, {
          productId: row.product_id,
          inStock: row.in_stock,
          price: row.price ? Number(row.price) : undefined,
          compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
          isBestseller: row.is_bestseller,
          isNewLaunch: row.is_new_launch,
          isFeatured: row.is_featured,
          shadesStock: row.shades_stock || {},
          updatedAt: row.updated_at,
        });
      });
    }
  } catch {
    // Graceful in-memory fallback
  }
}

export async function getAllInventoryProducts(): Promise<Product[]> {
  // Merge cached/overridden properties onto canonical catalog products
  return PRODUCTS.map((product) => {
    const override = inventoryOverridesCache.get(product.id);
    if (!override) return { ...product };

    const mergedShades = product.shades?.map((s) => {
      if (override.shadesStock && typeof override.shadesStock[s.id] === 'boolean') {
        return { ...s, inStock: override.shadesStock[s.id] };
      }
      return { ...s };
    });

    return {
      ...product,
      inStock: override.inStock !== undefined ? override.inStock : product.inStock,
      price: override.price !== undefined ? override.price : product.price,
      compareAtPrice: override.compareAtPrice !== undefined ? override.compareAtPrice : product.compareAtPrice,
      isBestseller: override.isBestseller !== undefined ? override.isBestseller : product.isBestseller,
      isNewLaunch: override.isNewLaunch !== undefined ? override.isNewLaunch : product.isNewLaunch,
      isFeatured: override.isFeatured !== undefined ? override.isFeatured : product.isFeatured,
      shades: mergedShades || product.shades,
    };
  });
}

export async function updateProductInventory(override: ProductInventoryOverride): Promise<Product | null> {
  const existing = inventoryOverridesCache.get(override.productId) || {
    productId: override.productId,
  };

  const updated: ProductInventoryOverride = {
    ...existing,
    ...override,
    shadesStock: {
      ...(existing.shadesStock || {}),
      ...(override.shadesStock || {}),
    },
    updatedAt: new Date().toISOString(),
  };

  inventoryOverridesCache.set(override.productId, updated);

  try {
    await supabaseAdmin.from('product_inventory').upsert(
      {
        product_id: updated.productId,
        in_stock: updated.inStock,
        price: updated.price,
        compare_at_price: updated.compareAtPrice,
        is_bestseller: updated.isBestseller,
        is_new_launch: updated.isNewLaunch,
        is_featured: updated.isFeatured,
        shades_stock: updated.shadesStock,
        updated_at: updated.updatedAt,
      },
      { onConflict: 'product_id' }
    );
  } catch (err) {
    console.warn('Supabase product_inventory upsert skipped/failed:', err);
  }

  const all = await getAllInventoryProducts();
  return all.find((p) => p.id === override.productId) || null;
}
