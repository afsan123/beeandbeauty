'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import { CreateCouponModal } from '../../../components/admin/CreateCouponModal.tsx';
import type { StoredCoupon } from '../../../lib/services/couponService.ts';
import { formatPrice } from '../../../lib/formatters.ts';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<StoredCoupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingCode, setUpdatingCode] = useState<string | null>(null);

  const fetchCoupons = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/coupons');
      if (!res.ok) throw new Error('Failed to load coupons');
      const data = await res.json();
      setCoupons(data.coupons || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading promotional coupons.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleToggleStatus = async (coupon: StoredCoupon) => {
    const newStatus = !coupon.isActive;
    const identifier = coupon.id || coupon.code;
    setUpdatingCode(coupon.code);

    try {
      const res = await fetch(`/api/admin/coupons/${identifier}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.code === coupon.code ? { ...c, isActive: newStatus } : c))
        );
      }
    } catch (err) {
      console.error('Error toggling coupon status:', err);
    } finally {
      setUpdatingCode(null);
    }
  };

  const handleDeleteCoupon = async (coupon: StoredCoupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) return;

    const identifier = coupon.id || coupon.code;
    try {
      const res = await fetch(`/api/admin/coupons/${identifier}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCoupons((prev) => prev.filter((c) => c.code !== coupon.code));
      }
    } catch (err) {
      console.error('Error deleting coupon:', err);
    }
  };

  const handleCouponCreated = (newCoupon: StoredCoupon) => {
    setCoupons((prev) => [newCoupon, ...prev]);
  };

  const formatDiscountDisplay = (coupon: StoredCoupon) => {
    switch (coupon.discountType) {
      case 'percentage':
        return `${coupon.discountValue}% OFF`;
      case 'fixed':
        return `${formatPrice(coupon.discountValue)} OFF`;
      case 'free_shipping':
        return 'Free Doorstep Delivery';
      default:
        return `${coupon.discountValue}`;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        onToggleSidebar={() => {}}
        title="Promotions & Coupon Campaigns"
        subtitle="Create, configure, and monitor discount codes for marketing campaigns across Bangladesh."
        actionButton={{
          label: 'Launch New Coupon',
          onClick: () => setIsModalOpen(true),
          icon: <span className="text-base">🎟️</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Coupons Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 bg-[var(--bb-ivory)] px-6 py-4">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Active & Archived Coupon Ledger
            </h3>
            <p className="text-xs text-stone-500">
              Coupons are validated real-time against minimum spend thresholds at checkout
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {coupons.length} Campaign Codes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-3 px-4 font-bold uppercase">Promo Code</th>
                <th className="py-3 px-4 font-bold uppercase">Type</th>
                <th className="py-3 px-4 font-bold uppercase">Discount Value</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Min Spend (৳)</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Max Cap (৳)</th>
                <th className="py-3 px-4 font-bold uppercase text-center">Status</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-500 font-medium">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
                    Loading coupons...
                  </td>
                </tr>
              ) : coupons.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    No promo codes registered. Click &quot;Launch New Coupon&quot; to create one.
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.code} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded-lg border border-[var(--bb-plum)]/30 bg-[var(--bb-plum)]/5 px-2.5 py-1 font-mono font-bold text-sm tracking-wider text-[var(--bb-plum)]">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-stone-700 uppercase">
                      {coupon.discountType.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-700 font-serif text-sm">
                      {formatDiscountDisplay(coupon)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-900">
                      {coupon.minSpend > 0 ? formatPrice(coupon.minSpend) : 'No Minimum'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-600">
                      {coupon.maxDiscount ? formatPrice(coupon.maxDiscount) : 'None'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(coupon)}
                        disabled={updatingCode === coupon.code}
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase transition-all ${
                          coupon.isActive
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-300 hover:bg-stone-200'
                        }`}
                      >
                        {coupon.isActive ? '● Live Active' : '○ Paused'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteCoupon(coupon)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete coupon"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      <CreateCouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCouponCreated={handleCouponCreated}
      />
    </div>
  );
}
