import { CATEGORIES } from '../../data/mock/catalogData.ts';
import type { Category } from '../../data/types.ts';
import { isSupabaseAdminReady, supabaseAdmin } from '../supabase/admin.ts';
import { toServiceError } from './serviceError.ts';
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

  if (isSupabaseAdminReady()) {
    const { error } = await supabaseAdmin.from('categories').insert({
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
    if (error) {
      throw toServiceError(error, 'Creating the category');
    }
  }

  const existingIdx = inMemoryCategories.findIndex(
    (c) => c.slug === newCategory.slug || c.id === newCategory.id
  );
  if (existingIdx !== -1) {
    inMemoryCategories[existingIdx] = newCategory;
  } else {
    inMemoryCategories.push(newCategory);
  }

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(newCategory.slug, 'created');

  return newCategory;
}

export async function updateCategory(
  slug: string,
  updates: Partial<Category>
): Promise<Category | null> {
  const existing = await getCategoryBySlug(slug);
  if (!existing) return null;

  const updated: Category = {
    ...existing,
    ...updates,
    slug: existing.slug,
  };

  if (isSupabaseAdminReady()) {
    const { error } = await supabaseAdmin
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
    if (error) {
      throw toServiceError(error, 'Updating the category');
    }
  }

  const index = inMemoryCategories.findIndex((c) => c.slug === slug);
  if (index !== -1) inMemoryCategories[index] = updated;

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(slug, 'updated');

  return updated;
}

export async function deleteCategory(slug: string): Promise<boolean> {
  const existing = await getCategoryBySlug(slug);
  if (!existing) return false;

  if (isSupabaseAdminReady()) {
    const { error } = await supabaseAdmin.from('categories').delete().eq('slug', slug);
    if (error) {
      // products.category_slug -> categories(slug) ON DELETE RESTRICT
      throw toServiceError(
        error,
        'Deleting the category',
        'This category still has products. Move or delete those products first, then delete the category.'
      );
    }
  }

  const index = inMemoryCategories.findIndex((c) => c.slug === slug);
  if (index !== -1) inMemoryCategories.splice(index, 1);

  // Trigger store revalidation and broadcast
  revalidateStoreCategories(slug, 'deleted');

  return true;
}
