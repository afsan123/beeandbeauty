'use client';

import React, { useState } from 'react';
import type { CustomerProfile } from '../../lib/services/customerService.ts';
import type { StoredOrder } from '../../lib/services/orderService.ts';
import { formatPrice } from '../../lib/formatters.ts';

interface CustomerDetailModalProps {
  customer: CustomerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onInspectOrder?: (order: StoredOrder) => void;
  onCustomerUpdated?: (updated: CustomerProfile) => void;
}

export function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  onInspectOrder,
  onCustomerUpdated,
}: CustomerDetailModalProps) {
  const [notes, setNotes] = useState(customer?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  React.useEffect(() => {
    setNotes(customer?.notes || '');
    setSaveSuccess(false);
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`/api/admin/customers/${encodeURIComponent(customer.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      const data = await res.json();
      if (res.ok && data.customer) {
        setSaveSuccess(true);
        if (onCustomerUpdated) onCustomerUpdated(data.customer);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const getTierBadge = (tier: CustomerProfile['tier']) => {
    switch (tier) {
      case 'VIP Client':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Repeat Buyer':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const avgOrderValue =
    customer.totalOrders > 0
      ? Math.round(customer.totalSpent / customer.totalOrders)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200/90 max-h-[90vh] overflow-y-auto space-y-6 text-xs font-sans">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--bb-plum)] to-[var(--bb-magenta)] font-serif text-lg font-bold text-amber-300 shadow-sm">
              {customer.name ? customer.name.slice(0, 2).toUpperCase() : 'CU'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif text-stone-900">
                  {customer.name}
                </h2>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTierBadge(
                    customer.tier
                  )}`}
                >
                  {customer.tier}
                </span>
              </div>
              <p className="text-stone-500 mt-0.5">
                {customer.phone} &bull; {customer.email}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Financial Metrics Strip */}
        <div className="grid grid-cols-3 gap-3.5">
          <div className="rounded-xl border border-stone-200 bg-[var(--bb-ivory)] p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-stone-500">
              Lifetime Value
            </span>
            <p className="text-xl font-bold font-serif text-stone-900">
              {formatPrice(customer.totalSpent)}
            </p>
            <span className="text-[10px] text-stone-400">Total settled revenue</span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-stone-500">
              Orders Placed
            </span>
            <p className="text-xl font-bold font-serif text-stone-900">
              {customer.totalOrders}
            </p>
            <span className="text-[10px] text-stone-400">Lifetime frequency</span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-0.5">
            <span className="text-[10px] font-bold uppercase text-stone-500">
              Average Basket (AOV)
            </span>
            <p className="text-xl font-bold font-serif text-stone-900">
              {formatPrice(avgOrderValue)}
            </p>
            <span className="text-[10px] text-stone-400">Per-order average</span>
          </div>
        </div>

        {/* Primary Delivery Destination & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-2">
            <h4 className="font-bold font-serif text-stone-900 text-xs">
              Primary Delivery Address
            </h4>
            <p className="text-stone-700 leading-relaxed">
              {customer.streetAddress || 'No street address recorded'}
            </p>
            <p className="font-semibold text-stone-900">
              District: {customer.district || 'Dhaka'} ({customer.deliveryZone === 'dhaka' ? 'Inside Dhaka 24h SLA' : 'Outside Dhaka 48h SLA'})
            </p>
          </div>

          {/* Administrative Notes */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-bold font-serif text-stone-900 text-xs">
                Executive VIP Notes
              </h4>
              {saveSuccess && (
                <span className="text-[11px] font-bold text-emerald-700">✓ Saved</span>
              )}
            </div>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. VIP client, prefers evening deliveries, likes velvet matte formulas..."
              className="w-full rounded-lg border border-stone-200 p-2 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="rounded-lg bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3 py-1 font-semibold text-xs transition-colors disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>

        {/* Complete Order History Timeline */}
        <div className="space-y-3">
          <h4 className="font-bold font-serif text-stone-900 text-sm">
            Chronological Order History ({customer.orders.length})
          </h4>

          <div className="rounded-xl border border-stone-200/80 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {customer.orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/70">
                    <td className="py-2.5 px-3 font-mono font-bold text-stone-900">
                      #{order.orderNumber}
                    </td>
                    <td className="py-2.5 px-3 text-stone-500">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 border-stone-200">
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {onInspectOrder && (
                        <button
                          onClick={() => onInspectOrder(order)}
                          className="rounded-lg bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-2.5 py-1 text-[11px] font-semibold"
                        >
                          Invoice &rarr;
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Support Tickets if any */}
        {customer.inquiries.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-stone-100">
            <h4 className="font-bold font-serif text-stone-900 text-xs">
              Customer Inquiries Raised ({customer.inquiries.length})
            </h4>
            <div className="space-y-2">
              {customer.inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-stone-900">
                      [{inq.ticketNumber}] {inq.subject}
                    </span>
                    <p className="text-stone-600 mt-1 line-clamp-2">{inq.message}</p>
                  </div>
                  <span className="rounded-full bg-amber-100 text-amber-900 px-2 py-0.5 text-[10px] font-bold uppercase shrink-0">
                    {inq.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
