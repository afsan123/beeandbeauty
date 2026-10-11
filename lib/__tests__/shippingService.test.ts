import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateShipping,
  isDhakaZone,
  FREE_SHIPPING_THRESHOLD,
  DHAKA_SHIPPING_FEE,
  OUTSIDE_DHAKA_SHIPPING_FEE,
} from '../services/shippingService.ts';

describe('Shipping & Logistics Service', () => {
  it('correctly detects Dhaka Metropolitan districts', () => {
    assert.strictEqual(isDhakaZone('Dhaka'), true);
    assert.strictEqual(isDhakaZone('Dhaka City'), true);
    assert.strictEqual(isDhakaZone('Gulshan, Dhaka'), true);
    assert.strictEqual(isDhakaZone('Uttara'), true);
    assert.strictEqual(isDhakaZone('Dhanmondi'), true);
  });

  it('correctly detects Outside Dhaka districts', () => {
    assert.strictEqual(isDhakaZone('Chittagong'), false);
    assert.strictEqual(isDhakaZone('Sylhet'), false);
    assert.strictEqual(isDhakaZone('Rajshahi'), false);
    assert.strictEqual(isDhakaZone('Coxs Bazar'), false);
    assert.strictEqual(isDhakaZone('Khulna'), false);
  });

  it('charges ৳70 inside Dhaka for orders under ৳2,500 with 24h SLA', () => {
    const res = calculateShipping('Dhaka', 1500);
    assert.strictEqual(res.zone, 'dhaka');
    assert.strictEqual(res.shippingFee, DHAKA_SHIPPING_FEE);
    assert.strictEqual(res.freeShippingEligible, false);
    assert.strictEqual(res.amountNeededForFreeShipping, 1000);
    assert.ok(res.targetTimeline.includes('24 Hours'));
  });

  it('charges ৳130 outside Dhaka for orders under ৳2,500 with 48h SLA', () => {
    const res = calculateShipping('Chittagong', 1800);
    assert.strictEqual(res.zone, 'outside');
    assert.strictEqual(res.shippingFee, OUTSIDE_DHAKA_SHIPPING_FEE);
    assert.strictEqual(res.freeShippingEligible, false);
    assert.strictEqual(res.amountNeededForFreeShipping, 700);
    assert.ok(res.targetTimeline.includes('48 Hours'));
  });

  it('unlocks free shipping (৳0) for orders at or above ৳2,500 nationwide', () => {
    const dhakaFree = calculateShipping('Dhaka', FREE_SHIPPING_THRESHOLD);
    assert.strictEqual(dhakaFree.shippingFee, 0);
    assert.strictEqual(dhakaFree.freeShippingEligible, true);
    assert.strictEqual(dhakaFree.amountNeededForFreeShipping, 0);

    const outsideFree = calculateShipping('Sylhet', 3200);
    assert.strictEqual(outsideFree.shippingFee, 0);
    assert.strictEqual(outsideFree.freeShippingEligible, true);
  });
});
