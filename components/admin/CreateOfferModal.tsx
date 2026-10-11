'use client';

import React, { useState, useEffect } from 'react';
import type { LimitedOffer } from '../../lib/services/limitedOfferService';

interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (offer: LimitedOffer) => void;
  initialOffer?: LimitedOffer | null;
}

export function CreateOfferModal({
  isOpen,
  onClose,
  onSaved,
  initialOffer,
}: CreateOfferModalProps) {
  const isEditing = Boolean(initialOffer);

  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_gift'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minSpend, setMinSpend] = useState<string>('');
  const [freeItemName, setFreeItemName] = useState('');
  const [expiryNote, setExpiryNote] = useState('Limited time only while stock lasts');
  const [badge, setBadge] = useState('Flash Sale');
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialOffer) {
      setCode(initialOffer.code);
      setTitle(initialOffer.title);
      setDescription(initialOffer.description || '');
      setDiscountType(initialOffer.discountType);
      setDiscountValue(initialOffer.discountValue);
      setMinSpend(initialOffer.minSpend !== undefined ? String(initialOffer.minSpend) : '');
      setFreeItemName(initialOffer.freeItemName || '');
      setExpiryNote(initialOffer.expiryNote || 'Limited time only');
      setBadge(initialOffer.badge || 'Flash Sale');
      setIsActive(initialOffer.isActive !== false);
    } else {
      setCode('');
      setTitle('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue(15);
      setMinSpend('2500');
      setFreeItemName('');
      setExpiryNote('Valid until stock lasts');
      setBadge('Flash Sale');
      setIsActive(true);
    }
    setErrorMsg('');
  }, [initialOffer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !title.trim()) {
      setErrorMsg('Promo Code and Campaign Title are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue) || 0,
      minSpend: minSpend ? Number(minSpend) : undefined,
      freeItemName: freeItemName.trim() || undefined,
      expiryNote: expiryNote.trim(),
      badge: badge.trim(),
      isActive,
    };

    try {
      const url = isEditing
        ? `/api/admin/offers/${initialOffer!.id}`
        : '/api/admin/offers';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save offer');

      onSaved(data.offer);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200/90 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              {isEditing ? 'Edit Limited Offer' : 'Create Limited Offer'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Launch flash deals, tier discounts, or complimentary beauty gifts synced with `/offers`.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          {/* Coupon Code & Badge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Coupon Code *</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. VELVET20"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono font-bold tracking-wider uppercase focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Offer Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Flash Deal, VIP Exclusive"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Campaign Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 20% Off Royal Propolis Serum & Skincare"
              required
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-serif font-bold text-stone-900 focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Campaign Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enjoy instant savings at checkout on all orders above ৳2,500..."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Discount Type *</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none font-medium"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="fixed">Fixed BDT Off (৳)</option>
                <option value="free_gift">Free Beauty Gift</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                {discountType === 'percentage'
                  ? 'Discount Percent (%) *'
                  : discountType === 'fixed'
                  ? 'Discount Amount (৳ BDT) *'
                  : 'Gift Tier Value'}
              </label>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                min={0}
                required
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none font-bold"
              />
            </div>
          </div>

          {/* Min Spend & Free Item */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Min Spend (৳ BDT)</label>
              <input
                type="number"
                value={minSpend}
                onChange={(e) => setMinSpend(e.target.value)}
                placeholder="e.g. 2500"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">Leave empty for no minimum spend</span>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Free Item Name (if gift)</label>
              <input
                type="text"
                value={freeItemName}
                onChange={(e) => setFreeItemName(e.target.value)}
                placeholder="e.g. Mini Honey Lip Balm"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Expiry Note */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Expiry / Countdown Note *</label>
            <input
              type="text"
              value={expiryNote}
              onChange={(e) => setExpiryNote(e.target.value)}
              placeholder="e.g. Ends Friday at Midnight"
              required
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* Active status */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-[var(--bb-plum)]"
            />
            <span className="font-semibold text-stone-800">
              Active Campaign (Visible on /offers & storefront banners)
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
