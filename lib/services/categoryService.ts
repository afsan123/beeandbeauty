import { CATEGORIES } from '../../data/mock/catalogData.ts';
import type { Category } from '../../data/types.ts';
import { supabaseAdmin } from '../supabase/admin.ts';
import { revalidateStoreCategories } from './revalidateStore.ts';

// In-memory persistent cache across server-side executions
let inMemoryCategories: Category[] = [];
let isFetchedFromRemote = false;

export function clearCategoryCache(): void {
  inMemoryCategories = [];
  isFetchedFromRemote = false;
}

export async function fetchRemoteCategories(): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      inMemoryCategories = data.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        shortTitle: row.short_title || row.name,
        description: row.description || '',
        tileImage: row.tile_image || '',
        heroBannerImage: row.hero_banner_image || undefined,
        productCount: row.product_count || 0,
        subcategories: Array.isArray(row.subcategories) ? row.subcategories : [],
      }));
      isFetchedFromRemote = true;
    }
  } catch {
    // Graceful fallback to memory
  }
}

export async function getAllCategories(forceRefresh = false): Promise<Category[]> {
  if (!isFetchedFromRemote || forceRefresh) {
    await fetchRemoteCategories();
  }
  const source = inMemoryCategories.length > 0 ? inMemoryCategories : CATEGORIES;
  return [...source];
}

export async function getCategoryBySlug(slug: string, forceRefresh = false): Promise<Category | null> {
  const categories = await getAllCategories(forceRefresh);
  return categories.find((c) => c.slug === slug) || null;
}

export async function createCategory(
  input: Partial<Category> & { slug: string; name: string }
): Promise<Category> {
  const id = input.id || `cat-${Date.now()}`;
  const newCategory: Category = {
    ...input,
    id,
    shortTitle: input.shortTitle || input.name,
    description: input.description || '',
    tileImage: input.tileImage || '/images/categories/placeholder.jpg',
    productCount: input.productCount || 0,
    subcategories: input.subcategories || [],
  };

  // Update in-memory immediately (idempotent upsert)
  const existingIdx = inMemoryCategories.findIndex(
    (c) => c.slug === newCategory.slug || c.id === newCategory.id
  );
  if (existingIdx !== -1) {
    inMemoryCategories[existingIdx] = newCategory;
  } else {
    inMemoryCategories.push(newCategory);
  }

  try {
    await supabaseAdmin.from('categories').insert({
      id: newCategory.id,
      slug: newCategory.slug,
      name: newCategory.name,
      short_title: newCategory.shortTitle,
      description: newCategory.description,
      tile_image: newCategory.tileImage,
      hero_banner_image: newCategory.heroBannerImage,
      product_count: newCategory.productCount,
      subcategories: newCategory.subcategories,
    });
  } catch (err) {
    console.error('Remote category insert fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(newCategory.slug, 'created');

  return newCategory;
}

export async function updateCategory(
  slug: string,
  updates: Partial<Category>
): Promise<Category | null> {
  const index = inMemoryCategories.findIndex((c) => c.slug === slug);
  if (index === -1) return null;

  const updated: Category = {
    ...inMemoryCategories[index],
    ...updates,
  };
  inMemoryCategories[index] = updated;

  try {
    await supabaseAdmin
      .from('categories')
      .update({
        name: updated.name,
        short_title: updated.shortTitle,
        description: updated.description,
        tile_image: updated.tileImage,
        hero_banner_image: updated.heroBannerImage,
        subcategories: updated.subcategories,
      })
      .eq('slug', slug);
  } catch (err) {
    console.error('Remote category update fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(slug, 'updated');

  return updated;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const index = inMemoryCategories.findIndex((c) => c.slug === slug);
  if (index === -1) return false;

  inMemoryCategories.splice(index, 1);

  try {
    await supabaseAdmin.from('categories').delete().eq('slug', slug);
  } catch (err) {
    console.error('Remote category delete fallback to memory:', err);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(slug, 'deleted');

  return true;
}
