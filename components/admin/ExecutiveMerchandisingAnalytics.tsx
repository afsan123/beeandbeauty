'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '../../lib/formatters.ts';

export interface TopProduct {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  price: number;
  inStock: boolean;
  unitsSold: number;
  revenue: number;
  isBestseller?: boolean;
}

export interface CategoryBreakdownItem {
  slug: string;
  name: string;
  revenue: number;
  unitsSold: number;
  productCount: number;
  percent: number;
}

interface ExecutiveMerchandisingAnalyticsProps {
  topProducts: TopProduct[];
  categoryBreakdown: CategoryBreakdownItem[];
  totalCatalogProducts: number;
}

export function ExecutiveMerchandisingAnalytics({
  topProducts = [],
  categoryBreakdown = [],
  totalCatalogProducts,
}: ExecutiveMerchandisingAnalyticsProps) {
  // Category color map for luxury aesthetics
  const getCategoryColor = (slug: string) => {
    switch (slug) {
      case 'lips':
        return 'bg-[#C2188B] text-white';
      case 'face':
        return 'bg-[#E5A93C] text-stone-900';
      case 'eyes':
        return 'bg-[#6A1B6D] text-white';
      case 'skincare':
        return 'bg-[#3E6351] text-white';
      case 'nails':
        return 'bg-[#A31621] text-white';
      case 'kits':
        return 'bg-[#D4AF37] text-stone-900';
      case 'under499':
        return 'bg-stone-800 text-white';
      default:
        return 'bg-stone-500 text-white';
    }
  };

  const getCategoryBarColor = (slug: string) => {
    switch (slug) {
      case 'lips':
        return 'bg-gradient-to-r from-[#C2188B] to-[#E91E63]';
      case 'face':
        return 'bg-gradient-to-r from-[#E5A93C] to-[#F4D06F]';
      case 'eyes':
        return 'bg-gradient-to-r from-[#6A1B6D] to-[#8E24AA]';
      case 'skincare':
        return 'bg-gradient-to-r from-[#3E6351] to-[#2E7D32]';
      case 'nails':
        return 'bg-gradient-to-r from-[#A31621] to-[#C62828]';
      case 'kits':
        return 'bg-gradient-to-r from-[#D4AF37] to-[#FFA000]';
      case 'under499':
        return 'bg-gradient-to-r from-stone-700 to-stone-900';
      default:
        return 'bg-stone-400';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Top Bestselling Catalog Products */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[var(--bb-gold)]/60 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif text-stone-900">
                  Merchandising Performance & Bestsellers
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bb-plum)] bg-[var(--bb-plum)]/10 px-2 py-0.5 rounded-full">
                  {totalCatalogProducts} Products
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Top revenue-generating luxury formulas and velocity ranking.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Catalog</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-3">
            {topProducts.slice(0, 5).map((prod, idx) => (
              <div
                key={prod.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-stone-100 hover:border-stone-200 hover:bg-stone-50/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-stone-600 font-mono font-bold text-xs">
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-stone-900 truncate">{prod.title}</p>
                      {prod.isBestseller && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded shrink-0">
                          Star
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-0.5">
                      <span className="font-semibold text-stone-700">{prod.categoryName}</span>
                      <span>•</span>
                      <span>{prod.inStock ? '✓ In Stock' : '⚠️ Out of Stock'}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p className="text-xs font-bold text-stone-900 font-serif">
                    {prod.revenue > 0 ? formatPrice(prod.revenue) : formatPrice(prod.price)}
                  </p>
                  <p className="text-[10px] text-stone-500">
                    {prod.unitsSold > 0 ? `${prod.unitsSold} units sold` : 'Unit price'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500">Formulations infused with Sundarban Honey</span>
          <Link
            href="/admin/inventory"
            className="font-bold text-[var(--bb-plum)] hover:underline"
          >
            Manage Shade Levels &rarr;
          </Link>
        </div>
      </div>

      {/* 2. Category Distribution & Taxonomy Share */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[var(--bb-gold)]/60 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif text-stone-900">
                  Taxonomy & Category Merchandising Share
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6351] bg-[#3E6351]/10 px-2 py-0.5 rounded-full">
                  7 Collections
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Catalog depth and sales distribution across beauty departments.
              </p>
            </div>
            <Link
              href="/admin/categories"
              className="text-xs font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Categories</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          <div className="space-y-3.5">
            {categoryBreakdown.map((cat) => (
              <div key={cat.slug} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-stone-900">{cat.name}</span>
                    <span className="text-[10px] text-stone-400">
                      ({cat.productCount} products)
                    </span>
                  </div>
                  <span className="font-bold text-stone-700">
                    {cat.revenue > 0 ? formatPrice(cat.revenue) : `${cat.productCount} skus`}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getCategoryBarColor(
                      cat.slug
                    )}`}
                    style={{
                      width: `${
                        cat.revenue > 0
                          ? Math.max(cat.percent, 10)
                          : Math.round((cat.productCount / totalCatalogProducts) * 100)
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>Target market: Bangladesh luxury cosmetics</span>
          <span className="font-semibold text-stone-800">100% BDT Standardized</span>
        </div>
      </div>
    </div>
  );
}
