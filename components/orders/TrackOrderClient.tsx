'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MessageCircle,
  AlertCircle,
  MapPin,
  CreditCard,
} from 'lucide-react';
import { formatPrice } from '../../lib/formatters';

interface TrackingStep {
  title: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  streetAddress: string;
  district: string;
  deliveryZone: 'dhaka' | 'outside';
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  targetDelivery: string;
  courierTrackingCode?: string;
  createdAt: string;
  items: Array<{
    productId: string;
    productTitle: string;
    shadeName?: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}

export function TrackOrderClient() {
  const searchParams = useSearchParams();
  const initialOrderNumber = searchParams.get('orderNumber') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [timeline, setTimeline] = useState<TrackingStep[]>([]);

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim()) {
      setError('Please enter your Order Reference (e.g. BB-2026-10492).');
      return;
    }
    if (!phone.trim()) {
      setError('Please enter the mobile number used when ordering.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Order lookup failed.');
      }

      setOrder(data.order);
      setTimeline(data.timeline || []);
    } catch (err: unknown) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Error locating order.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-search if query params are present on mount
  useEffect(() => {
    if (initialOrderNumber && initialPhone) {
      handleTrack();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrderNumber, initialPhone]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] block mb-1">
          Real-Time Dispatch Concierge
        </span>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
          Track Your Order
        </h1>
        <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
          Monitor your package transit across Dhaka and nationwide Bangladesh. Enter your order reference and mobile number.
        </p>
      </div>

      {/* Lookup Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-[2px] border border-[#F0E6DD] shadow-2xs mb-8">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderNumber" className="block text-xs font-semibold text-[#2C2C2C] mb-1.5 uppercase tracking-wider">
                Order Number
              </label>
              <input
                id="orderNumber"
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="e.g. BB-2026-10492"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] focus:outline-none focus:border-[#6A1B6D] transition-colors"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-[#2C2C2C] mb-1.5 uppercase tracking-wider">
                Mobile Number
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full text-xs px-3.5 py-2.5 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] focus:outline-none focus:border-[#6A1B6D] transition-colors"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#6A1B6D] hover:bg-[#521354] disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Search size={15} />
            <span>{isLoading ? 'Checking Dispatch Telemetry...' : 'Track Delivery Status'}</span>
          </button>
        </form>
      </div>

      {/* Order Results */}
      {order && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Status Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-[2px] border border-[#F0E6DD] shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0E6DD]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-0.5">
                  Order Reference
                </span>
                <span className="font-mono text-base font-bold text-[#6A1B6D]">
                  #{order.orderNumber}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                  <CheckCircle2 size={13} />
                  <span>{order.orderStatus}</span>
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FFF9F5] text-[#D4AF37] border border-[#F0E6DD]">
                  {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
                </span>
              </div>
            </div>

            {/* SLA Callout */}
            <div className="mt-4 p-3 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] flex items-center gap-3">
              <Truck size={18} className="text-[#6A1B6D] shrink-0" />
              <div className="text-xs">
                <span className="font-semibold text-[#2C2C2C]">{order.targetDelivery}</span>
                <p className="text-[11px] text-[#666666] mt-0.5">
                  Destination: {order.streetAddress}, {order.district} • Courier Tracking:{' '}
                  <strong>{order.courierTrackingCode || 'Assigned on dispatch'}</strong>
                </p>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="mt-8">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-6 font-serif">
                Dispatch Progression Timeline
              </h2>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#F0E6DD]">
                {timeline.map((step, idx) => {
                  const isCompleted = step.status === 'completed';
                  const isCurrent = step.status === 'current';

                  return (
                    <div key={idx} className="relative">
                      {/* Stepper Dot */}
                      <div
                        className={`absolute -left-[27px] top-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                          isCompleted
                            ? 'bg-[#2E7D32] border-[#2E7D32] text-white'
                            : isCurrent
                            ? 'bg-[#D4AF37] border-[#6A1B6D]'
                            : 'bg-white border-[#F0E6DD]'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 size={10} />}
                      </div>

                      <div className="text-xs">
                        <span
                          className={`font-semibold block ${
                            isCurrent
                              ? 'text-[#6A1B6D]'
                              : isCompleted
                              ? 'text-[#2C2C2C]'
                              : 'text-neutral-400'
                          }`}
                        >
                          {step.title}
                        </span>
                        <p className="text-[11px] text-[#666666] mt-0.5 leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Itemized Recap */}
            <div className="mt-8 pt-6 border-t border-[#F0E6DD]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-4">
                Ordered Formulas ({order.items.length})
              </h3>
              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs pb-2 border-b border-[#F0E6DD]/60">
                    <div>
                      <span className="font-semibold text-[#2C2C2C]">{item.productTitle}</span>
                      {item.shadeName && (
                        <span className="text-[11px] text-[#666666] block">
                          Shade: {item.shadeName} • Qty: {item.quantity}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-[#6A1B6D]">{formatPrice(item.lineTotal)}</span>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="mt-4 pt-2 text-xs space-y-1 text-right">
                <div className="text-neutral-500">
                  Subtotal: <span className="font-medium text-[#2C2C2C]">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="text-[#C2188B]">
                    Discount: -{formatPrice(order.discountAmount)}
                  </div>
                )}
                <div className="text-neutral-500">
                  Delivery: {order.shippingFee === 0 ? 'FREE' : formatPrice(order.shippingFee)}
                </div>
                <div className="text-sm font-bold text-[#6A1B6D] pt-1 border-t border-[#F0E6DD]">
                  Grand Total: {formatPrice(order.totalAmount)}
                </div>
              </div>
            </div>

            {/* Help / WhatsApp Support */}
            <div className="mt-8 pt-6 border-t border-[#F0E6DD] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-neutral-500">Need delivery rescheduling?</span>
              <a
                href={`https://wa.me/8801754502430?text=${encodeURIComponent(
                  `Hello Bee & Beauty, I would like to inquire about the delivery status of order #${order.orderNumber}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-[2px] transition-colors"
              >
                <MessageCircle size={15} />
                <span>Message Concierge on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
