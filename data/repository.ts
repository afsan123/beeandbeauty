import type { Category, FilterState, Offer, Product, SortOption } from './types.ts';

export interface CatalogRepository {
  getProducts(filters?: Partial<FilterState>, sort?: SortOption): Promise<Product[]>;
  getProductBySlug(slug: string): Promise<Product | null>;
  getProductById(id: string): Promise<Product | null>;
  getCategories(): Promise<Category[]>;
  getCategoryBySlug(slug: string): Promise<Category | null>;
  getFeaturedProducts(type: 'new' | 'bestseller' | 'kits' | 'under499'): Promise<Product[]>;
  getRelatedProducts(productId: string, limit?: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  getOffers(): Promise<Offer[]>;
}
