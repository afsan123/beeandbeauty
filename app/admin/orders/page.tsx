'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation.js';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import { OrderDetailModal } from '../../../components/admin/OrderDetailModal.tsx';
import type { StoredOrder } from '../../../lib/services/orderService.ts';
import { formatPrice } from '../../../lib/formatters.ts';

function AdminOrdersContent() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get('status') || 'all';

  const [orders, setOrders] = useState<StoredOrder[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [zoneFilter, setZoneFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.set('status', activeTab);
      if (paymentFilter !== 'all') params.set('paymentStatus', paymentFilter);
      if (zoneFilter !== 'all') params.set('zone', zoneFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load orders ledger');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading orders.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, paymentFilter, zoneFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOrderUpdated = (updated: StoredOrder) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
  };

  const handleQuickStatusChange = async (
    order: StoredOrder,
    newStatus: StoredOrder['orderStatus']
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.order) {
        handleOrderUpdated(data.order);
      }
    } catch (err) {
      console.error('Quick status update failed:', err);
    }
  };

  const getStatusBadge = (status: StoredOrder['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'confirmed':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'pending':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const cleanPhoneForWhatsApp = (phone: string) => {
    const raw = phone.replace(/[\s\-\+]/g, '');
    return raw.startsWith('88') ? raw : `88${raw}`;
  };

  const getWhatsAppLink = (order: StoredOrder) => {
    const trackingMsg = order.courierTrackingCode
      ? `Tracking ID: ${order.courierTrackingCode}`
      : 'Rider will call upon arrival';
    const text = encodeURIComponent(
      `Assalamu Alaikum ${order.customerName},\nYour Bee & Beauty order #${order.orderNumber} is currently: ${order.orderStatus.toUpperCase()}.\n${trackingMsg}\nTarget Delivery: ${order.targetDelivery}.\nThank you!`
    );
    return `https://wa.me/${cleanPhoneForWhatsApp(order.customerPhone)}?text=${text}`;
  };

  const tabs = [
    { id: 'all', label: 'All Orders' },
    { id: 'pending', label: 'Pending' },
    { id: 'confirmed', label: 'Confirmed' },
    { id: 'processing', label: 'Processing' },
    { id: 'shipped', label: 'Shipped' },
    { id: 'delivered', label: 'Delivered' },
    { id: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        onToggleSidebar={() => {}}
        title="Order Fulfillment Ledger"
        subtitle="Manage customer orders, update delivery states, assign couriers, and notify customers."
        actionButton={{
          label: 'Refresh Ledger',
          onClick: fetchOrders,
          icon: (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-100 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-[var(--bb-plum)] text-white shadow-sm ring-1 ring-[var(--bb-gold)]/40'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Filters and Search form */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
            <input
              type="text"
              placeholder="Search by Order # (BB-2026-...), customer name, phone, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/50 py-2.5 pl-10 pr-4 text-xs font-medium focus:border-[var(--bb-plum)] focus:bg-white focus:outline-none"
            />
            <span className="absolute left-3.5 top-3 text-stone-400">🔍</span>
          </form>

          {/* Payment Filter */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="all">Payment: All</option>
            <option value="paid">Paid</option>
            <option value="pending">Payment Pending</option>
          </select>

          {/* Zone Filter */}
          <select
            value={zoneFilter}
            onChange={(e) => setZoneFilter(e.target.value)}
            className="w-full sm:w-auto rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 focus:outline-none"
          >
            <option value="all">Zone: Nationwide</option>
            <option value="dhaka">Dhaka (24h)</option>
            <option value="outside">Outside Dhaka (48h)</option>
          </select>

          <button
            onClick={fetchOrders}
            className="w-full sm:w-auto rounded-xl bg-stone-900 text-white px-4 py-2 text-xs font-bold hover:bg-stone-800 transition-colors"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-3 px-4 font-bold uppercase">Order #</th>
                <th className="py-3 px-4 font-bold uppercase">Placed</th>
                <th className="py-3 px-4 font-bold uppercase">Customer</th>
                <th className="py-3 px-4 font-bold uppercase">Destination</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Total (৳)</th>
                <th className="py-3 px-4 font-bold uppercase">Payment</th>
                <th className="py-3 px-4 font-bold uppercase">Status & Transition</th>
                <th className="py-3 px-4 font-bold uppercase">Courier Tracking</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-500 font-medium">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
                    Loading orders ledger...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-stone-400">
                    No orders match the specified criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Order Number */}
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                      #{order.orderNumber}
                    </td>

                    {/* Placed Date */}
                    <td className="py-3.5 px-4 text-stone-500 text-[11px]">
                      {new Date(order.createdAt).toLocaleDateString('en-BD', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900">{order.customerName}</p>
                      <p className="text-[11px] text-stone-500 font-mono">
                        {order.customerPhone}
                      </p>
                    </td>

                    {/* Destination */}
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-800">{order.district}</p>
                      <span className="inline-block rounded-full bg-stone-100 px-2 py-0.2 text-[10px] font-medium text-stone-600">
                        {order.deliveryZone === 'dhaka' ? 'Dhaka 24h' : 'Outside 48h'}
                      </span>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900 font-serif text-sm">
                      {formatPrice(order.totalAmount)}
                    </td>

                    {/* Payment */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-800">
                        {order.paymentMethod} &bull; {order.paymentStatus}
                      </span>
                    </td>

                    {/* Status with Quick Transition Dropdown */}
                    <td className="py-3.5 px-4">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleQuickStatusChange(order, e.target.value as any)
                        }
                        className={`rounded-lg border py-1 px-2 text-[11px] font-bold uppercase tracking-wider focus:outline-none ${getStatusBadge(
                          order.orderStatus
                        )}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    {/* Courier Tracking */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      {order.courierTrackingCode ? (
                        <span className="inline-flex rounded bg-stone-100 px-2 py-0.5 text-stone-700 font-bold">
                          {order.courierTrackingCode}
                        </span>
                      ) : (
                        <span className="text-stone-400 italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getWhatsAppLink(order)}
                          target="_blank"
                          rel="noreferrer"
                          title="WhatsApp Update"
                          className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          💬
                        </a>

                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3 py-1.5 text-xs font-semibold shadow-sm transition-all"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-12 text-center text-stone-500 font-medium">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
          Loading orders ledger...
        </div>
      }
    >
      <AdminOrdersContent />
    </React.Suspense>
  );
}

