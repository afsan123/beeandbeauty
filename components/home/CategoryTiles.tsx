'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../../data/types';

export interface CategoryTilesProps {
  categories: Category[];
}

export function CategoryTiles({ categories }: CategoryTilesProps) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-white border-b border-[#F0E6DD]/70 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
            Explore Categories
          </span>
          <h2 className="text-lg md:text-2xl font-bold uppercase tracking-[0.12em] text-[#6A1B6D] font-serif">
            Shop By Collection
          </h2>
        </div>

        {/* Category tiles row */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 md:gap-6 justify-center">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop/${cat.slug}`}
              className="group flex flex-col items-center text-center transition-transform hover:-translate-y-1"
            >
              {/* Circular tile container with refined border */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden bg-[#FFF9F5] border-2 border-[#F0E6DD] group-hover:border-[#D4AF37] transition-all shadow-xs group-hover:shadow-md">
                <Image
                  src={cat.tileImage}
                  alt={cat.name}
                  fill
                  sizes="(max-width: 640px) 80px, 112px"
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />
              </div>

              {/* Title */}
              <span className="mt-2.5 text-xs font-bold uppercase tracking-wider text-[#2C2C2C] group-hover:text-[#6A1B6D] transition-colors">
                {cat.shortTitle}
              </span>
              <span className="text-[10px] text-neutral-400 font-medium">
                {cat.productCount} Items
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
