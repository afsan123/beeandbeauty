import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  addLineItem,
  calculateCartTotals,
  calculateSubtotal,
} from '../cart.ts';
import type { CartItem } from '../../data/types.ts';
import { createOrder } from '../services/orderService.ts';

describe('Checkout Flow Reload & State Reset Engine', () => {
  it('clears cart and verifies empty state after order confirmation', async () => {
    let items: CartItem[] = [
      {
        id: 'item-1',
        productId: 'prod-raw-honey-lip-butter',
        productSlug: 'sundarban-raw-honey-lip-butter-balm',
        title: 'Sundarban Raw Honey Lip Butter Balm',
        categoryName: 'Under ৳499',
        price: 390,
        quantity: 1,
        image: '/images/test.jpg',
      },
    ];

    assert.equal(items.length, 1);
    assert.equal(calculateSubtotal(items), 390);

    // Simulate order placement
    const order = await createOrder({
      customerName: 'Customer One',
      customerEmail: 'customer1@example.com',
      customerPhone: '01711111111',
      streetAddress: 'House 1, Road 2, Dhanmondi',
      district: 'Dhaka',
      deliveryZone: 'dhaka',
      paymentMethod: 'cod',
      items: [{ productId: 'prod-raw-honey-lip-butter', quantity: 1 }],
    });

    assert.ok(order.orderNumber);
    assert.equal(order.customerName, 'Customer One');

    // Simulate clearCart() right after confirmation
    items = [];
    const totals = calculateCartTotals(items, null);
    assert.equal(items.length, 0);
    assert.equal(totals.total, 0);
  });

  it('resets checkout flow and allows immediate new order with different customer info', async () => {
    // Simulated state machine of CheckoutPage
    let currentStep = 4;
    let orderNumber: string | null = 'BB-2026-PREVIOUS';
    let shippingData: any = {
      fullName: 'Customer One',
      email: 'customer1@example.com',
      phone: '01711111111',
      streetAddress: 'House 1, Road 2, Dhanmondi',
      district: 'Dhaka',
    };
    let formKey = 0;

    const resetCheckoutFlow = () => {
      currentStep = 1;
      orderNumber = null;
      shippingData = null;
      formKey += 1;
    };

    // User adds new product to bag for a subsequent order
    let items: CartItem[] = [];
    items = addLineItem(items, {
      id: 'item-2',
      productId: 'prod-nectar-plump-gloss',
      productSlug: 'nectar-plump-peptide-lip-gloss',
      title: 'Nectar Plump Peptide Lip Gloss',
      categoryName: 'Lips',
      price: 750,
      quantity: 1,
      image: '/images/gloss.jpg',
    });

    // Auto-reset hook triggers when items.length > 0 while previous order is lingering
    if (items.length > 0 && (currentStep === 4 || orderNumber !== null)) {
      resetCheckoutFlow();
    }

    assert.equal(currentStep, 1, 'Checkout flow automatically reset to Step 1 for new items');
    assert.equal(orderNumber, null, 'Previous order reference cleared');
    assert.equal(shippingData, null, 'Previous recipient details cleared');
    assert.equal(formKey, 1, 'Form key incremented to force clean form remount');

    // Submit new recipient details for order two
    const newCustomerData = {
      customerName: 'Customer Two (Different Recipient)',
      customerEmail: 'customer2@example.com',
      customerPhone: '01899999999',
      streetAddress: 'Road 12, GEC Circle, Nasirabad',
      district: 'Chittagong',
      deliveryZone: 'outside' as const,
      paymentMethod: 'bkash' as const,
      items: [{ productId: 'prod-nectar-plump-gloss', quantity: 1 }],
    };

    const secondOrder = await createOrder(newCustomerData);

    assert.ok(secondOrder.orderNumber);
    assert.notEqual(secondOrder.orderNumber, 'BB-2026-PREVIOUS');
    assert.equal(secondOrder.customerName, 'Customer Two (Different Recipient)');
    assert.equal(secondOrder.district, 'Chittagong');
    assert.equal(secondOrder.shippingFee, 130, 'Correct outside Dhaka shipping fee applied');
  });

  it('allows manual trigger of resetCheckoutFlow from confirmation actions', () => {
    let currentStep = 4;
    let orderNumber: string | null = 'BB-2026-9999';
    let shippingData: any = { fullName: 'Recipient' };
    let formKey = 0;

    const resetCheckoutFlow = () => {
      currentStep = 1;
      orderNumber = null;
      shippingData = null;
      formKey += 1;
    };

    // Customer clicks "Place Another Order" or "Return to Store"
    resetCheckoutFlow();

    assert.equal(currentStep, 1);
    assert.equal(orderNumber, null);
    assert.equal(shippingData, null);
    assert.equal(formKey, 1);
  });
});
