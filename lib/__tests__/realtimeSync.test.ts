import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getAllCatalogProducts,
  createCatalogProduct,
  updateCatalogProduct,
  deleteCatalogProduct,
  clearProductCache,
} from '../services/productService.ts';
import {
  getAllInventoryProducts,
  updateProductInventory,
  clearInventoryCache,
} from '../services/inventoryService.ts';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  clearCategoryCache,
} from '../services/categoryService.ts';
import {
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  clearBannerCache,
} from '../services/bannerService.ts';
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
  clearOfferCache,
} from '../services/limitedOfferService.ts';
import {
  revalidateStoreCatalog,
  revalidateStoreBanners,
  revalidateStoreCategories,
  revalidateStoreOffers,
  broadcastStorefrontEvent,
} from '../services/revalidateStore.ts';
import { GET as getPublicProducts } from '../../app/api/products/route.ts';
import { GET as getPublicCategories } from '../../app/api/categories/route.ts';
import { NextRequest } from 'next/server.js';

describe('Real-Time Storefront & Cache Synchronization Engine', () => {
  it('clears and refreshes in-memory service caches cleanly', () => {
    clearProductCache();
    clearInventoryCache();
    clearCategoryCache();
    clearBannerCache();
    clearOfferCache();
    assert.ok(true, 'Caches cleared without error');
  });

  it('immediately reflects inventory price and stock overrides in catalog queries', async () => {
    const products = await getAllCatalogProducts(true);
    assert.ok(products.length > 0, 'Catalog products retrieved');
    // Select a product that is not used by concurrent orderService tests
    const target = products.find((p) => p.id !== 'prod-royal-honey-lipstick') || products[0];
    const originalPrice = target.price;
    const originalInStock = target.inStock;

    // Modify inventory override
    const testPrice = 1850;
    await updateProductInventory({
      productId: target.id,
      price: testPrice,
      inStock: false,
    });

    const refreshedProducts = await getAllCatalogProducts(true);
    const updated = refreshedProducts.find((p) => p.id === target.id);

    assert.ok(updated, 'Updated product found');
    assert.equal(updated?.price, testPrice, 'Updated price reflects in catalog immediately');
    assert.equal(updated?.inStock, false, 'Out-of-stock status reflects in catalog immediately');

    // Restore stock
    await updateProductInventory({
      productId: target.id,
      inStock: originalInStock,
      price: originalPrice,
    });
  });

  it('immediately reflects shade-level stock overrides in catalog queries', async () => {
    const products = await getAllCatalogProducts(true);
    const productWithShades = products.find(
      (p) => p.id !== 'prod-royal-honey-lipstick' && p.shades && p.shades.length > 0
    ) || products.find((p) => p.shades && p.shades.length > 0);
    assert.ok(productWithShades, 'Found product with shade variants');

    const firstShade = productWithShades.shades[0];
    await updateProductInventory({
      productId: productWithShades.id,
      shadesStock: {
        [firstShade.id]: false,
      },
    });

    const refreshed = await getAllCatalogProducts(true);
    const updated = refreshed.find((p) => p.id === productWithShades.id);
    const targetShade = updated?.shades.find((s) => s.id === firstShade.id);

    assert.equal(targetShade?.inStock, false, 'Specific shade marked out-of-stock in real time');

    // Restore shade stock
    await updateProductInventory({
      productId: productWithShades.id,
      shadesStock: {
        [firstShade.id]: true,
      },
    });
  });

  it('triggers store revalidation and broadcasts events safely', async () => {
    revalidateStoreCatalog({ productId: 'prod-test', action: 'updated' });
    revalidateStoreBanners('banner-test', 'updated');
    revalidateStoreCategories('lips', 'updated');
    revalidateStoreOffers('offer-test', 'updated');

    await broadcastStorefrontEvent({
      entity: 'product',
      action: 'updated',
      id: 'prod-test',
      timestamp: new Date().toISOString(),
    });

    assert.ok(true, 'Revalidation and broadcast executed without exceptions');
  });

  it('serves dynamic live catalog data via public /api/products route', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?limit=5');
    const res = await getPublicProducts(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('Cache-Control'), 'no-cache, no-store, must-revalidate');

    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.products));
    assert.equal(data.products.length, 5);
  });

  it('filters live products by category via /api/products?category=lips', async () => {
    const req = new NextRequest('http://localhost:3000/api/products?category=lips');
    const res = await getPublicProducts(req);

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.products.length > 0);
    assert.ok(data.products.every((p: any) => p.categorySlug === 'lips'));
  });

  it('serves dynamic categories via public /api/categories route', async () => {
    const req = new NextRequest('http://localhost:3000/api/categories');
    const res = await getPublicCategories(req);

    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.categories));
    assert.ok(data.categories.length >= 7);
  });
});
