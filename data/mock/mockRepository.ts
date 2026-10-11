import type { CatalogRepository } from '../repository.ts';
import type { Category, FilterState, Offer, Product, SortOption } from '../types.ts';
import { CATEGORIES, OFFERS, PRODUCTS } from './catalogData.ts';
import { filterProducts, sortProducts } from '../../lib/filters.ts';
import { searchCatalog } from '../../lib/search.ts';

export class MockCatalogRepository implements CatalogRepository {
  async getProducts(
    filters?: Partial<FilterState>,
    sort?: SortOption
  ): Promise<Product[]> {
    const filtered = filterProducts(PRODUCTS, filters);
    const sorted = sortProducts(filtered, sort);
    return sorted;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    const product = PRODUCTS.find((p) => p.slug === slug);
    return product || null;
  }

  async getProductById(id: string): Promise<Product | null> {
    const product = PRODUCTS.find((p) => p.id === id);
    return product || null;
  }

  async getCategories(): Promise<Category[]> {
    return CATEGORIES;
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const category = CATEGORIES.find((c) => c.slug === slug);
    return category || null;
  }

  async getFeaturedProducts(
    type: 'new' | 'bestseller' | 'kits' | 'under499'
  ): Promise<Product[]> {
    switch (type) {
      case 'new':
        return PRODUCTS.filter((p) => p.isNewLaunch);
      case 'bestseller':
        return PRODUCTS.filter((p) => p.isBestseller);
      case 'kits':
        return PRODUCTS.filter((p) => p.isKit);
      case 'under499':
        return PRODUCTS.filter((p) => p.isUnder499 || p.price <= 499);
      default:
        return PRODUCTS.filter((p) => p.isFeatured);
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const target = PRODUCTS.find((p) => p.id === productId);
    if (!target) return PRODUCTS.slice(0, limit);

    const related = PRODUCTS.filter(
      (p) => p.id !== productId && p.categorySlug === target.categorySlug
    );

    if (related.length >= limit) {
      return related.slice(0, limit);
    }

    // If not enough in same category, backfill with bestsellers
    const others = PRODUCTS.filter(
      (p) => p.id !== productId && p.categorySlug !== target.categorySlug
    );
    return [...related, ...others].slice(0, limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    return searchCatalog(PRODUCTS, query);
  }

  async getOffers(): Promise<Offer[]> {
    return OFFERS;
  }
}

// Singleton repository instance for app components
export const catalogRepository: CatalogRepository = new MockCatalogRepository();
