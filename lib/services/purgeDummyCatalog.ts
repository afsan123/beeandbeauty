import { supabaseAdmin } from '../supabase/admin.ts';
import { clearProductCache } from './productService.ts';
import { clearInventoryCache } from './inventoryService.ts';
import { revalidateStoreCatalog } from './revalidateStore.ts';

export const TARGET_DUMMY_PRODUCT_IDS = [
  'prod-1792851205064',   // Demo
  'prod-1792868971218',   // Lipsrick
  'prod-1791752239058-0', // Bulk Batch Radiant Foundation
  'prod-1791752239059-1', // Bulk Batch Silk Kohl Eyeliner
  'prod-1791752239354',   // Botanical Propolis Lash Sculpting Mascara
  'prod-1792808367613-0', // Royal 24K Honey Velvet Matte Lipstick (bulk test duplicate)
  'prod-1792808367615-1', // Propolis Barrier Glow Rescue Serum (bulk test duplicate)
  'prod-1792808367615-2', // Honey Nectar Hydrating Lip Jelly Mask (bulk test duplicate)
];

export const TARGET_ORPHAN_INVENTORY_IDS = [
  'prod-1792811186680',
  ...TARGET_DUMMY_PRODUCT_IDS,
];

export const TARGET_DUMMY_ORDER_IDS = [
  '49bb65fb-f66e-4edf-b453-94515443168a', // Order BB-2026-39252 (Lipsrick)
  '134b4274-4c56-4ee7-8b18-ed33e35d9fbe', // Order BB-2026-48285 (Lipsrick)
  '94d3fa37-b078-484a-8d1c-632217867c59', // Order BB-2026-11007 (Lipsrick)
];

export async function purgeDummyProducts(): Promise<{
  deletedProductsCount: number;
  deletedInventoryCount: number;
  deletedOrdersCount: number;
  deletedOrderItemsCount: number;
}> {
  let deletedProductsCount = 0;
  let deletedInventoryCount = 0;
  let deletedOrdersCount = 0;
  let deletedOrderItemsCount = 0;

  // 1. Delete test order items and orders
  try {
    const { data: deletedItems, error: itemsErr } = await supabaseAdmin
      .from('order_items')
      .delete()
      .in('order_id', TARGET_DUMMY_ORDER_IDS)
      .select('id');
    if (!itemsErr && deletedItems) {
      deletedOrderItemsCount = deletedItems.length;
    }

    const { data: deletedOrders, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .delete()
      .in('id', TARGET_DUMMY_ORDER_IDS)
      .select('id');
    if (!ordersErr && deletedOrders) {
      deletedOrdersCount = deletedOrders.length;
    }
  } catch (err) {
    console.warn('Dummy orders purge notice (non-fatal):', err);
  }

  // 2. Delete inventory overrides for dummy & orphan items
  try {
    const { data: deletedInventory, error: invErr } = await supabaseAdmin
      .from('product_inventory')
      .delete()
      .in('product_id', TARGET_ORPHAN_INVENTORY_IDS)
      .select('product_id');
    if (!invErr && deletedInventory) {
      deletedInventoryCount = deletedInventory.length;
    }
  } catch (err) {
    console.warn('Dummy inventory purge notice (non-fatal):', err);
  }

  // 3. Delete products from Supabase
  try {
    const { data: deletedProds, error: prodErr } = await supabaseAdmin
      .from('products')
      .delete()
      .in('id', TARGET_DUMMY_PRODUCT_IDS)
      .select('id');
    if (!prodErr && deletedProds) {
      deletedProductsCount = deletedProds.length;
    }
  } catch (err) {
    console.warn('Dummy products purge notice (non-fatal):', err);
  }

  // 4. Reset in-memory caches
  clearProductCache();
  clearInventoryCache();

  // 5. Broadcast real-time revalidation to storefront
  revalidateStoreCatalog({ action: 'bulk_updated' });

  return {
    deletedProductsCount,
    deletedInventoryCount,
    deletedOrdersCount,
    deletedOrderItemsCount,
  };
}
