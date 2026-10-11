import type { FilterState, Product, SortOption } from '../data/types';

export function filterProducts(
  products: Product[],
  filters?: Partial<FilterState>
): Product[] {
  if (!filters) return products;

  return products.filter((product) => {
    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (product.categorySlug.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    // In-stock only filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }

    // Min price
    if (typeof filters.minPrice === 'number' && product.price < filters.minPrice) {
      return false;
    }

    // Max price
    if (typeof filters.maxPrice === 'number' && product.price > filters.maxPrice) {
      return false;
    }

    // Minimum rating
    if (typeof filters.ratingMin === 'number' && product.rating < filters.ratingMin) {
      return false;
    }

    // Badge filter
    if (filters.badge && filters.badge !== 'all') {
      const hasBadge = product.badges.some(
        (b) => b.type.toLowerCase() === filters.badge!.toLowerCase()
      );
      if (!hasBadge) return false;
    }

    return true;
  });
}

export function sortProducts(
  products: Product[],
  sortOption: SortOption = 'featured'
): Product[] {
  const cloned = [...products];

  switch (sortOption) {
    case 'price-asc':
      return cloned.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return cloned.sort((a, b) => b.price - a.price);
    case 'rating':
      return cloned.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    case 'newest':
      return cloned.sort((a, b) => (b.isNewLaunch ? 1 : 0) - (a.isNewLaunch ? 1 : 0));
    case 'bestselling':
      return cloned.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0));
    case 'featured':
    default:
      return cloned.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }
}

export function getPriceRange(products: Product[]): { min: number; max: number } {
  if (products.length === 0) return { min: 0, max: 2000 };
  const prices = products.map((p) => p.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}
