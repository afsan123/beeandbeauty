'use client';

import React from 'react';
import { Product } from '../../data/types';
import { ProductCard } from '../catalog/ProductCard';

export interface RelatedProductsProps {
  products: Product[];
  title?: string;
  subtitle?: string;
}

export function RelatedProducts({
  products,
  title = 'Complete The Look',
  subtitle = 'Curated formulas that pair effortlessly with your routine',
}: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="pt-12 pb-6 border-t border-neutral-200">
      <div className="text-center mb-8">
        <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.14em] text-[#111111] font-serif">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs md:text-sm text-neutral-500 mt-1 max-w-xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
