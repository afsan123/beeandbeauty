'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { Product, Shade } from '../../data/types';
import { Badge } from '../ui/Badge';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';
import { useCart } from '../../store/cart';
import { useWishlist } from '../../store/wishlist';
import { cn } from '../../lib/cn';

export interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  // Selected shade state defaults to the first in-stock shade
  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades.find((s) => s.inStock) || product.shades[0]
  );
  const [isHovered, setIsHovered] = useState(false);
  const isSaved = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: selectedShade ? `${product.id}-${selectedShade.id}` : product.id,
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      categoryName: product.categoryName,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      selectedShade: selectedShade,
      image: product.images.primary,
    });
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-white border border-neutral-200/70 hover:border-neutral-300 hover:shadow-lg transition-all duration-300 rounded-[2px] overflow-hidden',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Visual Image Box */}
      <div className="relative aspect-square w-full bg-[#FBFBFA] overflow-hidden">
        <Link href={`/product/${product.slug}`} className="block w-full h-full">
          {/* Primary & Hover Images */}
          <div className="relative w-full h-full">
            <Image
              src={product.images.primary}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={cn(
                'object-cover transition-opacity duration-400 ease-in-out',
                isHovered && product.images.hover ? 'opacity-0' : 'opacity-100'
              )}
            />
            {product.images.hover && (
              <Image
                src={product.images.hover}
                alt={`${product.title} swatch preview`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={cn(
                  'object-cover transition-opacity duration-400 ease-in-out',
                  isHovered ? 'opacity-100' : 'opacity-0'
                )}
              />
            )}
          </div>
        </Link>

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10 pointer-events-none">
          {product.badges.map((badge, idx) => (
            <Badge key={idx} type={badge.type} label={badge.label} size="sm" />
          ))}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-neutral-600 hover:text-[#C2188B] shadow-xs transition-transform active:scale-90 cursor-pointer"
        >
          <Heart
            size={16}
            className={cn(
              'transition-colors',
              isSaved ? 'fill-[#C2188B] text-[#C2188B]' : 'text-neutral-700'
            )}
          />
        </button>
      </div>

      {/* Product Content Body */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5 font-sans">
        <div>
          {/* Interactive Shade Swatches for Makeup / Formula Tag for Skincare */}
          {product.categorySlug === 'skin' ? (
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] uppercase font-bold text-[#274436] bg-[#EBF3EE] px-2 py-0.5 rounded-[2px] border border-[#C2DBCB] tracking-wider">
                Barrier Skincare
              </span>
              <span className="text-[9px] uppercase font-bold text-[#B45309] bg-[#FEF7ED] px-2 py-0.5 rounded-[2px] border border-[#FDE68A] tracking-wider">
                Raw Honey
              </span>
            </div>
          ) : product.shades.length > 0 ? (
            <div className="flex items-center gap-1.5 mb-2 flex-wrap">
              {product.shades.slice(0, 5).map((shade) => {
                const isSelected = selectedShade?.id === shade.id;
                return (
                  <button
                    key={shade.id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedShade(shade);
                    }}
                    aria-label={`Select shade ${shade.name}`}
                    title={shade.name}
                    className={cn(
                      'w-4.5 h-4.5 rounded-full transition-transform cursor-pointer relative',
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-[#6A1B6D] scale-110 z-10'
                        : 'hover:scale-105'
                    )}
                    style={{ backgroundColor: shade.hexColor }}
                  />
                );
              })}

              {product.shades.length > 5 && (
                <span className="text-[10px] text-neutral-500 font-medium ml-1">
                  +{product.shades.length - 5} Shades
                </span>
              )}
            </div>
          ) : null}

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="block text-xs md:text-sm font-medium text-[#2C2C2C] hover:text-[#6A1B6D] line-clamp-2 leading-snug transition-colors"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="mt-1.5">
            <Rating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          </div>

          {/* Price */}
          <div className="mt-2">
            <Price
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="sm"
            />
          </div>
        </div>

        {/* Quick Add To Bag Button */}
        <button
          type="button"
          onClick={handleQuickAdd}
          className="w-full mt-2 bg-[#6A1B6D] hover:bg-[#521354] text-white text-[11px] font-semibold uppercase tracking-[0.12em] py-2.5 rounded-[2px] transition-colors cursor-pointer active:scale-[0.99] shadow-2xs"
        >
          Add to Bag
        </button>
      </div>
    </div>
  );
}
