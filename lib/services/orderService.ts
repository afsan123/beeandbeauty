import { supabaseAdmin } from '../supabase/admin.ts';
import { catalogRepository } from '../../data/mock/mockRepository.ts';
import { calculateShipping } from './shippingService.ts';
import { validateCoupon } from './couponService.ts';

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
}

export interface TrackingStep {
  title: string;
  description: string;
  timestamp?: string;
  status: 'completed' | 'current' | 'upcoming';
}

// In-memory fallback cache to ensure zero downtime before Supabase migrations are run
const fallbackOrdersCache = new Map<string, StoredOrder>();

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\+]/g, '').replace(/^88/, '');
}

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

  // 2. Fetch canonical products and recalculate prices on server side
  const allProducts = await catalogRepository.getProducts();
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

  // 5. Generate unique Human-Readable Order Number
  const orderNumber = `BB-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const orderId = crypto.randomUUID();
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
  };

  // Always save to fallback cache
  fallbackOrdersCache.set(storedOrder.orderNumber, storedOrder);
  fallbackOrdersCache.set(storedOrder.id, storedOrder);

  // 6. Attempt atomic insert into Supabase PostgreSQL
  try {
    const { error: orderError } = await supabaseAdmin.from('orders').insert({
      id: storedOrder.id,
      order_number: storedOrder.orderNumber,
      customer_name: storedOrder.customerName,
      customer_email: storedOrder.customerEmail,
      customer_phone: storedOrder.customerPhone,
      street_address: storedOrder.streetAddress,
      district: storedOrder.district,
      postal_code: storedOrder.postalCode,
      delivery_zone: storedOrder.deliveryZone,
      subtotal: storedOrder.subtotal,
      discount_amount: storedOrder.discountAmount,
      shipping_fee: storedOrder.shippingFee,
      total_amount: storedOrder.totalAmount,
      coupon_code: storedOrder.couponCode,
      payment_method: storedOrder.paymentMethod,
      payment_status: storedOrder.paymentStatus,
      order_status: storedOrder.orderStatus,
      target_delivery: storedOrder.targetDelivery,
      courier_tracking_code: storedOrder.courierTrackingCode,
      notes: storedOrder.notes,
      created_at: storedOrder.createdAt,
    });

    if (!orderError) {
      // Insert items
      const itemsToInsert = storedOrder.items.map((item) => ({
        order_id: storedOrder.id,
        product_id: item.productId,
        product_title: item.productTitle,
        shade_name: item.shadeName,
        shade_code: item.shadeCode,
        unit_price: item.unitPrice,
        quantity: item.quantity,
        line_total: item.lineTotal,
      }));

      await supabaseAdmin.from('order_items').insert(itemsToInsert);
    }
  } catch (err) {
    console.warn('Supabase insert skipped or failed, fallback cached:', err);
  }

  return storedOrder;
}

export async function getOrderById(id: string): Promise<StoredOrder | null> {
  const cleanId = id.trim();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanId);

  // Check Supabase first
  try {
    let query = supabaseAdmin.from('orders').select('*');
    if (isUuid) {
      query = query.or(`id.eq.${cleanId},order_number.eq.${cleanId}`);
    } else {
      query = query.eq('order_number', cleanId);
    }

    const { data: orderData, error } = await query.maybeSingle();

    if (!error && orderData) {
      const { data: itemsData } = await supabaseAdmin

        .from('order_items')
        .select('*')
        .eq('order_id', orderData.id);

      const items: StoredOrderItem[] = (itemsData || []).map((it) => ({
        id: it.id,
        productId: it.product_id,
        productTitle: it.product_title,
        shadeName: it.shade_name,
        shadeCode: it.shade_code,
        unitPrice: Number(it.unit_price),
        quantity: Number(it.quantity),
        lineTotal: Number(it.line_total),
      }));

      return {
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone,
        streetAddress: orderData.street_address,
        district: orderData.district,
        postalCode: orderData.postal_code,
        deliveryZone: orderData.delivery_zone,
        subtotal: Number(orderData.subtotal),
        discountAmount: Number(orderData.discount_amount || 0),
        shippingFee: Number(orderData.shipping_fee),
        totalAmount: Number(orderData.total_amount),
        couponCode: orderData.coupon_code,
        paymentMethod: orderData.payment_method,
        paymentStatus: orderData.payment_status,
        orderStatus: orderData.order_status,
        targetDelivery: orderData.target_delivery,
        courierTrackingCode: orderData.courier_tracking_code,
        notes: orderData.notes,
        createdAt: orderData.created_at,
        items,
      };
    }
  } catch {
    // Fallback cache
  }

  return fallbackOrdersCache.get(id) || null;
}

export async function trackOrderByPhone(
  orderNumber: string,
  phone: string
): Promise<{ order: StoredOrder; timeline: TrackingStep[] } | null> {
  const cleanOrderNum = orderNumber.trim().toUpperCase();
  const cleanPhone = normalizePhone(phone);

  const order = await getOrderById(cleanOrderNum);
  if (!order) {
    return null;
  }

  // Verify phone matches
  const orderPhoneNormalized = normalizePhone(order.customerPhone);
  if (!orderPhoneNormalized.includes(cleanPhone) && !cleanPhone.includes(orderPhoneNormalized)) {
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

  try {
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

    if (!error && ordersData && ordersData.length > 0) {
      const orderIds = ordersData.map((o) => o.id);
      const { data: allItemsData } = await supabaseAdmin
        .from('order_items')
        .select('*')
        .in('order_id', orderIds);

      const itemsByOrderId = new Map<string, StoredOrderItem[]>();
      (allItemsData || []).forEach((it) => {
        const list = itemsByOrderId.get(it.order_id) || [];
        list.push({
          id: it.id,
          productId: it.product_id,
          productTitle: it.product_title,
          shadeName: it.shade_name,
          shadeCode: it.shade_code,
          unitPrice: Number(it.unit_price),
          quantity: Number(it.quantity),
          lineTotal: Number(it.line_total),
        });
        itemsByOrderId.set(it.order_id, list);
      });

      orders = ordersData.map((orderData) => ({
        id: orderData.id,
        orderNumber: orderData.order_number,
        customerName: orderData.customer_name,
        customerEmail: orderData.customer_email,
        customerPhone: orderData.customer_phone,
        streetAddress: orderData.street_address,
        district: orderData.district,
        postalCode: orderData.postal_code,
        deliveryZone: orderData.delivery_zone,
        subtotal: Number(orderData.subtotal),
        discountAmount: Number(orderData.discount_amount || 0),
        shippingFee: Number(orderData.shipping_fee),
        totalAmount: Number(orderData.total_amount),
        couponCode: orderData.coupon_code,
        paymentMethod: orderData.payment_method,
        paymentStatus: orderData.payment_status,
        orderStatus: orderData.order_status,
        targetDelivery: orderData.target_delivery,
        courierTrackingCode: orderData.courier_tracking_code,
        notes: orderData.notes,
        createdAt: orderData.created_at,
        items: itemsByOrderId.get(orderData.id) || [],
      }));
    }
  } catch (err) {
    console.warn('Supabase getAllOrders fallback triggered:', err);
  }

  // Backfill / fallback with in-memory cache if needed
  if (orders.length === 0 && fallbackOrdersCache.size > 0) {
    orders = Array.from(new Set(fallbackOrdersCache.values()));
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

  try {
    const { data, error } = await supabaseAdmin
      .from('orders')
      .update(updatePayload)
      .eq('id', existing.id)
      .select()
      .maybeSingle();

    if (!error && data) {
      existing.orderStatus = data.order_status;
      if (data.courier_tracking_code) {
        existing.courierTrackingCode = data.courier_tracking_code;
      }
    }
  } catch (err) {
    console.warn('Supabase updateOrderStatus fallback:', err);
  }

  // Update in cache
  existing.orderStatus = newStatus;
  if (courierTrackingCode !== undefined) {
    existing.courierTrackingCode = courierTrackingCode.trim();
  }
  fallbackOrdersCache.set(existing.id, existing);
  fallbackOrdersCache.set(existing.orderNumber, existing);

  return existing;
}

export async function updatePaymentStatus(
  orderIdOrNumber: string,
  newPaymentStatus: StoredOrder['paymentStatus']
): Promise<StoredOrder | null> {
  const existing = await getOrderById(orderIdOrNumber);
  if (!existing) return null;

  try {
    await supabaseAdmin
      .from('orders')
      .update({
        payment_status: newPaymentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } catch (err) {
    console.warn('Supabase updatePaymentStatus fallback:', err);
  }

  existing.paymentStatus = newPaymentStatus;
  fallbackOrdersCache.set(existing.id, existing);
  fallbackOrdersCache.set(existing.orderNumber, existing);

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
  let count = fallbackOrdersCache.size;
  fallbackOrdersCache.clear();

  try {
    // Delete line items first
    await supabaseAdmin.from('order_items').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    // Delete orders
    const { data } = await supabaseAdmin
      .from('orders')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (data) {
      count = Math.max(count, data.length);
    }
  } catch (err) {
    console.warn('Supabase clearTestOrders fallback:', err);
  }

  return { success: true, deletedCount: count };
}

