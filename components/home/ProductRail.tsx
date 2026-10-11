'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '../../data/types';
import { ProductCard } from '../catalog/ProductCard';

export interface ProductRailProps {
  products: Product[];
  title: string;
  subtitle?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  limit?: number;
}

export function ProductRail({
  products,
  title,
  subtitle,
  viewAllHref,
  viewAllLabel = 'View All',
  limit = 4,
}: ProductRailProps) {
  if (!products || products.length === 0) return null;

  const displayProducts = products.slice(0, limit);

  return (
    <section className="py-10 md:py-14 bg-white border-b border-[#F0E6DD]/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold uppercase tracking-[0.14em] text-[#6A1B6D] font-serif">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs md:text-sm text-[#666666] mt-1 max-w-xl font-light">
                {subtitle}
              </p>
            )}
          </div>

          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#6A1B6D] hover:text-[#C2188B] transition-colors self-start sm:self-auto shrink-0 pb-0.5 border-b border-[#6A1B6D] hover:border-[#C2188B]"
            >
              <span>{viewAllLabel}</span>
              <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
