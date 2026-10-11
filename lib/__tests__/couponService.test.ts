import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateCoupon } from '../services/couponService.ts';

describe('Coupon & Promo Engine Service', () => {
  it('applies BEE10 percentage discount when subtotal meets min spend', async () => {
    const res = await validateCoupon('BEE10', 1500);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.discountType, 'percentage');
    assert.strictEqual(res.discountAmount, 150); // 10% of 1500
  });

  it('rejects BEE10 when subtotal is below minimum spend ৳1,000', async () => {
    const res = await validateCoupon('BEE10', 800);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.discountAmount, 0);
    assert.ok(res.message.includes('minimum order of ৳1,000'));
  });

  it('applies BEE700 fixed discount when subtotal is at or above ৳2,999', async () => {
    const res = await validateCoupon('BEE700', 3000);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.discountType, 'fixed');
    assert.strictEqual(res.discountAmount, 700);
  });

  it('rejects BEE700 when subtotal is below ৳2,999', async () => {
    const res = await validateCoupon('BEE700', 2500);
    assert.strictEqual(res.valid, false);
    assert.strictEqual(res.discountAmount, 0);
    assert.ok(res.message.includes('minimum order of ৳2,999'));
  });

  it('applies BEEFREE free shipping coupon', async () => {
    const res = await validateCoupon('BEEFREE', 500);
    assert.strictEqual(res.valid, true);
    assert.strictEqual(res.discountType, 'free_shipping');
  });

  it('rejects non-existent coupon codes', async () => {
    const res = await validateCoupon('INVALID_CODE', 5000);
    assert.strictEqual(res.valid, false);
    assert.ok(res.message.includes('invalid or expired'));
  });
});
