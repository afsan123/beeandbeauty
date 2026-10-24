'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, X } from 'lucide-react';
import { Category, FilterState, Product, SortOption } from '../../data/types';
import { ProductCard } from './ProductCard';
import { FilterSidebar } from './FilterSidebar';
import { SortDropdown } from './SortDropdown';
import { Pagination } from './Pagination';
import { filterProducts, sortProducts } from '../../lib/filters';
import { Drawer } from '../ui/Drawer';
import { useStorefrontRealtime } from '../../lib/services/realtimeStorefront.ts';

export interface ShopClientProps {
  initialCategory: Category | null;
  allCategories: Category[];
  allProducts: Product[];
  categorySlug: string;
}

const ITEMS_PER_PAGE = 8;

export function ShopClient({
  initialCategory,
  allCategories,
  allProducts,
  categorySlug,
}: ShopClientProps) {
  const [products, setProducts] = useState<Product[]>(allProducts);

  // Sync state if server props refresh
  useEffect(() => {
    setProducts(allProducts);
  }, [allProducts]);

  // Connect real-time synchronization for instant catalog updates
  useStorefrontRealtime({
    onCatalogUpdate: () => {
      const catParam = categorySlug !== 'all' ? `&category=${encodeURIComponent(categorySlug)}` : '';
      fetch(`/api/products?refresh=true${catParam}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.products && Array.isArray(data.products)) {
            setProducts(data.products);
          }
        })
        .catch(() => {});
    },
  });

  const [filters, setFilters] = useState<FilterState>({
    category: categorySlug === 'all' || categorySlug === 'under499' ? undefined : categorySlug,
    inStockOnly: false,
    minPrice: 0,
    maxPrice: categorySlug === 'under499' ? 499 : 3500,
    ratingMin: 0,
    badge: undefined,
  });

  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute filtered & sorted products
  const filteredProducts = useMemo(() => {
    let prods = products;
    if (categorySlug === 'under499') {
      prods = prods.filter((p) => p.isUnder499 || p.price <= 499);
    }
    const filtered = filterProducts(prods, filters);
    return sortProducts(filtered, sortOption);
  }, [products, filters, sortOption, categorySlug]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: categorySlug === 'all' || categorySlug === 'under499' ? undefined : categorySlug,
      inStockOnly: false,
      minPrice: 0,
      maxPrice: categorySlug === 'under499' ? 499 : 3500,
      ratingMin: 0,
      badge: undefined,
    });
    setCurrentPage(1);
  };

  const pageTitle =
    categorySlug === 'all'
      ? 'All Cosmetics & Formulas'
      : categorySlug === 'under499'
      ? 'Under ৳499 Value Store'
      : initialCategory?.name || 'Cosmetics Collection';

  const pageDescription =
    categorySlug === 'all'
      ? 'Explore the complete Bee&Beauty collection, from cult-favorite velvet lipsticks to skincare-infused serum foundations.'
      : categorySlug === 'under499'
      ? 'Everyday cosmetics, mini sizes, and vanity staples priced under ৳499 without sacrificing prestige quality.'
      : initialCategory?.description ||
        'Formulated with pure botanical royal jelly and tailored undertones.';

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#111111] font-medium">{pageTitle}</span>
      </nav>

      {/* Header Banner */}
      <div className="mb-8 pb-6 border-b border-neutral-200">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold uppercase tracking-wider text-[#111111] font-serif">
          {pageTitle}
        </h1>
        <p className="text-xs md:text-sm text-neutral-600 mt-2 max-w-2xl leading-relaxed">
          {pageDescription}
        </p>
      </div>

      {/* Filter Bar & Sort Controls */}
      <div className="flex items-center justify-between gap-4 pb-6 border-b border-neutral-200 mb-8">
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="lg:hidden flex items-center gap-2 border border-neutral-300 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-[#111111] rounded-[2px]"
        >
          <SlidersHorizontal size={14} />
          <span>Filters ({filteredProducts.length})</span>
        </button>

        <div className="hidden lg:block text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Showing <strong>{filteredProducts.length}</strong> Products
        </div>

        <SortDropdown value={sortOption} onChange={setSortOption} />
      </div>

      {/* Main Catalog Layout */}
      <div className="flex gap-8 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-64 shrink-0 bg-[#FFF9F5] p-5 rounded-[2px] border border-[#F0E6DD]">
          <FilterSidebar
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalProductsCount={filteredProducts.length}
          />
        </div>

        {/* Product Grid Area */}
        <div className="flex-1 min-w-0">
          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20 px-4 bg-white border border-[#F0E6DD] rounded-[2px]">
              <h3 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
                No Matching Formulas Found
              </h3>
              <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed mb-6 font-light">
                Try widening your price range, clearing collection filters, or toggling in-stock items.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="bg-[#6A1B6D] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-[2px] hover:bg-[#521354] transition-colors cursor-pointer shadow-xs"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                {paginatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Collection"
        side="left"
      >
        <FilterSidebar
          filters={filters}
          onChange={(newFilters) => {
            handleFilterChange(newFilters);
          }}
          onReset={() => {
            handleResetFilters();
            setIsMobileFilterOpen(false);
          }}
          totalProductsCount={filteredProducts.length}
        />
        <div className="pt-6">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(false)}
            className="w-full bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider py-3 rounded-[2px] transition-colors"
          >
            Apply Filters ({filteredProducts.length} items)
          </button>
        </div>
      </Drawer>
    </div>
  );
}
