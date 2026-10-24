import { PRODUCTS } from '../../data/mock/catalogData.ts';
import type { Product } from '../../data/types.ts';
import { supabaseAdmin } from '../supabase/admin.ts';
import { getAllInventoryProducts, applyInventoryOverrides, clearInventoryCache } from './inventoryService.ts';
import { generateSlug } from '../slug.ts';
import { revalidateStoreCatalog } from './revalidateStore.ts';

// In-memory catalog list initialized with canonical products
let customProducts: Product[] = [];
let isProductsLoaded = false;

export function clearProductCache(): void {
  customProducts = [];
  isProductsLoaded = false;
  clearInventoryCache();
}

export async function fetchRemoteProducts(): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin.from('products').select('*');

    if (!error && data && data.length > 0) {
      customProducts = data.map((row) => ({
        id: row.id,
        slug: row.slug,
        title: row.title,
        categorySlug: row.category_slug,
        categoryName: row.category_name,
        subtitle: row.subtitle || '',
        shortDescription: row.short_description || '',
        description: row.description || '',
        howToUse: row.how_to_use || '',
        ingredients: row.ingredients || '',
        details: row.details || {
          netWeight: '50g',
          shelfLife: '24 Months',
          origin: 'Bangladesh / Korea',
          finish: 'Velvet Matte',
          formulation: 'Botanical Infused',
        },
        price: Number(row.price),
        compareAtPrice: row.compare_at_price ? Number(row.compare_at_price) : undefined,
        rating: Number(row.rating || 5.0),
        reviewCount: Number(row.review_count || 0),
        badges: Array.isArray(row.badges) ? row.badges : [],
        shades: Array.isArray(row.shades) ? row.shades : [],
        images: row.images || {
          primary: '/images/products/placeholder.jpg',
          hover: '/images/products/placeholder.jpg',
          gallery: [],
        },
        inStock: row.in_stock !== false,
        isFeatured: Boolean(row.is_featured),
        isBestseller: Boolean(row.is_bestseller),
        isNewLaunch: Boolean(row.is_new_launch),
        isKit: Boolean(row.is_kit),
        isUnder499: Boolean(row.is_under499),
        tags: Array.isArray(row.tags) ? row.tags : [],
      }));
      isProductsLoaded = true;
    }
  } catch {
    // Fallback to local
  }
}

export async function getAllCatalogProducts(forceRefresh = false): Promise<Product[]> {
  if (!isProductsLoaded || forceRefresh) {
    await fetchRemoteProducts();
  }

  // Get canonical products with inventory overrides applied
  const baseProducts = await getAllInventoryProducts(forceRefresh);

  // Combine base products and custom products (deduplicating by id)
  const combinedMap = new Map<string, Product>();
  baseProducts.forEach((p) => combinedMap.set(p.id, p));
  customProducts.forEach((p) => combinedMap.set(p.id, p));

  // Apply inventory overrides to all products so overrides take precedence
  return applyInventoryOverrides(Array.from(combinedMap.values()));
}

export async function getProductBySlug(slug: string, forceRefresh = false): Promise<Product | null> {
  const products = await getAllCatalogProducts(forceRefresh);
  return products.find((p) => p.slug === slug) || null;
}

export async function getProductById(id: string, forceRefresh = false): Promise<Product | null> {
  const products = await getAllCatalogProducts(forceRefresh);
  return products.find((p) => p.id === id) || null;
}

export async function createCatalogProduct(
  input: Partial<Product> & { title: string; categorySlug: string; categoryName: string; price: number; slug?: string }
): Promise<Product> {
  const id = input.id || `prod-${Date.now()}`;
  const slug = (input.slug && input.slug.trim())
    ? generateSlug(input.slug)
    : generateSlug(input.title) || `prod-${Date.now()}`;

  const newProduct: Product = {
    ...input,
    id,
    slug,
    subtitle: input.subtitle || '',
    shortDescription: input.shortDescription || '',
    description: input.description || '',
    howToUse: input.howToUse || '',
    ingredients: input.ingredients || '',
    rating: input.rating || 5.0,
    reviewCount: input.reviewCount || 0,
    badges: input.badges || [],
    shades: input.shades || [],
    tags: input.tags || [],
    details: input.details || {
      netWeight: '50g',
      shelfLife: '24 Months',
      origin: 'Bangladesh',
      finish: 'Natural Radiant',
      formulation: 'Botanical Infused',
    },
    images: input.images || {
      primary: '/images/products/placeholder.jpg',
      hover: '/images/products/placeholder.jpg',
      gallery: [],
    },
    inStock: input.inStock !== false,
  };

  // Add to in-memory custom products
  const existingIdx = customProducts.findIndex((p) => p.id === id);
  if (existingIdx >= 0) {
    customProducts[existingIdx] = newProduct;
  } else {
    customProducts.push(newProduct);
  }

  try {
    await supabaseAdmin.from('products').upsert({
      id: newProduct.id,
      slug: newProduct.slug,
      title: newProduct.title,
      category_slug: newProduct.categorySlug,
      category_name: newProduct.categoryName,
      subtitle: newProduct.subtitle,
      short_description: newProduct.shortDescription,
      description: newProduct.description,
      how_to_use: newProduct.howToUse,
      ingredients: newProduct.ingredients,
      details: newProduct.details,
      price: newProduct.price,
      compare_at_price: newProduct.compareAtPrice,
      rating: newProduct.rating,
      review_count: newProduct.reviewCount,
      badges: newProduct.badges,
      shades: newProduct.shades,
      images: newProduct.images,
      in_stock: newProduct.inStock,
      is_featured: newProduct.isFeatured,
      is_bestseller: newProduct.isBestseller,
      is_new_launch: newProduct.isNewLaunch,
      is_kit: newProduct.isKit,
      is_under499: newProduct.isUnder499,
      tags: newProduct.tags,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Remote product upsert fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCatalog({
    productId: newProduct.id,
    productSlug: newProduct.slug,
    categorySlug: newProduct.categorySlug,
    action: 'created',
    payload: newProduct,
  });

  return newProduct;
}

export async function updateCatalogProduct(
  id: string,
  updates: Partial<Product>
): Promise<Product | null> {
  const products = await getAllCatalogProducts();
  const existing = products.find((p) => p.id === id);
  if (!existing) return null;

  const updated: Product = {
    ...existing,
    ...updates,
  };

  const customIdx = customProducts.findIndex((p) => p.id === id);
  if (customIdx >= 0) {
    customProducts[customIdx] = updated;
  } else {
    customProducts.push(updated);
  }

  try {
    await supabaseAdmin
      .from('products')
      .update({
        title: updated.title,
        slug: updated.slug,
        category_slug: updated.categorySlug,
        category_name: updated.categoryName,
        subtitle: updated.subtitle,
        short_description: updated.shortDescription,
        description: updated.description,
        price: updated.price,
        compare_at_price: updated.compareAtPrice,
        in_stock: updated.inStock,
        shades: updated.shades,
        images: updated.images,
        badges: updated.badges,
        tags: updated.tags,
        details: updated.details,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  } catch (err) {
    console.error('Remote product update fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCatalog({
    productId: updated.id,
    productSlug: updated.slug,
    categorySlug: updated.categorySlug,
    action: 'updated',
    payload: updated,
  });

  return updated;
}

export async function deleteCatalogProduct(id: string): Promise<boolean> {
  const products = await getAllCatalogProducts();
  const target = products.find((p) => p.id === id);

  const customIdx = customProducts.findIndex((p) => p.id === id);
  if (customIdx >= 0) {
    customProducts.splice(customIdx, 1);
  }

  try {
    await supabaseAdmin.from('products').delete().eq('id', id);
  } catch (err) {
    console.error('Remote product delete fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCatalog({
    productId: id,
    productSlug: target?.slug,
    categorySlug: target?.categorySlug,
    action: 'deleted',
  });

  return true;
}

export async function bulkCreateCatalogProducts(
  items: Array<Partial<Product> & { title: string; price: number; categorySlug?: string }>
): Promise<{
  success: boolean;
  count: number;
  products: Product[];
  errors: Array<{ index: number; title: string; error: string }>;
}> {
  if (!items || items.length === 0) {
    return { success: true, count: 0, products: [], errors: [] };
  }

  const validProducts: Product[] = [];
  const errors: Array<{ index: number; title: string; error: string }> = [];
  const dbRows: any[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.title || !item.title.trim()) {
      errors.push({ index: i, title: item.title || 'Untitled', error: 'Product title is required.' });
      continue;
    }
    if (typeof item.price !== 'number' || isNaN(item.price) || item.price <= 0) {
      errors.push({ index: i, title: item.title, error: 'Product price must be a valid positive number.' });
      continue;
    }

    const id = item.id || `prod-${Date.now()}-${i}`;
    const slug = (item.slug && item.slug.trim())
      ? generateSlug(item.slug)
      : generateSlug(item.title) || `prod-${Date.now()}-${i}`;

    const categorySlug = item.categorySlug || 'lips';
    const categoryName = item.categoryName || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

    const newProduct: Product = {
      ...item,
      id,
      slug,
      categorySlug,
      categoryName,
      subtitle: item.subtitle || '',
      shortDescription: item.shortDescription || '',
      description: item.description || '',
      howToUse: item.howToUse || '',
      ingredients: item.ingredients || '',
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      rating: item.rating || 5.0,
      reviewCount: item.reviewCount || 0,
      badges: item.badges || [],
      shades: item.shades || [],
      tags: item.tags || [],
      details: item.details || {
        netWeight: '50g',
        shelfLife: '24 Months',
        origin: 'Bangladesh',
        finish: 'Velvet Matte',
        formulation: 'Botanical Infused',
      },
      images: item.images || {
        primary: '/images/products/placeholder.jpg',
        hover: '/images/products/placeholder.jpg',
        gallery: [],
      },
      inStock: item.inStock !== false,
      isFeatured: Boolean(item.isFeatured),
      isBestseller: Boolean(item.isBestseller),
      isNewLaunch: Boolean(item.isNewLaunch),
      isKit: Boolean(item.isKit),
      isUnder499: item.price <= 499,
    };

    // Update in-memory cache
    const existingIdx = customProducts.findIndex((p) => p.id === id || p.slug === slug);
    if (existingIdx >= 0) {
      customProducts[existingIdx] = newProduct;
    } else {
      customProducts.push(newProduct);
    }

    validProducts.push(newProduct);

    dbRows.push({
      id: newProduct.id,
      slug: newProduct.slug,
      title: newProduct.title,
      category_slug: newProduct.categorySlug,
      category_name: newProduct.categoryName,
      subtitle: newProduct.subtitle,
      short_description: newProduct.shortDescription,
      description: newProduct.description,
      how_to_use: newProduct.howToUse,
      ingredients: newProduct.ingredients,
      details: newProduct.details,
      price: newProduct.price,
      compare_at_price: newProduct.compareAtPrice,
      rating: newProduct.rating,
      review_count: newProduct.reviewCount,
      badges: newProduct.badges,
      shades: newProduct.shades,
      images: newProduct.images,
      in_stock: newProduct.inStock,
      is_featured: newProduct.isFeatured,
      is_bestseller: newProduct.isBestseller,
      is_new_launch: newProduct.isNewLaunch,
      is_kit: newProduct.isKit,
      is_under499: newProduct.isUnder499,
      tags: newProduct.tags,
      updated_at: new Date().toISOString(),
    });
  }

  // Batch upsert to remote Supabase database
  if (dbRows.length > 0) {
    try {
      const { error } = await supabaseAdmin.from('products').upsert(dbRows, { onConflict: 'id' });
      if (error) {
        console.error('Remote bulk product upsert partial failure:', error);
      }
    } catch (err) {
      console.error('Remote bulk product upsert fallback to memory:', err);
    }
  }

  // Revalidate store routes
  revalidateStoreCatalog({ action: 'bulk_updated' });

  return {
    success: true,
    count: validProducts.length,
    products: validProducts,
    errors,
  };
}
