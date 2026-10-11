'use client';

import React, { useState } from 'react';
import type { StoredCoupon } from '../../lib/services/couponService.ts';

interface CreateCouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCouponCreated: (coupon: StoredCoupon) => void;
}

export function CreateCouponModal({
  isOpen,
  onClose,
  onCouponCreated,
}: CreateCouponModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<number>(1000);
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Coupon code is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: Number(discountValue),
          minSpend: Number(minSpend) || 0,
          maxDiscount: maxDiscount ? Number(maxDiscount) : null,
          isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create coupon');
      }

      onCouponCreated(data.coupon);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating coupon.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[var(--bb-ivory)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--bb-plum)] text-amber-300 font-serif font-bold">
              🎟️
            </span>
            <h2 className="text-base font-bold font-serif text-stone-900">
              Create New Promotional Coupon
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              ⚠ {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              required
              placeholder="e.g. SUMMER15, EIDSPECIAL"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm font-mono font-bold tracking-wider uppercase focus:border-[var(--bb-plum)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-semibold focus:border-[var(--bb-plum)] focus:outline-none"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed BDT (৳)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                {discountType === 'percentage' ? 'Percentage (1-100%)' : 'Amount in BDT (৳)'}
              </label>
              <input
                type="number"
                disabled={discountType === 'free_shipping'}
                value={discountType === 'free_shipping' ? 0 : discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                min={1}
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-semibold focus:border-[var(--bb-plum)] focus:outline-none disabled:bg-stone-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Minimum Spend (৳)
              </label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(Number(e.target.value))}
                min={0}
                placeholder="e.g. 1000"
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-semibold focus:border-[var(--bb-plum)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                Max Discount Cap (৳)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Optional (e.g. 500)"
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-xs font-semibold focus:border-[var(--bb-plum)] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isActiveCoupon"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 text-[var(--bb-plum)] focus:ring-[var(--bb-plum)]"
            />
            <label htmlFor="isActiveCoupon" className="text-xs font-bold text-stone-700">
              Activate coupon immediately upon creation
            </label>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 px-4 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Activate Promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
