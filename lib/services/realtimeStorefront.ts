'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation.js';
import { supabase } from '../supabase/client.ts';
import type { StorefrontSyncEvent } from './revalidateStore.ts';

export interface UseStorefrontRealtimeOptions {
  onCatalogUpdate?: (event: StorefrontSyncEvent) => void;
  onBannerUpdate?: (event: StorefrontSyncEvent) => void;
  onOfferUpdate?: (event: StorefrontSyncEvent) => void;
  onCategoryUpdate?: (event: StorefrontSyncEvent) => void;
  triggerRouterRefresh?: boolean;
}

/**
 * Universal Storefront Real-Time Hook:
 * Subscribes the active browser page to live administrative mutations
 * via Supabase WebSockets (Broadcast channel & Postgres Table Replication).
 */
export function useStorefrontRealtime({
  onCatalogUpdate,
  onBannerUpdate,
  onOfferUpdate,
  onCategoryUpdate,
  triggerRouterRefresh = true,
}: UseStorefrontRealtimeOptions = {}) {
  const router = useRouter();
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedRefresh = () => {
    if (!triggerRouterRefresh) return;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      try {
        router.refresh();
      } catch {
        // Graceful
      }
    }, 300);
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    const handleEvent = (event: StorefrontSyncEvent) => {
      if (!isSubscribed) return;

      if (event.entity === 'product' || event.entity === 'inventory') {
        onCatalogUpdate?.(event);
      } else if (event.entity === 'banner') {
        onBannerUpdate?.(event);
      } else if (event.entity === 'offer') {
        onOfferUpdate?.(event);
      } else if (event.entity === 'category') {
        onCategoryUpdate?.(event);
      }

      debouncedRefresh();
    };

    // 1. Subscribe to Supabase Realtime Broadcast channel
    const channel = supabase.channel('storefront-sync');

    channel
      .on('broadcast', { event: 'storefront_mutation' }, (payload) => {
        if (payload?.payload) {
          handleEvent(payload.payload as StorefrontSyncEvent);
        }
      })
      // 2. Also listen directly to PostgreSQL changes as dual-safety
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          handleEvent({
            entity: 'product',
            action: payload.eventType === 'INSERT' ? 'created' : payload.eventType === 'DELETE' ? 'deleted' : 'updated',
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            slug: (payload.new as any)?.slug,
            timestamp: new Date().toISOString(),
            payload: payload.new,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_inventory' },
        (payload) => {
          handleEvent({
            entity: 'inventory',
            action: 'updated',
            id: (payload.new as any)?.product_id,
            timestamp: new Date().toISOString(),
            payload: payload.new,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'banners' },
        (payload) => {
          handleEvent({
            entity: 'banner',
            action: payload.eventType === 'INSERT' ? 'created' : payload.eventType === 'DELETE' ? 'deleted' : 'updated',
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString(),
            payload: payload.new,
          });
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'limited_offers' },
        (payload) => {
          handleEvent({
            entity: 'offer',
            action: payload.eventType === 'INSERT' ? 'created' : payload.eventType === 'DELETE' ? 'deleted' : 'updated',
            id: (payload.new as any)?.id || (payload.old as any)?.id,
            timestamp: new Date().toISOString(),
            payload: payload.new,
          });
        }
      )
      .subscribe();

    // 3. Sync on tab focus / visibility return
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        debouncedRefresh();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isSubscribed = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      supabase.removeChannel(channel).catch(() => {});
    };
  }, [router, triggerRouterRefresh]);
}
