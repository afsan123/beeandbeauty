'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CATEGORIES } from '../../data/mock/catalogData';

export function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  return (
    <nav className="hidden lg:flex items-center gap-7 h-full font-sans" aria-label="Main Navigation">
      {CATEGORIES.map((cat) => (
        <div
          key={cat.id}
          className="relative h-full flex items-center"
          onMouseEnter={() => setActiveCategory(cat.slug)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <Link
            href={`/shop/${cat.slug}`}
            className="text-xs font-semibold uppercase tracking-[0.15em] text-[#2C2C2C] hover:text-[#6A1B6D] py-5 border-b-2 border-transparent hover:border-[#6A1B6D] transition-all"
          >
            {cat.shortTitle}
          </Link>

          {/* Mega-menu dropdown panel */}
          {activeCategory === cat.slug && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-[720px] bg-white border border-[#F0E6DD] shadow-2xl p-7 z-50 animate-in fade-in zoom-in-95 duration-150 grid grid-cols-3 gap-6 rounded-[2px]">
              {/* Subcategories list */}
              <div className="col-span-2">
                <div className="text-[11px] font-bold uppercase tracking-widest text-[#6A1B6D] mb-3 pb-1 border-b border-[#F0E6DD]">
                  Shop {cat.name} by Type
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/shop/${cat.slug}`}
                      className="text-xs text-[#2C2C2C] hover:text-[#C2188B] font-medium transition-colors block py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  <Link
                    href={`/shop/${cat.slug}`}
                    className="text-xs text-[#6A1B6D] hover:text-[#C2188B] font-bold transition-colors block py-1 col-span-2 mt-2 pt-2 border-t border-[#F0E6DD]"
                  >
                    View All {cat.name} &rarr;
                  </Link>
                </div>
              </div>

              {/* Featured Promo in Dropdown */}
              <div className={`col-span-1 p-4 border rounded-[2px] flex flex-col justify-between ${
                cat.slug === 'skin'
                  ? 'bg-[#EBF3EE]/80 border-[#C2DBCB]'
                  : 'bg-[#FFF9F5] border-[#F0E6DD]'
              }`}>
                <div>
                  <span className={`text-[9px] font-bold uppercase tracking-widest text-white px-2 py-0.5 inline-block mb-2 rounded-xs ${
                    cat.slug === 'skin' ? 'bg-[#3E6351]' : 'bg-[#6A1B6D]'
                  }`}>
                    {cat.slug === 'skin' ? 'Clean Barrier Rituals' : 'Featured Collection'}
                  </span>
                  <div className={`text-xs font-bold leading-tight mb-1.5 font-serif text-sm ${
                    cat.slug === 'skin' ? 'text-[#274436]' : 'text-[#6A1B6D]'
                  }`}>
                    {cat.name} Collection
                  </div>
                  <p className="text-[11px] text-[#666666] line-clamp-3 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <Link
                  href={`/shop/${cat.slug}`}
                  className={`mt-3 text-[11px] font-bold uppercase tracking-wider underline ${
                    cat.slug === 'skin' ? 'text-[#274436] hover:text-[#3E6351]' : 'text-[#6A1B6D] hover:text-[#C2188B]'
                  }`}
                >
                  Explore Collection
                </Link>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Direct links for Value Store & Offers */}
      <Link
        href="/shop/under499"
        className="text-xs font-semibold uppercase tracking-[0.15em] text-[#C2188B] hover:text-[#9B136F] py-5 transition-colors"
      >
        Under ৳499
      </Link>

      <Link
        href="/offers"
        className="text-xs font-semibold uppercase tracking-[0.15em] text-[#D4AF37] hover:text-[#A98724] py-5 transition-colors font-bold"
      >
        Offers
      </Link>
    </nav>
  );
}
