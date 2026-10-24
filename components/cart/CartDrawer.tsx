'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, Tag, X, CheckCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../../store/cart';
import { Drawer } from '../ui/Drawer';
import { FreeShippingBar } from './FreeShippingBar';
import { CartLineItem } from './CartLineItem';
import { CartUpsell } from './CartUpsell';
import { formatPrice } from '../../lib/formatters';
import { applyCoupon } from '../../lib/cart';
import { catalogRepository } from '../../data/mock/mockRepository';
import { Product } from '../../data/types';

export function CartDrawer() {
  const {
    items,
    totals,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
    addItem,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);

  useEffect(() => {
    let isMounted = true;
    catalogRepository.getFeaturedProducts('under499').then((prods) => {
      if (isMounted) {
        setUpsellProducts(prods);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(totals.subtotal, couponInput.trim());
    if (res.isValid) {
      applyCouponCode(res.code!);
      setCouponFeedback({ type: 'success', text: res.message });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message || 'Invalid coupon code' });
    }
  };

  const handleRemoveCoupon = () => {
    removeCouponCode();
    setCouponFeedback(null);
  };

  const handleAddUpsell = (product: Product) => {
    const firstShade = product.shades[0];
    addItem({
      id: firstShade ? `${product.id}-${firstShade.id}` : product.id,
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      categoryName: product.categoryName,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      selectedShade: firstShade,
      image: product.images.primary,
    });
  };

  // Drawer Title
  const drawerTitle = (
    <div className="flex items-center gap-2">
      <ShoppingBag size={18} className="text-[#C5A059]" />
      <span>Shopping Bag ({totals.itemCount})</span>
    </div>
  );

  // Footer Content
  const drawerFooter = items.length > 0 && (
    <div className="space-y-3.5">
      {/* Coupon Application Block */}
      <div>
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-2.5 bg-[#E8F5E9] border border-[#C8E6C9] rounded-[2px] text-xs">
            <div className="flex items-center gap-2 text-[#2E7D32] font-semibold">
              <Tag size={14} />
              <span>Coupon {appliedCoupon} applied (-{formatPrice(totals.discount)})</span>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-neutral-500 hover:text-black p-1 cursor-pointer"
              aria-label="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Promo Code (e.g. BEEFIRST)"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value)}
                className="w-full pl-8 pr-2.5 py-2 text-xs bg-white border border-neutral-300 rounded-[2px] uppercase placeholder:normal-case outline-hidden focus:border-black font-mono"
              />
            </div>
            <button
              type="submit"
              className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-[2px] cursor-pointer"
            >
              Apply
            </button>
          </form>
        )}

        {couponFeedback && (
          <p
            className={`text-[11px] mt-1.5 font-medium ${
              couponFeedback.type === 'success' ? 'text-[#2E7D32]' : 'text-[#C53030]'
            }`}
          >
            {couponFeedback.text}
          </p>
        )}
      </div>

      {/* Bill Breakdown */}
      <div className="space-y-1.5 text-xs text-neutral-700 pt-1 border-t border-neutral-200">
        <div className="flex justify-between">
          <span>Bag Subtotal</span>
          <span className="font-semibold text-neutral-900">{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-[#2E7D32] font-medium">
            <span>Special Coupon Discount</span>
            <span>-{formatPrice(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Shipping Fee</span>
          {totals.shippingFee === 0 ? (
            <span className="font-semibold text-[#2E7D32]">FREE</span>
          ) : (
            <span className="font-semibold text-neutral-900">{formatPrice(totals.shippingFee)}</span>
          )}
        </div>

        {totals.totalSavings > 0 && (
          <div className="flex justify-between text-[#2E7D32] text-[11px] font-medium bg-[#E8F5E9] p-1.5 rounded-[2px]">
            <span>Total Savings on this order</span>
            <span>{formatPrice(totals.totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-bold text-[#6A1B6D] pt-2 border-t border-neutral-200">
          <span className="uppercase tracking-wider">Estimated Total</span>
          <span className="text-base text-[#6A1B6D]">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="space-y-2 pt-1">
        <Link
          href="/checkout"
          onClick={closeDrawer}
          className="w-full flex items-center justify-center gap-2 bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-4 rounded-[2px] transition-all cursor-pointer shadow-sm active:scale-[0.99]"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight size={14} />
        </Link>

        <div className="flex items-center justify-between text-[11px]">
          <Link
            href="/cart"
            onClick={closeDrawer}
            className="text-neutral-600 hover:text-[#6A1B6D] font-semibold underline underline-offset-2"
          >
            View Complete Shopping Bag
          </Link>
          <span className="flex items-center gap-1 text-neutral-500">
            <ShieldCheck size={13} className="text-[#D4AF37]" />
            100% Secure Checkout
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Drawer
      isOpen={isDrawerOpen}
      onClose={closeDrawer}
      title={drawerTitle}
      footer={drawerFooter}
      width="max-w-md"
    >
      {items.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EAE2D5] flex items-center justify-center mb-4">
            <ShoppingBag size={28} className="text-[#C5A059]" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#111111] font-serif">
            Your Shopping Bag Is Empty
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-xs leading-relaxed">
            Discover our luxury formulas, velvet mattes, and radiant essentials.
          </p>
          <Link
            href="/shop/all"
            onClick={closeDrawer}
            className="mt-6 inline-block bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-[0.12em] px-6 py-3 rounded-[2px] transition-colors"
          >
            Explore Cosmetics
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Dynamic Free Shipping Bar */}
          <FreeShippingBar subtotal={totals.subtotal} />

          {/* Cart Items List */}
          <div className="divide-y divide-neutral-100">
            {items.map((item) => (
              <CartLineItem
                key={item.id}
                item={item}
                onUpdateQuantity={updateQuantity}
                onRemove={removeItem}
              />
            ))}
          </div>

          {/* Recommended Add-ons Upsell */}
          {upsellProducts.length > 0 && (
            <CartUpsell
              products={upsellProducts.filter(
                (p) => !items.some((item) => item.productId === p.id)
              )}
              onAddUpsell={handleAddUpsell}
            />
          )}
        </div>
      )}
    </Drawer>
  );
}
