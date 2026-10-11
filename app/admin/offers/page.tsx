'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreateOfferModal } from '../../../components/admin/CreateOfferModal';
import { formatPrice } from '../../../lib/formatters';
import type { LimitedOffer } from '../../../lib/services/limitedOfferService';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<LimitedOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<LimitedOffer | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load offers');
      setOffers(data.offers || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleToggleActive = async (offer: LimitedOffer) => {
    setActionLoadingId(offer.id);
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !offer.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update offer');
      setOffers((prev) =>
        prev.map((o) => (o.id === offer.id ? data.offer : o))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (offer: LimitedOffer) => {
    if (!confirm(`Are you sure you want to delete campaign "${offer.title}"?`)) return;
    setActionLoadingId(offer.id);
    try {
      const res = await fetch(`/api/admin/offers/${offer.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete offer');
      setOffers((prev) => prev.filter((o) => o.id !== offer.id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaved = (savedOffer: LimitedOffer) => {
    setOffers((prev) => {
      const index = prev.findIndex((o) => o.id === savedOffer.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = savedOffer;
        return copy;
      }
      return [savedOffer, ...prev];
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const filteredOffers = offers.filter((o) => {
    if (activeTab === 'active') return o.isActive;
    if (activeTab === 'inactive') return !o.isActive;
    return true;
  });

  const activeCount = offers.filter((o) => o.isActive).length;
  const percentCount = offers.filter((o) => o.discountType === 'percentage').length;
  const giftCount = offers.filter((o) => o.discountType === 'free_gift').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            <Link href="/admin" className="hover:text-[var(--bb-plum)] transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-[var(--bb-plum)]">Limited Offers</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Flash Deals & Limited-Time Campaigns
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Manage flash sales, coupon vouchers, threshold gifts, and limited promotional campaigns displayed on the public <Link href="/offers" className="underline hover:text-[var(--bb-plum)]">/offers</Link> page.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOffer(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <span className="text-sm font-bold">+</span> Create Limited Offer
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Campaigns</p>
          <p className="mt-1 text-2xl font-black font-serif text-stone-900">{offers.length}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">All created promos</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Deals</p>
          <p className="mt-1 text-2xl font-black font-serif text-emerald-700">{activeCount}</p>
          <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">Live on storefront</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Percent Off</p>
          <p className="mt-1 text-2xl font-black font-serif text-[var(--bb-plum)]">{percentCount}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Percentage discount codes</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Gift With Purchase</p>
          <p className="mt-1 text-2xl font-black font-serif text-amber-600">{giftCount}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Complimentary beauty tier</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3">
        {(['all', 'active', 'inactive'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'bg-[var(--bb-plum)] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {tab === 'all' ? 'All Campaigns' : `${tab} Campaigns`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          ⚠ {error}
        </div>
      )}

      {/* Cards list */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
          <p className="text-base font-serif font-bold text-stone-800">No limited offers found</p>
          <p className="text-xs text-stone-500 mt-1">
            {activeTab !== 'all' ? `No offers in "${activeTab}" status.` : 'Create your first promotional campaign to delight customers.'}
          </p>
          <button
            onClick={() => {
              setEditingOffer(null);
              setModalOpen(true);
            }}
            className="mt-4 rounded-xl bg-[var(--bb-plum)] text-white px-4 py-2 text-xs font-semibold hover:bg-[#831843] transition-colors"
          >
            Create Offer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredOffers.map((offer) => (
            <div
              key={offer.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
                offer.isActive ? 'border-stone-200' : 'border-stone-200/60 opacity-70 bg-stone-50/50'
              }`}
            >
              <div>
                {/* Header row with badge and status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-800 border border-amber-200/60">
                    ⚡ {offer.badge || 'Flash Deal'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      offer.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Offer Title & Description */}
                <h3 className="text-base font-bold font-serif text-stone-900 leading-snug line-clamp-2">
                  {offer.title}
                </h3>
                {offer.description && (
                  <p className="text-xs text-stone-500 mt-1.5 line-clamp-2">
                    {offer.description}
                  </p>
                )}

                {/* Voucher Code Box */}
                <div className="mt-4 flex items-center justify-between rounded-xl bg-stone-50 border border-dashed border-stone-300 p-2.5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 block">
                      Promo Code
                    </span>
                    <span className="font-mono text-sm font-extrabold text-[var(--bb-plum)] tracking-wider">
                      {offer.code}
                    </span>
                  </div>
                  <button
                    onClick={() => copyCode(offer.code)}
                    className="rounded-lg bg-white border border-stone-200 px-2.5 py-1 text-[11px] font-semibold text-stone-600 hover:bg-stone-100 transition-colors shadow-2xs"
                  >
                    {copiedCode === offer.code ? '✓ Copied' : 'Copy'}
                  </button>
                </div>

                {/* Offer Metrics */}
                <div className="mt-3.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400">Discount Benefit:</span>
                    <span className="font-bold text-stone-800">
                      {offer.discountType === 'percentage'
                        ? `${offer.discountValue}% Off`
                        : offer.discountType === 'fixed'
                        ? `${formatPrice(offer.discountValue)} Off`
                        : `Gift: ${offer.freeItemName || 'Free Beauty Item'}`}
                    </span>
                  </div>

                  {offer.minSpend !== undefined && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400">Min Order Spend:</span>
                      <span className="font-semibold text-stone-800">
                        {formatPrice(offer.minSpend)}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100">
                    <span className="text-stone-400">Expiry Note:</span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      ⏱ {offer.expiryNote}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-stone-100">
                <button
                  onClick={() => handleToggleActive(offer)}
                  disabled={actionLoadingId === offer.id}
                  className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                    offer.isActive
                      ? 'border border-stone-200 text-stone-600 hover:bg-stone-100'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  {actionLoadingId === offer.id ? 'Updating...' : offer.isActive ? 'Deactivate' : 'Activate'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingOffer(offer);
                      setModalOpen(true);
                    }}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer)}
                    disabled={actionLoadingId === offer.id}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateOfferModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        initialOffer={editingOffer}
      />
    </div>
  );
}
