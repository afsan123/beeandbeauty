import test from 'node:test';
import assert from 'node:assert';
import {
  calculateDiscountPercentage,
  calculateSavings,
  formatPrice,
  hasDiscount,
} from '../price.ts';

test('formatPrice correctly formats BDT currency', () => {
  assert.strictEqual(formatPrice(450), '৳450');
  assert.strictEqual(formatPrice(1299), '৳1,299');
  assert.strictEqual(formatPrice(0), '৳0');
  assert.strictEqual(formatPrice(450.4), '৳450');
  assert.strictEqual(formatPrice(NaN), '৳0');
});

test('calculateDiscountPercentage calculates correct rounded percentages', () => {
  // 549 down to 412 => (549-412)/549 = 137/549 = 24.95% => 25%
  assert.strictEqual(calculateDiscountPercentage(412, 549), 25);
  // 1000 down to 800 => 20%
  assert.strictEqual(calculateDiscountPercentage(800, 1000), 20);
  // No discount if compareAtPrice is equal or lower
  assert.strictEqual(calculateDiscountPercentage(500, 500), 0);
  assert.strictEqual(calculateDiscountPercentage(500, 400), 0);
  assert.strictEqual(calculateDiscountPercentage(500, undefined), 0);
});

test('calculateSavings returns difference in BDT', () => {
  assert.strictEqual(calculateSavings(412, 549), 137);
  assert.strictEqual(calculateSavings(500, 500), 0);
  assert.strictEqual(calculateSavings(500, undefined), 0);
});

test('hasDiscount determines if discount exists', () => {
  assert.strictEqual(hasDiscount(450, 600), true);
  assert.strictEqual(hasDiscount(600, 600), false);
  assert.strictEqual(hasDiscount(600, 500), false);
  assert.strictEqual(hasDiscount(600, undefined), false);
});
