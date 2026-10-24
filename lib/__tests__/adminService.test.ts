import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateAdminCredentials,
  createAdminToken,
  verifyAdminToken,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from '../services/adminAuth.ts';
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
  getOrderMetrics,
  clearTestOrders,
} from '../services/orderService.ts';
import {
  getAllCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon,
} from '../services/couponService.ts';
import {
  getAllInventoryProducts,
  updateProductInventory,
} from '../services/inventoryService.ts';

describe('Executive Admin Authentication & Security', () => {
  it('validates canonical admin credentials successfully', () => {
    assert.equal(validateAdminCredentials(ADMIN_EMAIL, ADMIN_PASSWORD), true);
    assert.equal(validateAdminCredentials('random@gmail.com', 'wrong'), false);
    assert.equal(validateAdminCredentials(ADMIN_EMAIL, 'wrong'), false);
  });

  it('creates and verifies tamper-proof session tokens', () => {
    const adminUser = {
      email: ADMIN_EMAIL,
      name: 'Executive Director',
      role: 'superadmin' as const,
    };
    const token = createAdminToken(adminUser);
    assert.ok(token);
    assert.ok(token.includes('.'));

    const verified = verifyAdminToken(token);
    assert.ok(verified);
    assert.equal(verified?.email, ADMIN_EMAIL);
    assert.equal(verified?.role, 'superadmin');

    // Tampered token test
    const tampered = token + 'evil';
    assert.equal(verifyAdminToken(tampered), null);
  });
});

describe('Executive Order Management & Metrics Service', () => {
  it('fetches all orders and computes aggregate financial & operational metrics', async () => {
    // Place a test order
    const testOrder = await createOrder({
      customerName: 'Samira Huq',
      customerEmail: 'samira.huq@example.com',
      customerPhone: '01712000000',
      streetAddress: 'House 14, Road 5, Dhanmondi',
      district: 'Dhaka',
      deliveryZone: 'dhaka',
      paymentMethod: 'cod',
      items: [
        {
          productId: 'prod-royal-honey-lipstick',
          quantity: 2,
        },
      ],
    });

    assert.ok(testOrder);
    assert.ok(testOrder.orderNumber);

    // Retrieve via getAllOrders
    const orders = await getAllOrders();
    assert.ok(orders.length > 0);
    const found = orders.find((o) => o.orderNumber === testOrder.orderNumber);
    assert.ok(found);

    // Update status to shipped with courier tracking code
    const updated = await updateOrderStatus(
      testOrder.orderNumber,
      'shipped',
      'ST-2026-DHAKA-101'
    );
    assert.ok(updated);
    assert.equal(updated.orderStatus, 'shipped');
    assert.equal(updated.courierTrackingCode, 'ST-2026-DHAKA-101');

    // Update payment status to paid
    const paid = await updatePaymentStatus(testOrder.orderNumber, 'paid');
    assert.ok(paid);
    assert.equal(paid.paymentStatus, 'paid');

    // Calculate metrics
    const metrics = await getOrderMetrics();
    assert.ok(metrics.totalOrders >= 1);
    assert.ok(metrics.totalRevenue > 0);
    assert.ok(metrics.shippedCount >= 1);
    assert.ok(typeof metrics.aov === 'number');
    assert.ok(metrics.zoneBreakdown.dhaka >= 1);

    // Clean up test order to keep database clean
    await clearTestOrders();
  });
});

describe('Promotions & Coupon Management Engine', () => {
  it('lists, creates, toggles, and deletes promotional coupons', async () => {
    const coupons = await getAllCoupons();
    assert.ok(coupons.length >= 4);

    const testCode = `TESTVIP${Math.floor(100 + Math.random() * 900)}`;
    const created = await createCoupon({
      code: testCode,
      discountType: 'percentage',
      discountValue: 15,
      minSpend: 1500,
      maxDiscount: 500,
      isActive: true,
    });

    assert.equal(created.code, testCode);
    assert.equal(created.discountValue, 15);

    // Toggle active status
    const toggled = await toggleCouponStatus(testCode, false);
    assert.ok(toggled);

    // Delete coupon
    const deleted = await deleteCoupon(testCode);
    assert.ok(deleted);
  });
});

describe('Catalog Inventory & Shade Control', () => {
  it('manages real-time product stock and shade availability overrides', async () => {
    const products = await getAllInventoryProducts();
    assert.ok(products.length > 0);

    const firstProduct = products[0];
    assert.ok(firstProduct);

    // Toggle stock status
    const updated = await updateProductInventory({
      productId: firstProduct.id,
      inStock: false,
    });

    assert.ok(updated);
    assert.equal(updated?.inStock, false);

    // Restore stock status
    const restored = await updateProductInventory({
      productId: firstProduct.id,
      inStock: true,
    });

    assert.ok(restored);
    assert.equal(restored?.inStock, true);
  });
});
