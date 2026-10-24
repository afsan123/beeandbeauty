'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation.js';
import { createBrowserSupabaseClient } from '../supabase/client.ts';
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
 * via a Supabase Realtime Broadcast channel. Admin writes call revalidateTag
 * (server cache) and then send a 'storefront_mutation' broadcast; this hook
 * just refreshes the router. No postgres_changes subscriptions, so table rows
 * are never streamed to anonymous visitors.
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

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const channel = supabase.channel('storefront-sync');

    channel
      .on('broadcast', { event: 'storefront_mutation' }, (payload) => {
        if (payload?.payload) {
          handleEvent(payload.payload as StorefrontSyncEvent);
        }
      })
      .subscribe();

    // Sync on tab focus / visibility return
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
