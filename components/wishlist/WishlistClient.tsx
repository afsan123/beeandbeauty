'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Trash2 } from 'lucide-react';
import { useWishlist } from '../../store/wishlist';
import { Product } from '../../data/types';
import { ProductCard } from '../catalog/ProductCard';
import { fetchPublicProducts } from '../../lib/catalog/publicApi';

export function WishlistClient() {
  const { wishlistIds, clearWishlist, wishlistCount } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchPublicProducts().then((all) => {
      if (isMounted) {
        const saved = all.filter((p) => wishlistIds.includes(p.id));
        setProducts(saved);
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [wishlistIds]);

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">My Wishlist</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-[#F0E6DD] mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
            My Wishlist ({wishlistCount})
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-light">
            Keep track of your favorite formulas and saved shades in one place.
          </p>
        </div>

        {wishlistCount > 0 && (
          <button
            type="button"
            onClick={clearWishlist}
            className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-[#C2188B] transition-colors uppercase tracking-wider font-semibold cursor-pointer"
          >
            <Trash2 size={14} />
            <span>Clear Wishlist</span>
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-neutral-400">
          Loading saved products...
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white border border-[#F0E6DD] rounded-[2px] max-w-md mx-auto shadow-2xs">
          <div className="w-16 h-16 rounded-full bg-[#FFF9F5] border border-[#F0E6DD] flex items-center justify-center mx-auto mb-4">
            <Heart size={28} className="text-[#C2188B]" />
          </div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
            Your Wishlist Is Empty
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed mb-6 font-light">
            Tap the heart icon on any product or shade to save it to your personal vanity list for later.
          </p>
          <Link
            href="/shop/all"
            className="inline-block bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.12em] px-8 py-3.5 rounded-[2px] transition-colors shadow-xs"
          >
            Explore Cosmetics
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
