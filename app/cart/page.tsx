'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight, ShieldCheck, Tag, X, Trash2 } from 'lucide-react';
import { useCart } from '../../store/cart';
import { CartLineItem } from '../../components/cart/CartLineItem';
import { FreeShippingBar } from '../../components/cart/FreeShippingBar';
import { formatPrice } from '../../lib/price';
import { applyCoupon } from '../../lib/cart';

export default function CartPage() {
  const {
    items,
    totals,
    updateQuantity,
    removeItem,
    clearCart,
    appliedCoupon,
    applyCouponCode,
    removeCouponCode,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

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

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-black">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#111111] font-medium">Shopping Bag</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#111111] font-serif">
          Shopping Bag ({totals.itemCount} items)
        </h1>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white border border-neutral-200 rounded-[2px] max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#EAE2D5] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag size={28} className="text-[#C5A059]" />
          </div>
          <h2 className="text-base font-bold uppercase tracking-wider text-[#111111] font-serif mb-2">
            Your Bag Is Currently Empty
          </h2>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed mb-6">
            Looks like you haven&apos;t added any luxury cosmetics yet. Explore our bestsellers and find your signature shade.
          </p>
          <Link
            href="/shop/all"
            className="inline-block bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-[0.12em] px-8 py-3.5 rounded-[2px] transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Items List */}
          <div className="lg:col-span-8 space-y-4">
            <FreeShippingBar subtotal={totals.subtotal} />

            <div className="bg-white border border-neutral-200 rounded-[2px] p-4 sm:p-6 shadow-2xs">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <span>Items in your bag</span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="flex items-center gap-1 text-neutral-400 hover:text-[#C53030] transition-colors text-[11px] cursor-pointer"
                >
                  <Trash2 size={12} />
                  <span>Clear All</span>
                </button>
              </div>

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
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout CTA */}
          <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#EAE2D5] rounded-[2px] p-6 space-y-5">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#111111] pb-3 border-b border-[#EAE2D5]">
              Order Summary
            </h2>

            {/* Coupon Box */}
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
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. BEEFIRST)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-[2px] uppercase placeholder:normal-case outline-hidden focus:border-black font-mono"
                  />
                  <button
                    type="submit"
                    className="bg-neutral-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-[2px] cursor-pointer"
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

            {/* Calculations */}
            <div className="space-y-2 text-xs pt-3 border-t border-[#EAE2D5]">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal ({totals.itemCount} items)</span>
                <span className="font-semibold text-neutral-900">{formatPrice(totals.subtotal)}</span>
              </div>

              {totals.discount > 0 && (
                <div className="flex justify-between text-[#2E7D32] font-semibold">
                  <span>Special Discount</span>
                  <span>-{formatPrice(totals.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-600">
                <span>Shipping Fee</span>
                {totals.shippingFee === 0 ? (
                  <span className="font-semibold text-[#2E7D32]">FREE</span>
                ) : (
                  <span className="font-semibold text-neutral-900">{formatPrice(totals.shippingFee)}</span>
                )}
              </div>

              {totals.totalSavings > 0 && (
                <div className="flex justify-between text-[#2E7D32] bg-[#E8F5E9] p-2 rounded-[2px] font-semibold text-[11px]">
                  <span>Total Savings on this order</span>
                  <span>{formatPrice(totals.totalSavings)}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-bold text-[#111111] pt-3 border-t border-[#EAE2D5]">
                <span className="uppercase tracking-wider">Estimated Total</span>
                <span className="text-base text-[#111111]">{formatPrice(totals.total)}</span>
              </div>
            </div>

            {/* CTA */}
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-4 rounded-[2px] transition-all cursor-pointer shadow-sm active:scale-[0.99]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </Link>

            <div className="pt-2 text-center">
              <span className="inline-flex items-center gap-1.5 text-[11px] text-neutral-500">
                <ShieldCheck size={14} className="text-[#C5A059]" />
                100% Secure Checkout &amp; Cash on Delivery Available
              </span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
