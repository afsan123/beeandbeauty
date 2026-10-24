export const STORE_TAGS = {
  catalog: 'store:catalog',
  products: 'store:products',
  categories: 'store:categories',
  banners: 'store:banners',
  offers: 'store:offers',
  tutorials: 'store:tutorials',
} as const;

export type StoreTag = (typeof STORE_TAGS)[keyof typeof STORE_TAGS];
