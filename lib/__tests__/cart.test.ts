import test from 'node:test';
import assert from 'node:assert';
import {
  addLineItem,
  applyCoupon,
  calculateCartTotals,
  calculateFreeShippingProgress,
  calculateItemCount,
  calculateShippingFee,
  calculateSubtotal,
  FREE_SHIPPING_THRESHOLD,
  removeLineItem,
  STANDARD_SHIPPING_FEE,
  updateLineItemQuantity,
} from '../cart.ts';
import type { CartItem } from '../../data/types.ts';

const mockItems: CartItem[] = [
  {
    id: 'prod-1-shade-01',
    productId: 'prod-1',
    productSlug: 'velvet-matte-lipstick',
    title: 'Velvet Matte Lipstick',
    categoryName: 'Lips',
    price: 450,
    compareAtPrice: 600,
    quantity: 2,
    image: '/images/lipstick.jpg',
  },
  {
    id: 'prod-2-shade-02',
    productId: 'prod-2',
    productSlug: 'feather-foundation',
    title: 'Feather Foundation',
    categoryName: 'Face',
    price: 800,
    compareAtPrice: 1000,
    quantity: 1,
    image: '/images/foundation.jpg',
  },
];

test('calculateSubtotal sums up item prices multiplied by quantity', () => {
  // 450 * 2 + 800 * 1 = 900 + 800 = 1700
  assert.strictEqual(calculateSubtotal(mockItems), 1700);
});

test('calculateItemCount sums total unit count', () => {
  assert.strictEqual(calculateItemCount(mockItems), 3);
});

test('calculateFreeShippingProgress computes threshold progression', () => {
  // Subtotal 1700 >= 1499 threshold
  const unlockedProgress = calculateFreeShippingProgress(1700);
  assert.strictEqual(unlockedProgress.isUnlocked, true);
  assert.strictEqual(unlockedProgress.remaining, 0);
  assert.strictEqual(unlockedProgress.percent, 100);

  // Subtotal 1000 < 1499
  const partialProgress = calculateFreeShippingProgress(1000);
  assert.strictEqual(partialProgress.isUnlocked, false);
  assert.strictEqual(partialProgress.remaining, 499);
  assert.strictEqual(partialProgress.percent, 67);
});

test('calculateShippingFee handles free shipping and standard fee', () => {
  assert.strictEqual(calculateShippingFee(0), 0);
  assert.strictEqual(calculateShippingFee(1000), STANDARD_SHIPPING_FEE);
  assert.strictEqual(calculateShippingFee(FREE_SHIPPING_THRESHOLD), 0);
  assert.strictEqual(calculateShippingFee(2500), 0);
});

test('applyCoupon validates codes and computes discounts', () => {
  // BEEFIRST: 10%
  const res1 = applyCoupon(1000, 'BEEFIRST');
  assert.strictEqual(res1.isValid, true);
  assert.strictEqual(res1.discountAmount, 100);

  // BEE700: requires 2999
  const res2Fail = applyCoupon(2000, 'BEE700');
  assert.strictEqual(res2Fail.isValid, false);
  assert.strictEqual(res2Fail.discountAmount, 0);

  const res2Success = applyCoupon(3500, 'BEE700');
  assert.strictEqual(res2Success.isValid, true);
  assert.strictEqual(res2Success.discountAmount, 700);

  // Invalid code
  const resInvalid = applyCoupon(1000, 'RANDOMCODE');
  assert.strictEqual(resInvalid.isValid, false);
  assert.strictEqual(resInvalid.discountAmount, 0);
});

test('calculateCartTotals computes full breakdown', () => {
  // Items subtotal: 1700 (free shipping unlocked)
  const totals = calculateCartTotals(mockItems, 'BEEFIRST');
  assert.strictEqual(totals.subtotal, 1700);
  assert.strictEqual(totals.shippingFee, 0);
  assert.strictEqual(totals.discount, 170); // 10% of 1700
  assert.strictEqual(totals.total, 1530); // 1700 - 170
  assert.strictEqual(totals.appliedCoupon, 'BEEFIRST');
});

test('addLineItem adds new items and increments existing ones', () => {
  const itemToAdd: CartItem = {
    id: 'prod-3-shade-01',
    productId: 'prod-3',
    productSlug: 'kohl-kajal',
    title: 'Kohl Kajal',
    categoryName: 'Eyes',
    price: 250,
    quantity: 1,
    image: '/images/kohl.jpg',
  };

  const added = addLineItem(mockItems, itemToAdd);
  assert.strictEqual(added.length, 3);
  assert.strictEqual(added[2].id, 'prod-3-shade-01');

  // Incrementing existing item
  const incremented = addLineItem(added, { ...itemToAdd, quantity: 2 });
  assert.strictEqual(incremented.length, 3);
  assert.strictEqual(incremented[2].quantity, 3);
});

test('updateLineItemQuantity updates or removes item when quantity is 0', () => {
  const updated = updateLineItemQuantity(mockItems, 'prod-1-shade-01', 5);
  assert.strictEqual(updated[0].quantity, 5);

  const zeroed = updateLineItemQuantity(mockItems, 'prod-1-shade-01', 0);
  assert.strictEqual(zeroed.length, 1);
  assert.strictEqual(zeroed[0].id, 'prod-2-shade-02');
});

test('removeLineItem deletes item from cart', () => {
  const removed = removeLineItem(mockItems, 'prod-2-shade-02');
  assert.strictEqual(removed.length, 1);
  assert.strictEqual(removed[0].id, 'prod-1-shade-01');
});
