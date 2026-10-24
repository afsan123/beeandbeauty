import { isSupabaseAdminReady, supabaseAdmin } from '../supabase/admin.ts';
import { ServiceError } from './serviceError.ts';
import { notifyAdminOrderCreated } from './adminOrderSignal.ts';
import { generateOrderNumber, randomToken, timingSafeEqualString } from '../security/crypto.ts';
import { normalizeBdPhone, phonesMatch } from '../security/phone.ts';
import { getAllCatalogProducts } from './productService.ts';
import { calculateShipping } from './shippingService.ts';
import { validateCoupon } from './couponService.ts';
import { provisionCustomerForOrder } from './customerAccount.ts';

export interface OrderItemInput {
  productId: string;
  shadeId?: string;
  quantity: number;
}

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  district: string;
  postalCode?: string;
  notes?: string;
  deliveryZone?: 'dhaka' | 'outside';
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  couponCode?: string;
  items: OrderItemInput[];
}

export interface StoredOrderItem {
  id?: string;
  productId: string;
  productTitle: string;
  shadeName?: string;
  shadeCode?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface StoredOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  district: string;
  postalCode?: string;
  deliveryZone: 'dhaka' | 'outside';
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: 'cod' | 'bkash' | 'nagad';
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  targetDelivery: string;
  courierTrackingCode?: string;
  notes?: string;
  createdAt: string;
  items: StoredOrderItem[];
  customerId?: string;
  accessToken?: string;
  account?: {
    created: boolean;
    emailSent: boolean;
    channel: 'resend' | 'supabase' | 'none';
  };
}

export interface TrackingStep {
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming';
}

// Local-only order store, used ONLY when Supabase is not configured (unit tests
// and local dev without env). When Supabase is configured the database is the
// single source of truth and write failures are surfaced to the caller.
const fallbackOrdersCache = new Map<string, StoredOrder>();

function useLocalOrderStore(): boolean {
  return !isSupabaseAdminReady();
}

function mapOrderItemRow(it: Record<string, any>): StoredOrderItem {
  return {
    id: it.id,
    productId: it.product_id,
    productTitle: it.product_title,
    shadeName: it.shade_name ?? undefined,
    shadeCode: it.shade_code ?? undefined,
    unitPrice: Number(it.unit_price),
    quantity: Number(it.quantity),
    lineTotal: Number(it.line_total),
  };
}

function mapOrderRow(orderData: Record<string, any>, items: StoredOrderItem[]): StoredOrder {
  return {
    id: orderData.id,
    orderNumber: orderData.order_number,
    customerName: orderData.customer_name,
    customerEmail: orderData.customer_email,
    customerPhone: orderData.customer_phone,
    streetAddress: orderData.street_address,
    district: orderData.district,
    postalCode: orderData.postal_code ?? undefined,
    deliveryZone: orderData.delivery_zone,
    subtotal: Number(orderData.subtotal),
    discountAmount: Number(orderData.discount_amount || 0),
    shippingFee: Number(orderData.shipping_fee),
    totalAmount: Number(orderData.total_amount),
    couponCode: orderData.coupon_code ?? undefined,
    paymentMethod: orderData.payment_method,
    paymentStatus: orderData.payment_status,
    orderStatus: orderData.order_status,
    targetDelivery: orderData.target_delivery,
    courierTrackingCode: orderData.courier_tracking_code ?? undefined,
    notes: orderData.notes ?? undefined,
    createdAt: orderData.created_at,
    items,
    customerId: orderData.customer_id || undefined,
    accessToken: orderData.access_token || undefined,
  };
}

/**
 * Persist the order and its line items. If the items insert fails the order
 * row is removed again so we never keep a half-written order.
 */
async function persistOrder(order: StoredOrder): Promise<void> {
  const { error: orderError } = await supabaseAdmin.from('orders').insert({
    id: order.id,
    order_number: order.orderNumber,
    customer_name: order.customerName,
    customer_email: order.customerEmail,
    customer_phone: order.customerPhone,
    street_address: order.streetAddress,
    district: order.district,
    postal_code: order.postalCode,
    delivery_zone: order.deliveryZone,
    subtotal: order.subtotal,
    discount_amount: order.discountAmount,
    shipping_fee: order.shippingFee,
    total_amount: order.totalAmount,
    coupon_code: order.couponCode,
    payment_method: order.paymentMethod,
    payment_status: order.paymentStatus,
    order_status: order.orderStatus,
    target_delivery: order.targetDelivery,
    courier_tracking_code: order.courierTrackingCode,
    notes: order.notes,
    access_token: order.accessToken,
    created_at: order.createdAt,
  });

  if (orderError) {
    console.error('[orders] Order insert failed:', orderError.code, orderError.message);
    throw new ServiceError(
      'We could not place your order right now. Nothing was charged — please try again in a moment.',
      503,
      orderError.code
    );
  }

  const { error: itemsError } = await supabaseAdmin.from('order_items').insert(
    order.items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_title: item.productTitle,
      shade_name: item.shadeName,
      shade_code: item.shadeCode,
      unit_price: item.unitPrice,
      quantity: item.quantity,
      line_total: item.lineTotal,
    }))
  );

  if (itemsError) {
    console.error('[orders] Order items insert failed:', itemsError.code, itemsError.message);
    const { error: rollbackError } = await supabaseAdmin.from('orders').delete().eq('id', order.id);
    if (rollbackError) {
      console.error('[orders] Rollback of partial order failed:', order.id, rollbackError.message);
    }
    throw new ServiceError(
      itemsError.code === '23503'
        ? 'One of the products in your cart is no longer available. Please refresh your cart and try again.'
        : 'We could not place your order right now. Nothing was charged — please try again in a moment.',
      itemsError.code === '23503' ? 409 : 503,
      itemsError.code
    );
  }
}

export { normalizeBdPhone as normalizePhone };

export async function createOrder(payload: CreateOrderPayload): Promise<StoredOrder> {
  // 1. Validate required customer details
  if (!payload.customerName?.trim()) {
    throw new Error('Full Name is required.');
  }
  if (!payload.customerEmail?.trim() || !payload.customerEmail.includes('@')) {
    throw new Error('A valid email address is required.');
  }
  if (!payload.customerPhone?.trim()) {
    throw new Error('Mobile number is required.');
  }
  if (!payload.streetAddress?.trim()) {
    throw new Error('Delivery address is required.');
  }
  if (!payload.district?.trim()) {
    throw new Error('District is required.');
  }
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Cart must contain at least one product.');
  }

  const allProducts = await getAllCatalogProducts(true);
  const productsMap = new Map(allProducts.map((p) => [p.id, p]));

  const orderItems: StoredOrderItem[] = [];
  let calculatedSubtotal = 0;

  for (const item of payload.items) {
    const product = productsMap.get(item.productId);
    if (!product) {
      throw new Error(`Product ID "${item.productId}" not found in catalog.`);
    }

    const qty = Math.max(1, Math.floor(item.quantity || 1));
    const unitPrice = typeof product.price === 'number' ? product.price : ((product.price as unknown as { sale?: number })?.sale || 0); // Canonical server price
    const lineTotal = unitPrice * qty;
    calculatedSubtotal += lineTotal;

    let shadeName: string | undefined;
    let shadeCode: string | undefined;

    if (item.shadeId && product.shades?.length) {
      const selectedShade = product.shades.find((s) => s.id === item.shadeId);
      if (selectedShade) {
        shadeName = selectedShade.name;
        shadeCode = selectedShade.code;
      }
    }

    orderItems.push({
      productId: product.id,
      productTitle: product.title,
      shadeName,
      shadeCode,
      unitPrice,
      quantity: qty,
      lineTotal,
    });
  }

  // 3. Recalculate coupon discount on server side
  let discountAmount = 0;
  let isFreeShippingCoupon = false;

  if (payload.couponCode) {
    const couponResult = await validateCoupon(payload.couponCode, calculatedSubtotal);
    if (couponResult.valid) {
      if (couponResult.discountType === 'free_shipping') {
        isFreeShippingCoupon = true;
      } else {
        discountAmount = couponResult.discountAmount;
      }
    }
  }

  // 4. Recalculate shipping logistics on server side
  const shippingResult = calculateShipping(payload.district, calculatedSubtotal);
  let shippingFee = isFreeShippingCoupon ? 0 : shippingResult.shippingFee;
  const deliveryZone = payload.deliveryZone || shippingResult.zone;

  const totalAmount = Math.max(0, calculatedSubtotal - discountAmount + shippingFee);

  const orderNumber = generateOrderNumber();
  const orderId = crypto.randomUUID();
  const accessToken = randomToken(24);
  const now = new Date().toISOString();

  const storedOrder: StoredOrder = {
    id: orderId,
    orderNumber,
    customerName: payload.customerName.trim(),
    customerEmail: payload.customerEmail.trim().toLowerCase(),
    customerPhone: payload.customerPhone.trim(),
    streetAddress: payload.streetAddress.trim(),
    district: payload.district.trim(),
    postalCode: payload.postalCode?.trim(),
    deliveryZone,
    subtotal: calculatedSubtotal,
    discountAmount,
    shippingFee,
    totalAmount,
    couponCode: payload.couponCode?.trim().toUpperCase() || undefined,
    paymentMethod: payload.paymentMethod,
    paymentStatus: payload.paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: 'confirmed',
    targetDelivery: shippingResult.targetTimeline,
    courierTrackingCode: `ST-${Math.floor(100000 + Math.random() * 900000)}`,
    notes: payload.notes?.trim(),
    createdAt: now,
    items: orderItems,
    accessToken,
    account: { created: false, emailSent: false, channel: 'none' },
  };

  if (useLocalOrderStore()) {
    fallbackOrdersCache.set(storedOrder.orderNumber, storedOrder);
    fallbackOrdersCache.set(storedOrder.id, storedOrder);
  } else {
    // Throws a real error if the database write fails — no silent data loss.
    await persistOrder(storedOrder);
    // PII-free ping so open admin dashboards refresh immediately.
    await notifyAdminOrderCreated();
  }

  // The order is saved at this point. Account creation / email is best effort
  // and must never fail an otherwise-saved order.
  try {
    const account = await provisionCustomerForOrder({
      orderId: storedOrder.id,
      orderNumber: storedOrder.orderNumber,
      email: storedOrder.customerEmail,
      fullName: storedOrder.customerName,
      phone: storedOrder.customerPhone,
    });
    storedOrder.customerId = account.linked ? account.customerId || undefined : undefined;
    storedOrder.account = {
      created: account.accountCreated,
      emailSent: account.emailSent,
      channel: account.emailChannel,
    };
  } catch (err) {
    console.error('[orders] Customer account provisioning failed (order kept):', err);
  }

  return storedOrder;
}

export async function getOrdersForCustomer(customerId: string): Promise<StoredOrder[]> {
  if (useLocalOrderStore()) {
    const all = await getAllOrders();
    return all.filter((order) => order.customerId === customerId);
  }

  const { data: ordersData, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });
  if (error) {
    console.error('[orders] getOrdersForCustomer failed:', error.message);
    throw new ServiceError('Could not load your orders right now.', 503, error.code);
  }
  return (ordersData || []).map((row) =>
    mapOrderRow(row, Array.isArray(row.order_items) ? row.order_items.map(mapOrderItemRow) : [])
  );
}

export function orderMatchesAccessToken(order: StoredOrder, token?: string | null): boolean {
  if (!token || !order.accessToken) return false;
  return timingSafeEqualString(order.accessToken, token);
}

export async function getOrderById(id: string): Promise<StoredOrder | null> {
  const cleanId = id.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

  if (useLocalOrderStore()) {
    return fallbackOrdersCache.get(cleanId) || null;
  }

  let query = supabaseAdmin.from('orders').select('*');
  if (isUuid) {
    query = query.or(`id.eq.${cleanId},order_number.eq.${cleanId}`);
  } else {
    query = query.eq('order_number', cleanId);
  }

  const { data: orderData, error } = await query.maybeSingle();
  if (error) {
    console.error('[orders] getOrderById failed:', error.message);
    throw new ServiceError('Could not load the order right now.', 503, error.code);
  }
  if (!orderData) return null;

  const { data: itemsData, error: itemsError } = await supabaseAdmin
    .from('order_items')
    .select('*')
    .eq('order_id', orderData.id);
  if (itemsError) {
    console.error('[orders] getOrderById items failed:', itemsError.message);
    throw new ServiceError('Could not load the order right now.', 503, itemsError.code);
  }

  return mapOrderRow(orderData, (itemsData || []).map(mapOrderItemRow));
}

export async function trackOrderByPhone(
  orderNumber: string,
  phone: string
): Promise<{ order: StoredOrder; timeline: TrackingStep[] } | null> {
  const cleanOrderNum = orderNumber.trim().toUpperCase();

  const order = await getOrderById(cleanOrderNum);
  if (!order) {
    return null;
  }

  if (!phonesMatch(order.customerPhone, phone)) {
    return null;
  }

  // Construct visual tracking timeline
  const timeline: TrackingStep[] = [
    {
      title: 'Order Placed',
      description: `Order received and confirmed under reference #${order.orderNumber}.`,
      status: 'completed',
    },
    {
      title: 'Verification & Quality Check',
      description: 'Cosmetics batch verification, batch code scan, and propolis seal check.',
      status: order.orderStatus === 'pending' ? 'current' : 'completed',
    },
    {
      title: 'Packaging & Dispatch',
      description: `Packed in luxury velvet protection. Handed over to courier (${order.targetDelivery}).`,
      status:
        order.orderStatus === 'processing'
          ? 'current'
          : order.orderStatus === 'shipped' || order.orderStatus === 'delivered'
          ? 'completed'
          : 'upcoming',
    },
    {
      title: 'Out for Doorstep Delivery',
      description: `Rider assigned for doorstep delivery in ${order.district}. Tracking: ${order.courierTrackingCode || 'Assigned on dispatch'}.`,
      status:
        order.orderStatus === 'shipped'
          ? 'current'
          : order.orderStatus === 'delivered'
          ? 'completed'
          : 'upcoming',
    },
    {
      title: 'Delivered',
      description: 'Package handed over and payment settled.',
      status: order.orderStatus === 'delivered' ? 'completed' : 'upcoming',
    },
  ];

  return { order, timeline };
}

export interface OrderFilters {
  status?: string;
  paymentStatus?: string;
  search?: string;
  zone?: string;
}

export async function getAllOrders(filters?: OrderFilters): Promise<StoredOrder[]> {
  let orders: StoredOrder[] = [];

  if (useLocalOrderStore()) {
    orders = Array.from(new Set(fallbackOrdersCache.values()));
    if (filters?.status && filters.status !== 'all') orders = orders.filter((o) => o.orderStatus === filters.status);
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') orders = orders.filter((o) => o.paymentStatus === filters.paymentStatus);
    if (filters?.zone && filters.zone !== 'all') orders = orders.filter((o) => o.deliveryZone === filters.zone);
  } else {
    let query = supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('order_status', filters.status);
    }
    if (filters?.paymentStatus && filters.paymentStatus !== 'all') {
      query = query.eq('payment_status', filters.paymentStatus);
    }
    if (filters?.zone && filters.zone !== 'all') {
      query = query.eq('delivery_zone', filters.zone);
    }

    const { data: ordersData, error } = await query;
    if (error) {
      console.error('[orders] getAllOrders failed:', error.message);
      throw new ServiceError('Could not load orders right now.', 503, error.code);
    }

    if (ordersData && ordersData.length > 0) {
      const orderIds = ordersData.map((o) => o.id);
      const { data: allItemsData, error: itemsError } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);
      if (itemsError) {
        console.error('[orders] getAllOrders items failed:', itemsError.message);
        throw new ServiceError('Could not load orders right now.', 503, itemsError.code);
      }

      const itemsByOrderId = new Map<string, StoredOrderItem[]>();
      (allItemsData || []).forEach((it) => {
        const list = itemsByOrderId.get(it.order_id) || [];
        list.push(mapOrderItemRow(it));
        itemsByOrderId.set(it.order_id, list);
      });

      orders = ordersData.map((orderData) => mapOrderRow(orderData, itemsByOrderId.get(orderData.id) || []));
    }
  }

  // Client-side / fallback search filtering
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    orders = orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q) ||
        o.customerEmail.toLowerCase().includes(q)
    );
  }

  return orders;
}

export async function updateOrderStatus(
  orderIdOrNumber: string,
  newStatus: StoredOrder['orderStatus'],
  courierTrackingCode?: string
): Promise<StoredOrder | null> {
  const existing = await getOrderById(orderIdOrNumber);
  if (!existing) return null;

  const updatePayload: Record<string, any> = {
    order_status: newStatus,
    updated_at: new Date().toISOString(),
  };

  if (courierTrackingCode !== undefined) {
    updatePayload.courier_tracking_code = courierTrackingCode.trim();
  }

  if (!useLocalOrderStore()) {
    const { error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', existing.id);
    if (error) {
      console.error('[orders] updateOrderStatus failed:', error.message);
      throw new ServiceError('Could not update the order status.', 503, error.code);
    }
  }

  existing.orderStatus = newStatus;
  if (courierTrackingCode !== undefined) {
    existing.courierTrackingCode = courierTrackingCode.trim();
  }
  if (useLocalOrderStore()) {
    fallbackOrdersCache.set(existing.id, existing);
    fallbackOrdersCache.set(existing.orderNumber, existing);
  }

  return existing;
}

export async function updatePaymentStatus(
  orderIdOrNumber: string,
  newPaymentStatus: StoredOrder['paymentStatus']
): Promise<StoredOrder | null> {
  const existing = await getOrderById(orderIdOrNumber);
  if (!existing) return null;

  if (!useLocalOrderStore()) {
    const { error } = await supabaseAdmin
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) {
      console.error('[orders] updatePaymentStatus failed:', error.message);
      throw new ServiceError('Could not update the payment status.', 503, error.code);
    }
  }

  existing.paymentStatus = newPaymentStatus;
  if (useLocalOrderStore()) {
    fallbackOrdersCache.set(existing.id, existing);
    fallbackOrdersCache.set(existing.orderNumber, existing);
  }

  return existing;
}

export interface OrderMetrics {
  totalRevenue: number;
  totalOrders: number;
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  aov: number;
  paymentBreakdown: {
    cod: number;
    bkash: number;
    nagad: number;
  };
  zoneBreakdown: {
    dhaka: number;
    outside: number;
  };
}

export async function getOrderMetrics(): Promise<OrderMetrics> {
  const allOrders = await getAllOrders();

  let totalRevenue = 0;
  let pendingCount = 0;
  let processingCount = 0;
  let shippedCount = 0;
  let deliveredCount = 0;
  let cancelledCount = 0;

  const paymentBreakdown = { cod: 0, bkash: 0, nagad: 0 };
  const zoneBreakdown = { dhaka: 0, outside: 0 };

  allOrders.forEach((o) => {
    // Only count non-cancelled orders towards revenue
    if (o.orderStatus !== 'cancelled') {
      totalRevenue += o.totalAmount;
    }

    if (o.orderStatus === 'pending' || o.orderStatus === 'confirmed') pendingCount++;
    else if (o.orderStatus === 'processing') processingCount++;
    else if (o.orderStatus === 'shipped') shippedCount++;
    else if (o.orderStatus === 'delivered') deliveredCount++;
    else if (o.orderStatus === 'cancelled') cancelledCount++;

    if (o.paymentMethod === 'cod') paymentBreakdown.cod++;
    else if (o.paymentMethod === 'bkash') paymentBreakdown.bkash++;
    else if (o.paymentMethod === 'nagad') paymentBreakdown.nagad++;

    if (o.deliveryZone === 'dhaka') zoneBreakdown.dhaka++;
    else zoneBreakdown.outside++;
  });

  const validOrdersCount = allOrders.length - cancelledCount;
  const aov = validOrdersCount > 0 ? Math.round(totalRevenue / validOrdersCount) : 0;

  return {
    totalRevenue,
    totalOrders: allOrders.length,
    pendingCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    aov,
    paymentBreakdown,
    zoneBreakdown,
  };
}

export async function clearTestOrders(): Promise<{ success: boolean; deletedCount: number }> {
  if (useLocalOrderStore()) {
    const count = new Set(fallbackOrdersCache.values()).size;
    fallbackOrdersCache.clear();
    return { success: true, deletedCount: count };
  }

  // order_items cascade on order delete.
  const { data, error } = await supabaseAdmin
    .from('orders')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
    .select('id');
  if (error) {
    console.error('[orders] clearTestOrders failed:', error.message);
    throw new ServiceError('Could not clear orders.', 503, error.code);
  }
  return { success: true, deletedCount: data?.length || 0 };
}
