'use client';

import { supabase } from '../supabase/client.ts';
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

/**
 * Dual-Engine Real-Time Order Subscription:
 * 1. Supabase Realtime WebSocket changes (instant push)
 * 2. Smart background polling heartbeat (every 8s fallback)
 */
export function subscribeToRealtimeOrders({
  onNewOrder,
  onOrderUpdated,
  playAudio = true,
  pollIntervalMs = 8000,
}: RealtimeOrderSubscriptionOptions): () => void {
  if (typeof window === 'undefined') return () => {};

  const knownOrderIds = new Set<string>();
  let isSubscribed = true;
  let isFirstFetch = true;

  // Polling fetch function
  const checkOrders = async () => {
    if (!isSubscribed) return;
    // Don't poll if browser tab is hidden to save mobile battery
    if (document.hidden) return;

    try {
      const res = await fetch('/api/admin/orders');
      if (!res.ok) return;

      const data = await res.json();
      const currentOrders: StoredOrder[] = data.orders || [];

      if (isFirstFetch) {
        currentOrders.forEach((o) => knownOrderIds.add(o.id || o.orderNumber));
        isFirstFetch = false;
        return;
      }

      // Check for newly placed orders
      for (const order of currentOrders) {
        const key = order.id || order.orderNumber;
        if (!knownOrderIds.has(key)) {
          knownOrderIds.add(key);
          if (playAudio) {
            playLuxuryOrderChime();
          }
          onNewOrder(order);
        }
      }
    } catch {
      // Ignore background network errors
    }
  };

  // 1. Initial hydration
  checkOrders();

  // 2. Setup periodic polling heartbeat
  const timer = setInterval(checkOrders, pollIntervalMs);

  // 3. Setup Supabase Realtime channel if available
  let realtimeChannel: any = null;
  try {
    realtimeChannel = supabase
      .channel('realtime-orders-admin')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (!isSubscribed) return;
          const newRow = payload.new as any;
          if (newRow) {
            const mappedOrder: StoredOrder = {
              id: newRow.id,
              orderNumber: newRow.order_number,
              customerName: newRow.customer_name,
              customerEmail: newRow.customer_email,
              customerPhone: newRow.customer_phone,
              streetAddress: newRow.street_address,
              district: newRow.district,
              postalCode: newRow.postal_code,
              deliveryZone: newRow.delivery_zone || 'dhaka',
              subtotal: Number(newRow.subtotal || 0),
              discountAmount: Number(newRow.discount_amount || 0),
              shippingFee: Number(newRow.shipping_fee || 0),
              totalAmount: Number(newRow.total_amount || 0),
              paymentMethod: newRow.payment_method || 'cod',
              paymentStatus: newRow.payment_status || 'pending',
              orderStatus: newRow.order_status || 'confirmed',
              targetDelivery: newRow.target_delivery || 'Inside Dhaka: Target 24h',
              courierTrackingCode: newRow.courier_tracking_code,
              notes: newRow.notes,
              createdAt: newRow.created_at || new Date().toISOString(),
              items: [],
            };

            const key = mappedOrder.id || mappedOrder.orderNumber;
            if (!knownOrderIds.has(key)) {
              knownOrderIds.add(key);
              if (playAudio) {
                playLuxuryOrderChime();
              }
              onNewOrder(mappedOrder);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (!isSubscribed) return;
          const updatedRow = payload.new as any;
          if (updatedRow && onOrderUpdated) {
            const mappedOrder: StoredOrder = {
              id: updatedRow.id,
              orderNumber: updatedRow.order_number,
              customerName: updatedRow.customer_name,
              customerEmail: updatedRow.customer_email,
              customerPhone: updatedRow.customer_phone,
              streetAddress: updatedRow.street_address,
              district: updatedRow.district,
              postalCode: updatedRow.postal_code,
              deliveryZone: updatedRow.delivery_zone || 'dhaka',
              subtotal: Number(updatedRow.subtotal || 0),
              discountAmount: Number(updatedRow.discount_amount || 0),
              shippingFee: Number(updatedRow.shipping_fee || 0),
              totalAmount: Number(updatedRow.total_amount || 0),
              paymentMethod: updatedRow.payment_method || 'cod',
              paymentStatus: updatedRow.payment_status || 'pending',
              orderStatus: updatedRow.order_status || 'confirmed',
              targetDelivery: updatedRow.target_delivery || 'Inside Dhaka: Target 24h',
              courierTrackingCode: updatedRow.courier_tracking_code,
              notes: updatedRow.notes,
              createdAt: updatedRow.created_at,
              items: [],
            };
            onOrderUpdated(mappedOrder);
          }
        }
      )
      .subscribe();
  } catch {
    // Fallback solely to polling heartbeat
  }

  // Cleanup on unmount
  return () => {
    isSubscribed = false;
    clearInterval(timer);
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel);
    }
  };
}
