'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Heart, MapPin, Shield, Truck } from 'lucide-react';
import { Product, Shade } from '../../data/types';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';
import { QuantityStepper } from '../ui/QuantityStepper';
import { ShadePicker } from './ShadePicker';
import { useCart } from '../../store/cart';
import { useWishlist } from '../../store/wishlist';
import { cn } from '../../lib/cn';

export interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    product.shades.find((s) => s.inStock) || product.shades[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);

  const isSaved = isInWishlist(product.id);

  const handleAddToBag = () => {
    addItem({
      id: selectedShade ? `${product.id}-${selectedShade.id}` : product.id,
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      categoryName: product.categoryName,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      selectedShade: selectedShade,
      quantity,
      image: product.images.primary,
    });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length >= 4) {
      if (pincode.startsWith('1')) {
        setPincodeMessage('Dhaka Metro delivery available! Target arrival within 24 hours (৳80 or Free > ৳1,499).');
      } else {
        setPincodeMessage('Nationwide delivery available! Target arrival within 48 hours (৳130 or Free > ৳1,499).');
      }
    } else {
      setPincodeMessage('Please enter a valid 4-digit postal code.');
    }
  };

  return (
    <div className="flex flex-col gap-5 text-[#2C2C2C] font-sans">
      {/* Category Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <Link href={`/shop/${product.categorySlug}`} className="hover:text-[#6A1B6D]">
          {product.categoryName}
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium truncate max-w-[200px]">
          {product.title}
        </span>
      </nav>

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] leading-tight font-serif">
          {product.title}
        </h1>
        <p className="text-xs md:text-sm text-[#666666] mt-1.5 leading-relaxed font-light">
          {product.subtitle}
        </p>
      </div>

      {/* Ratings bar */}
      <div className="flex items-center gap-3">
        <Rating rating={product.rating} reviewCount={product.reviewCount} size="md" />
        <span className="text-neutral-300">|</span>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2E7D32] bg-[#E8F5E9] px-2 py-0.5 rounded-[2px]">
          In Stock
        </span>
      </div>

      {/* Pricing Block */}
      <div className="bg-[#FFF9F5] p-4 border border-[#F0E6DD] rounded-[2px]">
        <Price
          price={product.price}
          compareAtPrice={product.compareAtPrice}
          size="xl"
        />
        <p className="text-[11px] text-[#666666] mt-1 font-medium">
          MRP in Bangladeshi Taka. Free nationwide shipping on orders over ৳1,499.
        </p>
      </div>

      {/* Shade Picker */}
      {product.shades.length > 0 && (
        <ShadePicker
          shades={product.shades}
          selectedShade={selectedShade}
          onSelectShade={setSelectedShade}
        />
      )}

      {/* Quantity & Add to Bag CTA */}
      <div className="flex items-center gap-3 pt-2">
        <QuantityStepper value={quantity} onChange={setQuantity} size="md" />

        <button
          type="button"
          onClick={handleAddToBag}
          className="flex-1 bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs md:text-sm font-bold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-all cursor-pointer shadow-xs active:scale-[0.99]"
        >
          Add to Bag
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className="w-11 h-11 border border-[#F0E6DD] rounded-[2px] flex items-center justify-center text-neutral-700 hover:text-[#C2188B] hover:border-[#C2188B] transition-colors cursor-pointer bg-white"
        >
          <Heart
            size={18}
            className={cn(isSaved ? 'fill-[#C2188B] text-[#C2188B]' : '')}
          />
        </button>
      </div>

      {/* Feature Highlights Chips */}
      <div className="flex items-center gap-2 flex-wrap pt-2">
        <span className="text-[11px] font-semibold bg-[#FFF9F5] border border-[#F0E6DD] text-[#6A1B6D] px-2.5 py-1 rounded-[2px]">
          Finish: {product.details.finish}
        </span>
        <span className="text-[11px] font-semibold bg-[#FFF9F5] border border-[#F0E6DD] text-[#6A1B6D] px-2.5 py-1 rounded-[2px]">
          Origin: {product.details.origin}
        </span>
        <span className="text-[11px] font-semibold bg-[#FFF9F5] border border-[#F0E6DD] text-[#6A1B6D] px-2.5 py-1 rounded-[2px]">
          Cruelty-Free &amp; Botanical
        </span>
      </div>

      {/* Pincode Delivery Check */}
      <div className="pt-3 border-t border-[#F0E6DD]">
        <form onSubmit={handleCheckPincode} className="flex gap-2">
          <div className="relative flex-1">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Enter District Postal Code (e.g. 1213)"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-[2px] cursor-pointer"
          >
            Check
          </button>
        </form>
        {pincodeMessage && (
          <p className="text-[11px] text-[#2E7D32] mt-1.5 font-medium flex items-center gap-1">
            <Check size={12} /> {pincodeMessage}
          </p>
        )}
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#F0E6DD] text-center">
        <div className="flex flex-col items-center p-2.5 bg-white border border-[#F0E6DD] rounded-[2px]">
          <Shield size={16} className="text-[#D4AF37] mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A1B6D]">100% Genuine</span>
        </div>
        <div className="flex flex-col items-center p-2.5 bg-white border border-[#F0E6DD] rounded-[2px]">
          <Truck size={16} className="text-[#D4AF37] mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A1B6D]">24h / 48h Target</span>
        </div>
        <Link
          href="/return-policy"
          className="flex flex-col items-center p-2.5 bg-white border border-[#F0E6DD] rounded-[2px] hover:border-[#6A1B6D] transition-colors"
        >
          <Check size={16} className="text-[#D4AF37] mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6A1B6D]">3-Day Returns</span>
        </Link>
      </div>
    </div>
  );
}
