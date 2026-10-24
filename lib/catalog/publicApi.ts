import type { Product } from '../../data/types.ts';

export async function fetchPublicProducts(options?: {
  search?: string;
  category?: string;
  badge?: string;
}): Promise<Product[]> {
  const params = new URLSearchParams();
  if (options?.search) params.set('search', options.search);
  if (options?.category) params.set('category', options.category);
  if (options?.badge) params.set('badge', options.badge);

  const query = params.toString();
  const res = await fetch(`/api/products${query ? `?${query}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data.products) ? data.products : [];
}
