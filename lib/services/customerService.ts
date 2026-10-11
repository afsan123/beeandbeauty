import { getAllOrders, type StoredOrder } from './orderService.ts';
import { getAllInquiries, type StoredInquiry } from './inquiryService.ts';
import { supabaseAdmin } from '../supabase/admin.ts';

export interface CustomerProfile {
  id: string; // phone or email
  name: string;
  email: string;
  phone: string;
  district: string;
  streetAddress: string;
  deliveryZone: 'dhaka' | 'outside';
  totalSpent: number;
  totalOrders: number;
  lastOrderDate: string;
  tier: 'VIP Client' | 'Repeat Buyer' | 'New Customer';
  orders: StoredOrder[];
  inquiries: StoredInquiry[];
  notes?: string;
}

// In-memory notes store fallback
const customerNotesCache = new Map<string, string>();

export async function getAllCustomers(): Promise<CustomerProfile[]> {
  const [orders, inquiries] = await Promise.all([
    getAllOrders(),
    getAllInquiries(),
  ]);

  // Try fetching remote customer notes
  try {
    const { data } = await supabaseAdmin.from('customer_notes').select('*');
    if (data) {
      data.forEach((row) => {
        customerNotesCache.set(row.customer_phone, row.notes);
      });
    }
  } catch {
    // Fallback to cache
  }

  // Aggregate by phone number (canonical customer ID in Bangladesh)
  const customersMap = new Map<string, CustomerProfile>();

  orders.forEach((order) => {
    const key = order.customerPhone.trim() || order.customerEmail.trim();
    if (!key) return;

    const existing = customersMap.get(key);
    const orderDate = order.createdAt;

    if (!existing) {
      customersMap.set(key, {
        id: key,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        district: order.district,
        streetAddress: order.streetAddress,
        deliveryZone: order.deliveryZone,
        totalSpent: order.paymentStatus === 'paid' || order.orderStatus !== 'cancelled' ? order.totalAmount : 0,
        totalOrders: 1,
        lastOrderDate: orderDate,
        tier: 'New Customer',
        orders: [order],
        inquiries: [],
        notes: customerNotesCache.get(order.customerPhone) || '',
      });
    } else {
      existing.totalOrders += 1;
      if (order.paymentStatus === 'paid' || order.orderStatus !== 'cancelled') {
        existing.totalSpent += order.totalAmount;
      }
      if (new Date(orderDate) > new Date(existing.lastOrderDate)) {
        existing.lastOrderDate = orderDate;
        existing.name = order.customerName; // update to latest name
        existing.streetAddress = order.streetAddress;
        existing.district = order.district;
      }
      existing.orders.push(order);
    }
  });

  // Attach customer inquiries
  inquiries.forEach((inquiry) => {
    const phoneKey = inquiry.phone?.trim();
    const emailKey = inquiry.email?.trim();

    if (phoneKey && customersMap.has(phoneKey)) {
      customersMap.get(phoneKey)!.inquiries.push(inquiry);
    } else if (emailKey) {
      // Find matching customer by email
      for (const customer of customersMap.values()) {
        if (customer.email.toLowerCase() === emailKey.toLowerCase()) {
          customer.inquiries.push(inquiry);
          break;
        }
      }
    }
  });

  // Calculate customer tiers & sort by lifetime spend
  const customerList = Array.from(customersMap.values()).map((c) => {
    let tier: CustomerProfile['tier'] = 'New Customer';
    if (c.totalSpent >= 5000 || c.totalOrders >= 4) {
      tier = 'VIP Client';
    } else if (c.totalOrders >= 2) {
      tier = 'Repeat Buyer';
    }
    return {
      ...c,
      tier,
      // sort orders chronologically newest first
      orders: c.orders.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    };
  });

  return customerList.sort((a, b) => b.totalSpent - a.totalSpent);
}

export async function getCustomerById(id: string): Promise<CustomerProfile | null> {
  const all = await getAllCustomers();
  return (
    all.find((c) => c.id === id || c.phone === id || c.email.toLowerCase() === id.toLowerCase()) || null
  );
}

export async function updateCustomerNotes(phone: string, notes: string): Promise<void> {
  customerNotesCache.set(phone, notes);

  try {
    await supabaseAdmin.from('customer_notes').upsert({
      customer_phone: phone,
      notes,
      updated_at: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Remote customer notes update fallback to memory:', err);
  }
}
