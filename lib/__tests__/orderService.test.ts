import { describe, it } from 'node:test';
import assert from 'node:assert';
import { createOrder, getOrderById, trackOrderByPhone } from '../services/orderService.ts';

describe('Order Service & Server-Side Security', () => {
  it('creates an order, recalculates prices from catalog, and enforces canonical totals', async () => {
    const order = await createOrder({
      customerName: 'Samira Hossain',
      customerEmail: 'samira@example.com',
      customerPhone: '01712345678',
      streetAddress: 'House 14, Road 7, Banani',
      district: 'Dhaka',
      deliveryZone: 'dhaka',
      paymentMethod: 'cod',
      items: [
        {
          productId: 'prod-royal-honey-lipstick', // Royal Honey Velvet Matte Lipstick (৳490 sale price)
          quantity: 2,
        },
      ],
    });

    assert.ok(order.id);
    assert.ok(order.orderNumber.startsWith('BB-2026-'));
    assert.strictEqual(order.customerName, 'Samira Hossain');
    assert.strictEqual(order.customerEmail, 'samira@example.com');
    assert.strictEqual(order.subtotal, 980); // 490 * 2
    assert.strictEqual(order.shippingFee, 70); // Under ৳2,500 inside Dhaka
    assert.strictEqual(order.totalAmount, 1050); // 980 + 70
    assert.strictEqual(order.orderStatus, 'confirmed');
    assert.strictEqual(order.items.length, 1);
    assert.strictEqual(order.items[0].unitPrice, 490);
    assert.strictEqual(order.items[0].lineTotal, 980);
  });

  it('rejects order with missing required fields', async () => {
    await assert.rejects(
      async () => {
        await createOrder({
          customerName: '',
          customerEmail: 'invalid',
          customerPhone: '',
          streetAddress: '',
          district: '',
          paymentMethod: 'cod',
          items: [],
        });
      },
      {
        message: 'Full Name is required.',
      }
    );
  });

  it('allows customer to track their placed order by order number and phone', async () => {
    const newOrder = await createOrder({
      customerName: 'Afrin Sultana',
      customerEmail: 'afrin@example.com',
      customerPhone: '01898765432',
      streetAddress: 'Nasirabad Housing Society',
      district: 'Chittagong',
      deliveryZone: 'outside',
      paymentMethod: 'bkash',
      items: [
        {
          productId: 'prod-honey-silk-foundation', // Honey Silk HD Flawless Serum Foundation (৳890)
          quantity: 3, // 890 * 3 = 2670 -> Free shipping!
        },
      ],
    });

    assert.strictEqual(newOrder.shippingFee, 0); // ৳2,670 >= ৳2,500
    assert.strictEqual(newOrder.totalAmount, 2670);

    // Track order using phone
    const tracked = await trackOrderByPhone(newOrder.orderNumber, '01898765432');
    assert.ok(tracked);
    assert.strictEqual(tracked.order.orderNumber, newOrder.orderNumber);
    assert.ok(tracked.timeline.length >= 4);
    assert.strictEqual(tracked.timeline[0].status, 'completed');

    // Reject tracking with wrong phone
    const wrongPhone = await trackOrderByPhone(newOrder.orderNumber, '01700000000');
    assert.strictEqual(wrongPhone, null);
  });
});
