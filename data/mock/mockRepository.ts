import type { CatalogRepository } from '../repository.ts';
import type { Category, FilterState, Offer, Product, SortOption } from '../types.ts';
import { filterProducts, sortProducts } from '../../lib/filters.ts';
import { searchCatalog } from '../../lib/search.ts';
import {
  getAllCatalogProducts,
  getProductBySlug as fetchProductBySlug,
  getProductById as fetchProductById,
} from '../../lib/services/productService.ts';
import {
  getAllCategories,
  getCategoryBySlug as fetchCategoryBySlug,
} from '../../lib/services/categoryService.ts';
import { getActiveOffers } from '../../lib/services/limitedOfferService.ts';

export class MockCatalogRepository implements CatalogRepository {
  async getProducts(
    filters?: Partial<FilterState>,
    sort?: SortOption
  ): Promise<Product[]> {
    const products = await getAllCatalogProducts();
    const filtered = filterProducts(products, filters);
    const sorted = sortProducts(filtered, sort);
    return sorted;
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    return await fetchProductBySlug(slug);
  }

  async getProductById(id: string): Promise<Product | null> {
    return await fetchProductById(id);
  }

  async getCategories(): Promise<Category[]> {
    return await getAllCategories();
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    return await fetchCategoryBySlug(slug);
  }

  async getFeaturedProducts(
    type: 'new' | 'bestseller' | 'kits' | 'under499'
  ): Promise<Product[]> {
    const products = await getAllCatalogProducts();
    switch (type) {
      case 'new':
        return products.filter((p) => p.isNewLaunch);
      case 'bestseller':
        return products.filter((p) => p.isBestseller);
      case 'kits':
        return products.filter((p) => p.isKit);
      case 'under499':
        return products.filter((p) => p.isUnder499 || p.price <= 499);
      default:
        return products.filter((p) => p.isFeatured);
    }
  }

  async getRelatedProducts(productId: string, limit: number = 4): Promise<Product[]> {
    const products = await getAllCatalogProducts();
    const target = products.find((p) => p.id === productId);
    if (!target) return products.slice(0, limit);

    const related = products.filter(
      (p) => p.id !== productId && p.categorySlug === target.categorySlug
    );

    if (related.length >= limit) {
      return related.slice(0, limit);
    }

    // If not enough in same category, backfill with bestsellers
    const others = products.filter(
      (p) => p.id !== productId && p.categorySlug !== target.categorySlug
    );
    return [...related, ...others].slice(0, limit);
  }

  async searchProducts(query: string): Promise<Product[]> {
    const products = await getAllCatalogProducts();
    return searchCatalog(products, query);
  }

  async getOffers(): Promise<Offer[]> {
    const offers = await getActiveOffers();
    return offers;
  }
}

// Singleton repository instance for app components
export const catalogRepository: CatalogRepository = new MockCatalogRepository();
