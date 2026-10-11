'use client';

import React, { useState } from 'react';
import type { StoredOrder } from '../../lib/services/orderService.ts';
import { formatPrice } from '../../lib/formatters.ts';

interface OrderDetailModalProps {
  order: StoredOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderUpdated: (updatedOrder: StoredOrder) => void;
}

export function OrderDetailModal({
  order,
  isOpen,
  onClose,
  onOrderUpdated,
}: OrderDetailModalProps) {
  // Gracefully resolve both raw StoredOrder and { order: StoredOrder } API wrappers
  const resolvedOrder: StoredOrder | null = (order as any)?.order ? (order as any).order : order;

  const [selectedStatus, setSelectedStatus] = useState<StoredOrder['orderStatus'] | ''>('');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<StoredOrder['paymentStatus'] | ''>('');
  const [trackingCode, setTrackingCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Sync state whenever order opens
  React.useEffect(() => {
    if (resolvedOrder) {
      setSelectedStatus(resolvedOrder.orderStatus);
      setSelectedPaymentStatus(resolvedOrder.paymentStatus);
      setTrackingCode(resolvedOrder.courierTrackingCode || '');
      setSaveSuccess(false);
      setErrorMsg('');
    }
  }, [resolvedOrder]);

  if (!isOpen || !resolvedOrder) return null;

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrorMsg('');
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/admin/orders/${resolvedOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedStatus || resolvedOrder.orderStatus,
          paymentStatus: selectedPaymentStatus || resolvedOrder.paymentStatus,
          courierTrackingCode: trackingCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update order');
      }

      setSaveSuccess(true);
      onOrderUpdated(data.order || data);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error updating order.');
    } finally {
      setIsSaving(false);
    }
  };

  const cleanPhoneForWhatsApp = (phone?: string | null) => {
    if (!phone) return '8801754502430';
    const raw = String(phone).replace(/[\s\-\+]/g, '');
    return raw.startsWith('88') ? raw : `88${raw}`;
  };

  const getWhatsAppMessage = () => {
    const trackingInfo = trackingCode
      ? `Courier Tracking ID: ${trackingCode}`
      : 'Courier will contact you before delivery';

    const customerName = resolvedOrder.customerName || 'Valued Customer';
    const orderNumber = resolvedOrder.orderNumber || '';
    const statusText = selectedStatus || resolvedOrder.orderStatus || 'confirmed';
    const targetTimeline = resolvedOrder.targetDelivery || 'Standard Delivery';
    const totalAmount = resolvedOrder.totalAmount || 0;
    const paymentMethod = (resolvedOrder.paymentMethod || 'COD').toUpperCase();

    return encodeURIComponent(
      `Assalamu Alaikum ${customerName},\n\nYour Bee & Beauty order #${orderNumber} is ${statusText}.\n${trackingInfo}\nTarget Delivery: ${targetTimeline}.\nTotal Amount: ${formatPrice(
        totalAmount
      )} (${paymentMethod}).\n\nFor any inquiries, contact +8801754502430.\nThank you for choosing Bee & Beauty!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-[var(--bb-ivory)] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--bb-plum)] text-amber-300 font-serif font-bold">
              📦
            </span>
            <div>
              <h2 className="text-lg font-bold font-serif text-stone-900">
                Order #{resolvedOrder.orderNumber || ''}
              </h2>
              <p className="text-xs text-stone-500">
                Placed on {resolvedOrder.createdAt ? new Date(resolvedOrder.createdAt).toLocaleString('en-BD', { dateStyle: 'medium', timeStyle: 'short' }) : 'Recent'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Status Control Box */}
          <div className="rounded-xl border border-[var(--bb-gold)]/40 bg-amber-50/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--bb-plum)] flex items-center gap-2">
              <span>⚡ Order Fulfillment Controls</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Order Status */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Order Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:border-[var(--bb-plum)] focus:outline-none"
                >
                  <option value="pending">Pending (Review)</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing (Packaging)</option>
                  <option value="shipped">Shipped (With Courier)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Payment Status
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value as any)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:border-[var(--bb-plum)] focus:outline-none"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid (Settled)</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              {/* Courier Tracking Code */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-600 mb-1">
                  Courier Tracking ID (Steadfast/Pathao)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ST-2026-98124"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs font-medium focus:border-[var(--bb-plum)] focus:outline-none"
                />
              </div>
            </div>

            {/* Save & WhatsApp buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="rounded-lg bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-4 py-2 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Updating...' : 'Save Changes'}
                </button>

                {saveSuccess && (
                  <span className="text-xs font-bold text-emerald-600">
                    ✓ Updated successfully!
                  </span>
                )}
                {errorMsg && (
                  <span className="text-xs font-bold text-rose-600">
                    ⚠ {errorMsg}
                  </span>
                )}
              </div>

              {/* Direct WhatsApp Notice */}
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(resolvedOrder.customerPhone)}?text=${getWhatsAppMessage()}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <span>💬 WhatsApp Customer</span>
              </a>
            </div>
          </div>

          {/* Customer & Shipping Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-stone-50/50">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Customer Information
              </h4>
              <p className="text-sm font-bold text-stone-900">{resolvedOrder.customerName || 'Valued Customer'}</p>
              <p className="text-xs text-stone-600">📞 {resolvedOrder.customerPhone || 'Not provided'}</p>
              <p className="text-xs text-stone-600">✉ {resolvedOrder.customerEmail || 'Not provided'}</p>
              {resolvedOrder.notes && (
                <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800 border border-amber-200">
                  <span className="font-semibold">Note:</span> {resolvedOrder.notes}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-stone-200 p-4 space-y-2 bg-stone-50/50">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Shipping Destination
              </h4>
              <p className="text-xs text-stone-800 font-medium">
                {resolvedOrder.streetAddress || 'Address on file'}
              </p>
              <p className="text-xs text-stone-600">
                {resolvedOrder.district || 'Dhaka'} {resolvedOrder.postalCode ? `(${resolvedOrder.postalCode})` : ''}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="inline-flex rounded-full bg-[var(--bb-plum)]/10 px-2 py-0.5 text-[11px] font-bold text-[var(--bb-plum)]">
                  {resolvedOrder.deliveryZone === 'dhaka' ? 'Dhaka (24h Delivery)' : 'Outside Dhaka (48h Delivery)'}
                </span>
                <span className="text-[11px] font-semibold text-stone-500">
                  Target: {resolvedOrder.targetDelivery || 'Standard'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div>
            <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">
              Purchased Line Items ({(resolvedOrder.items || []).length})
            </h4>
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
                  <tr>
                    <th className="py-2.5 px-3">Product</th>
                    <th className="py-2.5 px-3">Shade</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {(resolvedOrder.items || []).map((item, index) => (
                    <tr key={index} className="hover:bg-stone-50/50">
                      <td className="py-2.5 px-3 font-semibold text-stone-900">
                        {item.productTitle}
                      </td>
                      <td className="py-2.5 px-3 text-stone-600">
                        {item.shadeName ? (
                          <span className="inline-flex items-center gap-1.5 rounded bg-stone-100 px-2 py-0.5 text-[11px]">
                            {item.shadeCode && (
                              <span className="font-bold text-[var(--bb-plum)]">{item.shadeCode}</span>
                            )}
                            <span>{item.shadeName}</span>
                          </span>
                        ) : (
                          <span className="text-stone-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium text-stone-700">
                        {formatPrice(item.unitPrice || 0)}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-stone-900">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-stone-900">
                        {formatPrice(item.lineTotal || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-end pt-2">
            <div className="w-64 space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium text-stone-900">{formatPrice(resolvedOrder.subtotal || 0)}</span>
              </div>
              {(resolvedOrder.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Discount {resolvedOrder.couponCode ? `(${resolvedOrder.couponCode})` : ''}:</span>
                  <span>-{formatPrice(resolvedOrder.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <span className="font-medium text-stone-900">
                  {resolvedOrder.shippingFee === 0 ? 'FREE' : formatPrice(resolvedOrder.shippingFee || 0)}
                </span>
              </div>
              <div className="flex justify-between border-t border-stone-200 pt-2 text-sm font-bold text-stone-900">
                <span>Grand Total:</span>
                <span className="text-[var(--bb-plum)] font-serif">{formatPrice(resolvedOrder.totalAmount || 0)}</span>
              </div>
              <div className="text-[11px] text-right text-stone-500 pt-0.5">
                Paid via <span className="font-bold uppercase">{resolvedOrder.paymentMethod || 'COD'}</span> ({resolvedOrder.paymentStatus || 'pending'})
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200 bg-stone-50 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
