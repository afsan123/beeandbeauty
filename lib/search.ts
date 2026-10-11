import type { Product } from '../data/types';

export function searchCatalog(products: Product[], query: string): Product[] {
  if (!query || !query.trim()) {
    return [];
  }

  const cleanQuery = query.toLowerCase().trim();
  const searchTerms = cleanQuery.split(/\s+/).filter(Boolean);

  return products
    .map((product) => {
      let score = 0;
      const titleLower = product.title.toLowerCase();
      const catLower = product.categoryName.toLowerCase();
      const subLower = product.subtitle.toLowerCase();
      const descLower = product.description.toLowerCase();
      const tagsJoined = product.tags.join(' ').toLowerCase();
      const shadeNamesJoined = product.shades.map((s) => s.name).join(' ').toLowerCase();

      // Exact title match gets highest score
      if (titleLower === cleanQuery) {
        score += 100;
      } else if (titleLower.includes(cleanQuery)) {
        score += 50;
      }

      // Check each word term
      for (const term of searchTerms) {
        if (titleLower.includes(term)) score += 20;
        if (catLower.includes(term)) score += 15;
        if (subLower.includes(term)) score += 10;
        if (tagsJoined.includes(term)) score += 8;
        if (shadeNamesJoined.includes(term)) score += 6;
        if (descLower.includes(term)) score += 3;
      }

      return { product, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.product);
}
