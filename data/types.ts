export interface Shade {
  id: string;
  name: string;
  code: string; // e.g. "01", "02"
  hexColor: string;
  description?: string;
  family: 'nude' | 'red' | 'pink' | 'berry' | 'brown' | 'neutral' | 'all';
  inStock: boolean;
  swatchImage?: string;
}

export interface ProductBadge {
  type: 'new' | 'bestseller' | 'sale' | 'exclusive' | 'limited';
  label: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  subtitle: string;
  shortDescription: string;
  description: string;
  howToUse: string;
  ingredients: string;
  details: {
    netWeight: string;
    shelfLife: string;
    origin: string;
    finish: string;
    formulation: string;
  };
  price: number; // in BDT (৳)
  compareAtPrice?: number; // original price before discount
  rating: number; // e.g. 4.8
  reviewCount: number; // e.g. 791
  badges: ProductBadge[];
  shades: Shade[];
  images: {
    primary: string;
    hover: string;
    gallery: string[];
  };
  inStock: boolean;
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewLaunch?: boolean;
  isKit?: boolean;
  isUnder499?: boolean;
  tags: string[];
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  shortTitle: string;
  description: string;
  tileImage: string;
  heroBannerImage?: string;
  productCount: number;
  subcategories: {
    name: string;
    slug: string;
  }[];
}

export interface Offer {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'percentage' | 'fixed' | 'free_gift';
  discountValue: number; // percentage (e.g. 15) or amount in BDT (e.g. 700)
  minSpend?: number;
  freeItemName?: string;
  expiryNote: string;
  badge: string;
}

export interface CartItem {
  id: string; // unique cart item id: `${productId}-${shadeId}`
  productId: string;
  productSlug: string;
  title: string;
  categoryName: string;
  price: number;
  compareAtPrice?: number;
  selectedShade?: Shade;
  quantity: number;
  image: string;
}

export interface FilterState {
  category?: string;
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
  ratingMin: number;
  badge?: string;
}

export type SortOption =
  | 'featured'
  | 'bestselling'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest';
