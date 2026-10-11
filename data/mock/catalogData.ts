import type { Category, Offer, Product } from '../types.ts';
import {
  LAUNCH_CATEGORIES,
  LAUNCH_PRODUCTS,
  LAUNCH_OFFERS,
} from '../../lib/data/launchCatalog.ts';

/**
 * Authentic Bee & Beauty Pre-Launch Catalog
 * Decoupled from old mock/dummy placeholders, driven by canonical launch dataset.
 */
export const CATEGORIES: Category[] = LAUNCH_CATEGORIES;
export const PRODUCTS: Product[] = LAUNCH_PRODUCTS;
export const OFFERS: Offer[] = LAUNCH_OFFERS;
