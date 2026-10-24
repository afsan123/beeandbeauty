import { revalidatePath, revalidateTag } from 'next/cache.js';
import { STORE_TAGS } from '../cache/tags.ts';
import { supabaseAdmin, tryGetSupabaseAdmin } from '../supabase/admin.ts';

export type StorefrontEntityType = 'product' | 'inventory' | 'category' | 'banner' | 'offer';
export type StorefrontActionType = 'created' | 'updated' | 'deleted' | 'bulk_updated';

export interface StorefrontSyncEvent {
  entity: StorefrontEntityType;
  action: StorefrontActionType;
  id?: string;
  slug?: string;
  timestamp: string;
  payload?: unknown;
}

function revalidateStoreTags(tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, 'max');
    } catch (err) {
      if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
        console.warn('Next.js revalidateTag notice (non-fatal):', err);
      }
    }
  }
}

export async function broadcastStorefrontEvent(event: StorefrontSyncEvent): Promise<void> {
  if (!tryGetSupabaseAdmin()) return;
  try {
    const channel = supabaseAdmin.channel('storefront-sync');
    if (typeof (channel as { httpSend?: Function }).httpSend === 'function') {
      await (channel as { httpSend: Function }).httpSend('storefront_mutation', event);
    } else {
      await channel.send({
        type: 'broadcast',
        event: 'storefront_mutation',
        payload: event,
      });
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Realtime broadcast error (non-fatal):', err);
    }
  }
}

export function revalidateStoreCatalog(options?: {
  productId?: string;
  categorySlug?: string;
  productSlug?: string;
  action?: StorefrontActionType;
  payload?: unknown;
}) {
  revalidateStoreTags([STORE_TAGS.catalog, STORE_TAGS.products, STORE_TAGS.categories]);

  try {
    revalidatePath('/', 'page');
    revalidatePath('/shop/[category]', 'page');
    revalidatePath('/product/[slug]', 'page');
    revalidatePath('/search', 'page');
    revalidatePath('/offers', 'page');
    revalidatePath('/sitemap.xml');

    if (options?.categorySlug) {
      revalidatePath(`/shop/${options.categorySlug}`, 'page');
    }
    if (options?.productSlug) {
      revalidatePath(`/product/${options.productSlug}`, 'page');
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
      console.warn('Next.js revalidatePath notice (non-fatal):', err);
    }
  }

  broadcastStorefrontEvent({
    entity: 'product',
    action: options?.action || 'updated',
    id: options?.productId,
    slug: options?.productSlug,
    timestamp: new Date().toISOString(),
    payload: options?.payload,
  }).catch(() => {});
}

export function revalidateStoreBanners(bannerId?: string, action: StorefrontActionType = 'updated') {
  revalidateStoreTags([STORE_TAGS.banners, STORE_TAGS.catalog]);
  try {
    revalidatePath('/', 'page');
    revalidatePath('/offers', 'page');
  } catch (err) {
    if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
      console.warn('Next.js revalidatePath notice (non-fatal):', err);
    }
  }

  broadcastStorefrontEvent({
    entity: 'banner',
    action,
    id: bannerId,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

export function revalidateStoreCategories(categorySlug?: string, action: StorefrontActionType = 'updated') {
  revalidateStoreTags([STORE_TAGS.categories, STORE_TAGS.catalog]);
  try {
    revalidatePath('/', 'page');
    revalidatePath('/shop/[category]', 'page');
    revalidatePath('/sitemap.xml');
    if (categorySlug) {
      revalidatePath(`/shop/${categorySlug}`, 'page');
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
      console.warn('Next.js revalidatePath notice (non-fatal):', err);
    }
  }

  broadcastStorefrontEvent({
    entity: 'category',
    action,
    slug: categorySlug,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

export function revalidateStoreOffers(offerId?: string, action: StorefrontActionType = 'updated') {
  revalidateStoreTags([STORE_TAGS.offers, STORE_TAGS.catalog]);
  try {
    revalidatePath('/', 'page');
    revalidatePath('/offers', 'page');
  } catch (err) {
    if (process.env.NODE_ENV !== 'test' && !process.env.NODE_TEST_CONTEXT) {
      console.warn('Next.js revalidatePath notice (non-fatal):', err);
    }
  }

  broadcastStorefrontEvent({
    entity: 'offer',
    action,
    id: offerId,
    timestamp: new Date().toISOString(),
  }).catch(() => {});
}

export function revalidateStoreTutorials() {
  revalidateStoreTags([STORE_TAGS.tutorials]);
  try {
    revalidatePath('/', 'page');
  } catch {
    // non-fatal
  }
}
