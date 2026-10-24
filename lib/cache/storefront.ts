import { cacheLife, cacheTag } from 'next/cache.js';
import { STORE_TAGS } from './tags.ts';
import { getAllCatalogProducts } from '../services/productService.ts';
import { getAllCategories } from '../services/categoryService.ts';
import { getActiveBanners } from '../services/bannerService.ts';
import { getActiveOffers } from '../services/limitedOfferService.ts';
import { getActiveTutorials } from '../services/studioService.ts';

export async function getCachedCatalogProducts() {
  'use cache';
  cacheTag(STORE_TAGS.products, STORE_TAGS.catalog);
  cacheLife('max');
  return getAllCatalogProducts(true);
}

export async function getCachedCategories() {
  'use cache';
  cacheTag(STORE_TAGS.categories, STORE_TAGS.catalog);
  cacheLife('max');
  return getAllCategories(true);
}

export async function getCachedActiveBanners() {
  'use cache';
  cacheTag(STORE_TAGS.banners, STORE_TAGS.catalog);
  cacheLife('max');
  return getActiveBanners(undefined, true);
}

export async function getCachedActiveOffers() {
  'use cache';
  cacheTag(STORE_TAGS.offers, STORE_TAGS.catalog);
  cacheLife('max');
  return getActiveOffers(true);
}

export async function getCachedActiveTutorials() {
  'use cache';
  cacheTag(STORE_TAGS.tutorials);
  cacheLife('max');
  return getActiveTutorials();
}
