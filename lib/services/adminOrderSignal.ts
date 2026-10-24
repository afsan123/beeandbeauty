import { tryGetSupabaseAdmin } from '../supabase/admin.ts';

export const ADMIN_ORDERS_CHANNEL = 'admin-orders';
export const ADMIN_ORDER_CREATED_EVENT = 'order_created';

/**
 * Server-sent Realtime broadcast telling open admin dashboards to re-fetch
 * orders now instead of waiting for the next poll. Deliberately PII-free:
 * the payload carries only a timestamp, and admins load the actual order data
 * through the authenticated /api/admin/orders route. Never throws.
 */
export async function notifyAdminOrderCreated(): Promise<void> {
  const admin = tryGetSupabaseAdmin();
  if (!admin) return;
  try {
    const channel = admin.channel(ADMIN_ORDERS_CHANNEL);
    await channel.httpSend(ADMIN_ORDER_CREATED_EVENT, { at: new Date().toISOString() });
    await admin.removeChannel(channel);
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('[orders] admin order broadcast failed (non-fatal):', err);
    }
  }
}
