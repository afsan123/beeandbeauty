'use client';

import { createBrowserSupabaseClient } from '../supabase/client.ts';
import type { StoredOrder } from './orderService.ts';

const SOUND_PREF_KEY = 'bb_admin_sound_muted';

/**
 * Synthesizes a luxury two-tone golden chime using the browser Web Audio API.
 * Completely self-contained, offline-compatible, and requires no external MP3 files.
 */
export function playLuxuryOrderChime(): void {
  if (typeof window === 'undefined') return;

  try {
    const isMuted = localStorage.getItem(SOUND_PREF_KEY) === 'true';
    if (isMuted) return;

    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();

    // Tone 1: 587.33 Hz (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.001, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.45);

    // Tone 2: 880 Hz (A5 - High Gold Chime)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.001, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.3, ctx.currentTime + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.75);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.75);
  } catch {
    // Gracefully ignore audio autoplay or permissions restrictions
  }
}

export function isOrderSoundMuted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SOUND_PREF_KEY) === 'true';
}

export function setOrderSoundMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SOUND_PREF_KEY, muted ? 'true' : 'false');
}

export interface RealtimeOrderSubscriptionOptions {
  onNewOrder: (order: StoredOrder) => void;
  onOrderUpdated?: (order: StoredOrder) => void;
  playAudio?: boolean;
  pollIntervalMs?: number;
}

const ADMIN_ORDERS_CHANNEL = 'admin-orders';
const ADMIN_ORDER_CREATED_EVENT = 'order_created';

/**
 * Admin order alerts:
 * 1. Polls the authenticated /api/admin/orders route (default every 8s).
 * 2. Listens for a PII-free server broadcast ('admin-orders' / 'order_created')
 *    and re-fetches immediately when it arrives.
 * Order data is only ever read through the admin API — never from Realtime,
 * so customer details are not exposed to anon Realtime subscribers.
 */
export function subscribeToRealtimeOrders({
  onNewOrder,
  onOrderUpdated,
  playAudio = true,
  pollIntervalMs = 8000,
}: RealtimeOrderSubscriptionOptions): () => void {
  if (typeof window === 'undefined') return () => {};

  const knownOrders = new Map<string, string>();
  let isSubscribed = true;
  let isFirstFetch = true;
  let inFlight = false;

  const fingerprint = (o: StoredOrder) => `${o.orderStatus}|${o.paymentStatus}`;

  const checkOrders = async (force = false) => {
    if (!isSubscribed || inFlight) return;
    // Don't poll while the tab is hidden (saves mobile battery).
    if (!force && document.hidden) return;

    inFlight = true;
    try {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!res.ok) return;

      const data = await res.json();
      const currentOrders: StoredOrder[] = data.orders || [];

      if (isFirstFetch) {
        currentOrders.forEach((o) => knownOrders.set(o.id || o.orderNumber, fingerprint(o)));
        isFirstFetch = false;
        return;
      }

      for (const order of currentOrders) {
        const key = order.id || order.orderNumber;
        const previous = knownOrders.get(key);
        knownOrders.set(key, fingerprint(order));
        if (previous === undefined) {
          if (playAudio) playLuxuryOrderChime();
          onNewOrder(order);
        } else if (previous !== fingerprint(order)) {
          onOrderUpdated?.(order);
        }
      }
    } catch {
      // Ignore background network errors
    } finally {
      inFlight = false;
    }
  };

  checkOrders(true);
  const timer = setInterval(() => checkOrders(), pollIntervalMs);

  const supabase = createBrowserSupabaseClient();
  const channel = supabase
    ? supabase
        .channel(ADMIN_ORDERS_CHANNEL)
        .on('broadcast', { event: ADMIN_ORDER_CREATED_EVENT }, () => {
          checkOrders(true);
        })
        .subscribe()
    : null;

  return () => {
    isSubscribed = false;
    clearInterval(timer);
    if (channel && supabase) {
      supabase.removeChannel(channel).catch(() => {});
    }
  };
}
