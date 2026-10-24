import { revalidatePath } from 'next/cache.js';
import { supabaseAdmin } from '../supabase/admin.ts';

export type StorefrontEntityType = 'product' | 'inventory' | 'category' | 'banner' | 'offer';
export type StorefrontActionType = 'created' | 'updated' | 'deleted' | 'bulk_updated';

export interface StorefrontSyncEvent {
  entity: StorefrontEntityType;
  action: StorefrontActionType;
  id?: string;
  slug?: string;
  timestamp: string;
  payload?: any;
}

/**
 * Broadcasts a lightweight real-time event to connected storefront clients
 * over the Supabase Realtime WebSocket channel.
 */
export async function broadcastStorefrontEvent(event: StorefrontSyncEvent): Promise<void> {
  try {
    const channel = supabaseAdmin.channel('storefront-sync');
    if (typeof (channel as any).httpSend === 'function') {
      await (channel as any).httpSend('storefront_mutation', event);
    } else {
      await channel.send({
        type: 'broadcast',
        event: 'storefront_mutation',
        payload: event,
      });
    }
  } catch (err) {
    // Non-blocking fallback
    if (process.env.NODE_ENV !== 'test') {
      console.warn('Realtime broadcast error (non-fatal):', err);
    }
  }
}

/**
 * Purges and revalidates Next.js 16 App Router static and PPR caches
 * across the storefront for product catalog mutations.
 */
export function revalidateStoreCatalog(options?: {
  productId?: string;
  categorySlug?: string;
  productSlug?: string;
  action?: StorefrontActionType;
  payload?: any;
}) {
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

  // Also broadcast the event over Realtime channel
  broadcastStorefrontEvent({
    entity: 'product',
    action: options?.action || 'updated',
    id: options?.productId,
    slug: options?.productSlug,
    timestamp: new Date().toISOString(),
    payload: options?.payload,
  }).catch(() => {});
}

/**
 * Revalidates routes when hero banners or promos change.
 */
export function revalidateStoreBanners(bannerId?: string, action: StorefrontActionType = 'updated') {
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

/**
 * Revalidates routes when categories are created, updated, or removed.
 */
export function revalidateStoreCategories(categorySlug?: string, action: StorefrontActionType = 'updated') {
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

/**
 * Revalidates routes when limited offers and flash deals change.
 */
export function revalidateStoreOffers(offerId?: string, action: StorefrontActionType = 'updated') {
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
