'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';
import { Product } from '../../data/types';
import { ProductCard } from '../catalog/ProductCard';
import { catalogRepository } from '../../data/mock/mockRepository';

const POPULAR_SEARCHES = [
  'Velvet Matte',
  'Serum Foundation',
  'Kohl Pencil',
  'Liquid Lipstick',
  'Dewy Mist',
  'Under ৳499',
  'Nude',
  'Gift Box',
];

export function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    let isMounted = true;
    if (query.trim()) {
      setIsLoading(true);
      catalogRepository.searchProducts(query.trim()).then((res) => {
        if (isMounted) {
          setResults(res);
          setIsLoading(false);
        }
      });
    } else {
      setResults([]);
      setIsLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleChipClick = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClear = () => {
    setQuery('');
    router.push('/search');
  };

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Catalog Search</span>
      </nav>

      {/* Main Search Input Form */}
      <div className="max-w-2xl mx-auto mb-10 text-center font-sans">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-4">
          Search Bee &amp; Beauty
        </h1>

        <form onSubmit={handleSubmit} className="relative flex items-center">
          <SearchIcon size={18} className="absolute left-4 text-neutral-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product name, shade, category or keyword..."
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-[#F0E6DD] rounded-[2px] text-xs sm:text-sm text-[#2C2C2C] outline-hidden focus:border-[#6A1B6D] shadow-xs font-sans"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 text-neutral-400 hover:text-[#6A1B6D] p-1 cursor-pointer"
              aria-label="Clear search query"
            >
              <X size={16} />
            </button>
          )}
        </form>

        {/* Popular Search Suggestions */}
        <div className="mt-4 flex items-center justify-center gap-1.5 flex-wrap text-xs">
          <span className="text-neutral-400 text-[11px] uppercase tracking-wider font-semibold mr-1">
            Trending:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handleChipClick(term)}
              className="bg-[#FFF9F5] border border-[#F0E6DD] hover:border-[#6A1B6D] text-neutral-700 hover:text-[#6A1B6D] text-[11px] px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div>
        {query.trim() && (
          <div className="mb-6 pb-3 border-b border-neutral-200 flex items-center justify-between">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              {isLoading
                ? 'Searching...'
                : `Showing ${results.length} result${results.length === 1 ? '' : 's'} for "${query}"`}
            </p>
          </div>
        )}

        {results.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : query.trim() && !isLoading ? (
          <div className="text-center py-16 px-4 bg-white border border-neutral-200 rounded-[2px] max-w-md mx-auto">
            <h3 className="text-base font-bold uppercase tracking-wider text-[#111111] font-serif mb-2">
              No Formulas Found
            </h3>
            <p className="text-xs text-neutral-500 leading-relaxed mb-6">
              We couldn&apos;t find any products matching &ldquo;{query}&rdquo;. Check spelling or try browsing our bestsellers.
            </p>
            <Link
              href="/shop/all"
              className="inline-block bg-[#111111] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-[2px] hover:bg-[#333333] transition-colors"
            >
              Browse All Products
            </Link>
          </div>
        ) : !query.trim() ? (
          <div className="text-center py-12 text-xs text-neutral-400">
            Type a search term above to explore formulas, lipsticks, and seasonal collections.
          </div>
        ) : null}
      </div>
    </div>
  );
}
