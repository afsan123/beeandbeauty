'use client';

import React from 'react';
import Image from 'next/image';
import { ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { CartItem } from '../../data/types';
import { CartTotals } from '../../lib/cart';
import { formatPrice } from '../../lib/formatters';

export interface OrderSummaryProps {
  items: CartItem[];
  totals: CartTotals;
}

export function OrderSummary({ items, totals }: OrderSummaryProps) {
  return (
    <div className="bg-[#FAF8F5] border border-[#EAE2D5] rounded-[2px] p-5 text-[#111111]">
      <h3 className="text-xs font-bold uppercase tracking-wider text-[#111111] pb-3 border-b border-[#E8DFD1]">
        Order Summary ({totals.itemCount} items)
      </h3>

      {/* Items list */}
      <div className="divide-y divide-[#EFE7DC] max-h-72 overflow-y-auto py-2 pr-1">
        {items.map((item) => (
          <div key={item.id} className="py-2.5 flex items-center gap-3 text-xs">
            <div className="relative w-12 h-12 bg-white rounded-[2px] overflow-hidden shrink-0 border border-neutral-200">
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="48px"
                className="object-cover"
              />
              <span className="absolute -top-1 -right-1 bg-[#111111] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {item.quantity}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-neutral-900 truncate">{item.title}</p>
              {item.selectedShade && (
                <p className="text-[11px] text-neutral-500 truncate">
                  Shade: {item.selectedShade.code} {item.selectedShade.name}
                </p>
              )}
            </div>

            <div className="font-semibold text-neutral-900 shrink-0">
              {formatPrice(item.price * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      {/* Bill calculation */}
      <div className="space-y-2 text-xs pt-3 border-t border-[#E8DFD1]">
        <div className="flex justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900">{formatPrice(totals.subtotal)}</span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-[#2E7D32] font-semibold">
            <span>Coupon Discount ({totals.appliedCoupon})</span>
            <span>-{formatPrice(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between text-neutral-600">
          <span>Shipping &amp; Handling</span>
          {totals.shippingFee === 0 ? (
            <span className="font-semibold text-[#2E7D32]">FREE</span>
          ) : (
            <span className="font-semibold text-neutral-900">{formatPrice(totals.shippingFee)}</span>
          )}
        </div>

        {totals.totalSavings > 0 && (
          <div className="flex justify-between text-[#2E7D32] bg-[#E8F5E9] px-2 py-1.5 rounded-[2px] font-semibold text-[11px]">
            <span>Total Savings</span>
            <span>{formatPrice(totals.totalSavings)}</span>
          </div>
        )}

        <div className="flex justify-between text-sm font-bold text-[#111111] pt-3 border-t border-[#E8DFD1]">
          <span className="uppercase tracking-wider">Total Payable</span>
          <span className="text-base text-[#111111]">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Security note */}
      <div className="mt-4 pt-3 border-t border-[#E8DFD1] space-y-2 text-[11px] text-neutral-500">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#C5A059] shrink-0" />
          <span>Encrypted checkout session with SSL encryption</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-[#C5A059] shrink-0" />
          <span>Verified tracked delivery across 64 districts</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCcw size={14} className="text-[#C5A059] shrink-0" />
          <span>Hassle-free 7-day replacement warranty</span>
        </div>
      </div>
    </div>
  );
}
