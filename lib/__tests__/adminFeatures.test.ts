import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../services/categoryService.ts';

import {
  getAllCatalogProducts,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
} from '../services/productService.ts';

import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../services/bannerService.ts';

import {
  getAllOffers,
  getActiveOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from '../services/limitedOfferService.ts';

import {
  getAllTutorials,
  createTutorial,
  deleteTutorial,
  getAllBookings,
  createBooking,
  updateBookingStatus,
  deleteBooking,
} from '../services/studioService.ts';

import {
  getAllCustomers,
  getCustomerById,
  updateCustomerNotes,
} from '../services/customerService.ts';

describe('Admin Extended Features Test Suite', () => {
  describe('Category Management', () => {
    it('should list initial categories', async () => {
      const categories = await getAllCategories();
      assert.ok(categories.length >= 4);
    });

    it('should create, update and delete a category', async () => {
      const slug = `test-cat-${Date.now()}`;
      const newCat = await createCategory({
        slug,
        name: 'Festive Kajal & Kohl',
        shortTitle: 'Kajal & Kohl',
        description: 'High pigment eye makeup',
      });

      assert.equal(newCat.slug, slug);
      assert.equal(newCat.name, 'Festive Kajal & Kohl');

      // Update
      const updated = await updateCategory(slug, {
        name: 'Festive Kohl & Kajal Collection',
      });
      assert.ok(updated);
      assert.equal(updated?.name, 'Festive Kohl & Kajal Collection');

      // Delete
      const deleted = await deleteCategory(slug);
      assert.equal(deleted, true);

      const afterCategories = await getAllCategories();
      assert.ok(!afterCategories.some((c) => c.slug === slug));
    });
  });

  describe('Product Catalog Management', () => {
    it('should retrieve catalog products', async () => {
      const prods = await getAllCatalogProducts();
      assert.ok(prods.length > 0);
    });

    it('should create, update, and delete a custom product', async () => {
      const testId = `prod-test-${Date.now()}`;
      const created = await createCatalogProduct({
        id: testId,
        slug: `test-blush-${Date.now()}`,
        title: 'Rose Petal Velvet Cream Blush',
        categorySlug: 'face',
        categoryName: 'Face & Complexion',
        subtitle: 'Weightless skin-melt blush',
        price: 850,
        compareAtPrice: 1050,
        shortDescription: 'Infused with royal nectar',
        description: 'Blends seamlessly for a radiant natural flush.',
        howToUse: 'Dab onto apples of cheeks with fingertips.',
        ingredients: 'Propolis extract, beeswax, rosehip seed oil.',
        details: {
          netWeight: '15g',
          shelfLife: '24 Months',
          origin: 'Bangladesh',
          finish: 'Dewy Velvet',
          formulation: 'Cream to Powder',
        },
        inStock: true,
        isFeatured: true,
      });

      assert.equal(created.id, testId);
      assert.equal(created.price, 850);

      // Update
      const updated = await updateCatalogProduct(testId, {
        price: 950,
        inStock: false,
      });
      assert.ok(updated);
      assert.equal(updated?.price, 950);
      assert.equal(updated?.inStock, false);

      // Delete
      const deleted = await deleteCatalogProduct(testId);
      assert.equal(deleted, true);

      const prods = await getAllCatalogProducts();
      assert.ok(!prods.some((p) => p.id === testId));
    });
  });

  describe('Hero & Banners Management', () => {
    it('should list default hero banners', async () => {
      const banners = await getAllBanners();
      assert.ok(banners.length >= 4);
    });

    it('should create, update and delete a banner slide', async () => {
      const testId = `banner-test-${Date.now()}`;
      const banner = await createBanner({
        id: testId,
        title: 'EID SPECIAL GLOW CAMPAIGN',
        subtitle: 'Save up to 30% across entire bridal cosmetics.',
        tagline: 'LIMITED TIME EID DROP',
        ctaText: 'Shop Eid Glam',
        ctaHref: '/shop/all',
        bgColor: 'from-[#4A104C] to-[#360C38]',
        accentColor: '#D4AF37',
        bannerType: 'hero',
        sortOrder: 10,
        isActive: true,
      });

      assert.equal(banner.id, testId);
      assert.equal(banner.title, 'EID SPECIAL GLOW CAMPAIGN');

      // Update
      const updated = await updateBanner(testId, { isActive: false });
      assert.ok(updated);
      assert.equal(updated?.isActive, false);

      // Delete
      const deleted = await deleteBanner(testId);
      assert.equal(deleted, true);
    });
  });

  describe('Limited Offers Management', () => {
    it('should list offers and active deals', async () => {
      const offers = await getAllOffers();
      assert.ok(offers.length > 0);
      const active = await getActiveOffers();
      assert.ok(active.length > 0);
    });

    it('should create, toggle and delete an offer', async () => {
      const testId = `offer-test-${Date.now()}`;
      const offer = await createOffer({
        id: testId,
        code: `TESTGLOW${Date.now()}`.slice(0, 10),
        title: 'Flat ৳300 Off All Skincare Sets',
        description: 'Valid for orders above ৳2500',
        discountType: 'fixed',
        discountValue: 300,
        minSpend: 2500,
        expiryNote: 'Midnight Thursday',
        badge: 'Exclusive',
        isActive: true,
      });

      assert.equal(offer.id, testId);
      assert.equal(offer.discountValue, 300);

      // Update
      const updated = await updateOffer(testId, { isActive: false });
      assert.ok(updated);
      assert.equal(updated?.isActive, false);

      // Delete
      const deleted = await deleteOffer(testId);
      assert.equal(deleted, true);
    });
  });

  describe('Pro Beauty Studio & Bookings', () => {
    it('should create and delete tutorial', async () => {
      const tut = await createTutorial({
        title: 'Glass Skin Radiance Prep',
        category: 'Skincare Rituals',
        duration: '4 min masterclass',
        description: 'How to achieve high-dew barrier prep before bridal makeup.',
        steps: ['Cleanse with honey nectar', 'Apply propolis toner', 'Seal with barrier cream'],
        isActive: true,
      });

      assert.ok(tut.id);
      assert.equal(tut.title, 'Glass Skin Radiance Prep');

      const deleted = await deleteTutorial(tut.id);
      assert.equal(deleted, true);
    });

    it('should manage client consultation bookings', async () => {
      const booking = await createBooking({
        clientName: 'Nabila Rahman',
        clientPhone: '01700998877',
        clientEmail: 'nabila@example.com',
        serviceType: 'Bridal & Festive Makeover',
        preferredDate: '2026-11-15',
        preferredTime: 'Afternoon (2 PM - 5 PM)',
        notes: 'Bride looking for warm gold tones.',
      });

      assert.ok(booking.id);
      assert.equal(booking.status, 'pending');

      // Update status
      const confirmed = await updateBookingStatus(booking.id, 'confirmed');
      assert.ok(confirmed);
      assert.equal(confirmed?.status, 'confirmed');

      // Delete
      const deleted = await deleteBooking(booking.id);
      assert.equal(deleted, true);
    });
  });

  describe('Customer CRM & Profiling', () => {
    it('should retrieve customer list and summary metrics', async () => {
      const customers = await getAllCustomers();
      assert.ok(Array.isArray(customers));

      if (customers.length > 0) {
        const first = customers[0];
        const detail = await getCustomerById(first.id);
        assert.ok(detail);
        assert.equal(detail?.id, first.id);

        // Update VIP notes
        await updateCustomerNotes(first.id, 'Preferred courier is Steadfast');
      }
    });
  });
});
