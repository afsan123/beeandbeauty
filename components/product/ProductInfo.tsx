'use client';

import React, { useState, useEffect } from 'react';
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
import { useStorefrontRealtime } from '../../lib/services/realtimeStorefront.ts';

export interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [currentProduct, setCurrentProduct] = useState<Product>(product);

  useEffect(() => {
    setCurrentProduct(product);
  }, [product]);

  const [selectedShade, setSelectedShade] = useState<Shade | undefined>(
    currentProduct.shades.find((s) => s.inStock) || currentProduct.shades[0]
  );
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeMessage, setPincodeMessage] = useState<string | null>(null);

  // Real-time catalog and inventory synchronization
  useStorefrontRealtime({
    onCatalogUpdate: (event) => {
      if (!event.id || event.id === product.id || event.slug === product.slug) {
        fetch(`/api/products?refresh=true&search=${encodeURIComponent(product.title)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            const fresh = data?.products?.find((p: Product) => p.id === product.id || p.slug === product.slug);
            if (fresh) {
              setCurrentProduct(fresh);
              setSelectedShade((prev) => {
                if (!prev) return fresh.shades?.[0];
                const updated = fresh.shades?.find((s: Shade) => s.id === prev.id);
                return updated || prev;
              });
            }
          })
          .catch(() => {});
      }
    },
  });

  const isSaved = isInWishlist(currentProduct.id);
  const isStockAvailable = currentProduct.inStock !== false && (!selectedShade || selectedShade.inStock !== false);

  const handleAddToBag = () => {
    addItem({
      id: selectedShade ? `${currentProduct.id}-${selectedShade.id}` : currentProduct.id,
      productId: currentProduct.id,
      productSlug: currentProduct.slug,
      title: currentProduct.title,
      categoryName: currentProduct.categoryName,
      price: currentProduct.price,
      compareAtPrice: currentProduct.compareAtPrice,
      selectedShade: selectedShade,
      quantity,
      image: currentProduct.images.primary,
    });
  };

  const handleCheckPincode = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincode.length >= 4) {
      if (pincode.startsWith('1')) {
        setPincodeMessage('Dhaka Metro delivery available! Target arrival within 24 hours (৳70 or Free > ৳2,500).');
      } else {
        setPincodeMessage('Nationwide delivery available! Target arrival within 48 hours (৳130 or Free > ৳2,500).');
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
        <Link href={`/shop/${currentProduct.categorySlug}`} className="hover:text-[#6A1B6D]">
          {currentProduct.categoryName}
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium truncate max-w-[200px]">
          {currentProduct.title}
        </span>
      </nav>

      {/* Title & Subtitle */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] leading-tight font-serif">
          {currentProduct.title}
        </h1>
        <p className="text-xs md:text-sm text-[#666666] mt-1.5 leading-relaxed font-light">
          {currentProduct.subtitle}
        </p>
      </div>

      {/* Ratings bar */}
      <div className="flex items-center gap-3">
        <Rating rating={currentProduct.rating} reviewCount={currentProduct.reviewCount} size="md" />
        <span className="text-neutral-300">|</span>
        <span
          className={cn(
            'text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[2px]',
            isStockAvailable
              ? 'text-[#2E7D32] bg-[#E8F5E9]'
              : 'text-rose-700 bg-rose-50 border border-rose-200'
          )}
        >
          {isStockAvailable ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Pricing Block */}
      <div className="bg-[#FFF9F5] p-4 border border-[#F0E6DD] rounded-[2px]">
        <Price
          price={currentProduct.price}
          compareAtPrice={currentProduct.compareAtPrice}
          size="xl"
        />
        <p className="text-[11px] text-[#666666] mt-1 font-medium">
          MRP in Bangladeshi Taka. Free nationwide tracked delivery on orders above ৳2,500.
        </p>
      </div>

      {/* Shade Picker for Cosmetics / Botanical Actives for Skincare */}
      {currentProduct.categorySlug === 'skin' ? (
        <div className="bg-[#EBF3EE]/80 border border-[#C2DBCB] rounded-[2px] p-3 text-xs flex flex-col gap-1.5">
          <div className="font-bold uppercase tracking-wider text-[#274436] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#3E6351]" />
            <span>Clinical &amp; Botanical Barrier Care</span>
          </div>
          <p className="text-[11px] text-[#3D5A4C] leading-relaxed">
            Dermatologically tested, hypoallergenic, non-comedogenic formula enriched with raw propolis, bio-identical ceramides, and antioxidant honey nectar.
          </p>
        </div>
      ) : currentProduct.shades && currentProduct.shades.length > 0 ? (
        <ShadePicker
          shades={currentProduct.shades}
          selectedShade={selectedShade}
          onSelectShade={setSelectedShade}
        />
      ) : null}

      {/* Quantity & Add to Bag CTA */}
      <div className="flex items-center gap-3 pt-2">
        <QuantityStepper value={quantity} onChange={setQuantity} size="md" />

        <button
          type="button"
          onClick={handleAddToBag}
          disabled={!isStockAvailable}
          className={cn(
            'flex-1 text-xs md:text-sm font-bold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-all shadow-xs',
            isStockAvailable
              ? 'bg-[#6A1B6D] hover:bg-[#521354] text-white cursor-pointer active:scale-[0.99]'
              : 'bg-stone-200 text-stone-500 cursor-not-allowed border border-stone-300'
          )}
        >
          {isStockAvailable ? 'Add to Bag' : 'Out of Stock'}
        </button>

        <button
          type="button"
          onClick={() => toggleWishlist(currentProduct.id)}
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
