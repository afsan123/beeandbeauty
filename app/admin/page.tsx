'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation.js';
import { AdminHeader } from '../../components/admin/AdminHeader.tsx';
import { KPICard } from '../../components/admin/KPICard.tsx';
import { OrderDetailModal } from '../../components/admin/OrderDetailModal.tsx';
import type { StoredOrder } from '../../lib/services/orderService.ts';
import { formatPrice } from '../../lib/formatters.ts';

interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    pendingCount: number;
    processingCount: number;
    shippedCount: number;
    deliveredCount: number;
    cancelledCount: number;
    aov: number;
    paymentBreakdown: { cod: number; bkash: number; nagad: number };
    zoneBreakdown: { dhaka: number; outside: number };
  };
  recentOrders: StoredOrder[];
  recentInquiries: Array<{
    id: string;
    ticketNumber: string;
    fullName: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    status: 'new' | 'in_progress' | 'resolved';
    createdAt: string;
  }>;
  counts: {
    activeCoupons: number;
    totalReviews: number;
    totalSubscribers: number;
    openInquiries: number;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      if (!res.ok) {
        throw new Error('Failed to load dashboard metrics');
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOrderUpdated = (updated: StoredOrder) => {
    setSelectedOrder(updated);
    fetchDashboardData();
  };

  const getStatusBadge = (status: StoredOrder['orderStatus']) => {
    switch (status) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'shipped':
        return 'bg-blue-50 text-blue-800 border-blue-200/80';
      case 'processing':
        return 'bg-purple-50 text-purple-800 border-purple-200/80';
      case 'confirmed':
        return 'bg-amber-50 text-amber-800 border-amber-200/80';
      case 'pending':
        return 'bg-amber-100/70 text-amber-900 border-amber-300';
      case 'cancelled':
        return 'bg-rose-50 text-rose-800 border-rose-200/80';
      default:
        return 'bg-stone-100 text-stone-800 border-stone-200';
    }
  };

  const digitalSettlementCount = data
    ? data.metrics.paymentBreakdown.bkash + data.metrics.paymentBreakdown.nagad
    : 0;
  const digitalSettlementPercent =
    data && data.metrics.totalOrders > 0
      ? Math.round((digitalSettlementCount / data.metrics.totalOrders) * 100)
      : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Bar */}
      <AdminHeader
        title="Executive Operations Control"
        subtitle="Real-time orders, revenue settlement, and fulfillment telemetry across Bangladesh."
        actionButton={{
          label: 'Refresh Analytics',
          onClick: fetchDashboardData,
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

      {isLoading && !data ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent" />
            <p className="text-xs font-semibold text-stone-500">
              Aggregating live operational telemetry...
            </p>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Top 4 Hero Financial & Operational KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <KPICard
              title="Gross Revenue"
              value={formatPrice(data.metrics.totalRevenue)}
              subtitle="All lifetime valid orders"
              trend="৳ BDT Settled"
              trendType="positive"
              accentColor="gold"
              icon={<span className="text-xl font-bold font-serif">৳</span>}
            />

            <KPICard
              title="Total Orders"
              value={data.metrics.totalOrders}
              subtitle={`${data.metrics.deliveredCount} delivered • ${data.metrics.cancelledCount} cancelled`}
              trend="Fulfillment Volume"
              trendType="neutral"
              accentColor="plum"
              actionLabel="View all"
              onAction={() => router.push('/admin/orders')}
              icon={<span className="text-xl">📦</span>}
            />

            <KPICard
              title="Pending Dispatch"
              value={data.metrics.pendingCount + data.metrics.processingCount}
              subtitle="Inside & Outside Dhaka couriers"
              trend={
                data.metrics.pendingCount + data.metrics.processingCount > 0
                  ? 'Action Required'
                  : 'All Cleared'
              }
              trendType={
                data.metrics.pendingCount + data.metrics.processingCount > 0
                  ? 'warning'
                  : 'positive'
              }
              accentColor="magenta"
              actionLabel="Dispatch"
              onAction={() => router.push('/admin/orders?status=pending')}
              icon={<span className="text-xl">⚡</span>}
            />

            <KPICard
              title="Average Order Value"
              value={formatPrice(data.metrics.aov)}
              subtitle="Basket size benchmark"
              trend="Store Benchmark"
              trendType="positive"
              accentColor="sage"
              actionLabel="Analyze"
              onAction={() => router.push('/admin/orders')}
              icon={<span className="text-xl">🛍️</span>}
            />
          </div>

          {/* Operational Command Strip: Customer Care & Voucher Engines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Customer Support Desk */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 lg:p-6 shadow-xs border border-stone-200/80 hover:border-[var(--bb-gold)]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--bb-blush)] text-[var(--bb-plum)] ring-1 ring-[var(--bb-plum)]/20 shadow-xs">
                    <span className="text-xl">💬</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-stone-900">
                      Customer Care & Consultation Desk
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Customer inquiries, shade recommendations, and delivery order support
                    </p>
                  </div>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
                    data.counts.openInquiries > 0
                      ? 'bg-amber-50 text-amber-900 border-amber-200'
                      : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  }`}
                >
                  {data.counts.openInquiries > 0
                    ? `${data.counts.openInquiries} Unresolved`
                    : 'All Cleared'}
                </span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-stone-600">
                  <div>
                    <span className="font-bold text-stone-900">{data.counts.openInquiries}</span> Open Tickets
                  </div>
                  <span className="text-stone-300">•</span>
                  <div>
                    <span className="font-bold text-stone-900">2h</span> SLA Target
                  </div>
                  <span className="text-stone-300">•</span>
                  <div>
                    <span className="font-bold text-stone-900">{data.counts.totalReviews}</span> Reviews
                  </div>
                </div>

                <Link
                  href="/admin/inquiries"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <span>Open Desk</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* Campaign Promos & Vouchers Engine */}
            <div className="relative overflow-hidden rounded-2xl bg-white p-5 lg:p-6 shadow-xs border border-stone-200/80 hover:border-[var(--bb-gold)]/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-900 ring-1 ring-[var(--bb-gold)]/40 shadow-xs">
                    <span className="text-xl">🎟️</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold font-serif text-stone-900">
                      Promotions & Campaign Vouchers
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Live discount codes, influencer campaigns, and free delivery thresholds
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">
                  {data.counts.activeCoupons} Live Codes
                </span>
              </div>

              <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-stone-600">
                  <div>
                    <span className="font-bold text-stone-900">{data.counts.activeCoupons}</span> Active Promos
                  </div>
                  <span className="text-stone-300">•</span>
                  <div>
                    <span className="font-bold text-stone-900">৳2,500</span> Free Ship
                  </div>
                  <span className="text-stone-300">•</span>
                  <div>
                    <span className="font-bold text-stone-900">{data.counts.totalSubscribers}</span> VIP Club
                  </div>
                </div>

                <Link
                  href="/admin/coupons"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-[var(--bb-plum)] text-white px-3.5 py-2 text-xs font-semibold shadow-xs transition-colors shrink-0"
                >
                  <span>Manage Coupons</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Visual Analytics & Breakdown: 3 Equal-Height Landscape Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Payment Settlement Mix */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between h-full hover:border-[var(--bb-gold)]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold font-serif text-stone-900">
                    Payment Settlement Mix
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Total {data.metrics.totalOrders} Orders
                  </span>
                </div>

                <div className="space-y-3.5">
                  {/* COD */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                      <span>Cash on Delivery (COD)</span>
                      <span>
                        {data.metrics.paymentBreakdown.cod} orders (
                        {data.metrics.totalOrders > 0
                          ? Math.round(
                              (data.metrics.paymentBreakdown.cod / data.metrics.totalOrders) * 100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.metrics.totalOrders > 0
                              ? (data.metrics.paymentBreakdown.cod / data.metrics.totalOrders) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* bKash */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                      <span className="text-[#D12053] font-bold">bKash Mobile Wallet</span>
                      <span>
                        {data.metrics.paymentBreakdown.bkash} orders (
                        {data.metrics.totalOrders > 0
                          ? Math.round(
                              (data.metrics.paymentBreakdown.bkash / data.metrics.totalOrders) * 100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-[#D12053] rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.metrics.totalOrders > 0
                              ? (data.metrics.paymentBreakdown.bkash / data.metrics.totalOrders) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Nagad */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-stone-700 mb-1">
                      <span className="text-[#F26522] font-bold">Nagad Mobile Wallet</span>
                      <span>
                        {data.metrics.paymentBreakdown.nagad} orders (
                        {data.metrics.totalOrders > 0
                          ? Math.round(
                              (data.metrics.paymentBreakdown.nagad / data.metrics.totalOrders) * 100
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full bg-[#F26522] rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            data.metrics.totalOrders > 0
                              ? (data.metrics.paymentBreakdown.nagad / data.metrics.totalOrders) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>🔒 Tokenized instant settlement</span>
                <span className="font-semibold text-stone-800">
                  {digitalSettlementPercent}% Prepayments
                </span>
              </div>
            </div>

            {/* Delivery Zone Logistics Distribution */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between h-full hover:border-[var(--bb-gold)]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold font-serif text-stone-900">
                    Logistics & SLA Zones
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Steadfast & Pathao
                  </span>
                </div>

                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="rounded-xl border border-[#3E6351]/20 bg-[#3E6351]/5 p-3.5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6351]">
                        Dhaka (24h SLA)
                      </span>
                      <p className="text-2xl font-bold font-serif text-[#2B473A]">
                        {data.metrics.zoneBreakdown.dhaka}
                      </p>
                      <p className="text-[11px] text-[#3E6351] font-medium">৳70 Standard Fee</p>
                    </div>

                    <div className="rounded-xl border border-[var(--bb-plum)]/20 bg-[var(--bb-plum)]/5 p-3.5 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bb-plum)]">
                        Outside (48h SLA)
                      </span>
                      <p className="text-2xl font-bold font-serif text-[var(--bb-plum)]">
                        {data.metrics.zoneBreakdown.outside}
                      </p>
                      <p className="text-[11px] text-[var(--bb-plum)] font-medium">৳130 Courier Fee</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-200/80 text-xs text-amber-900 flex items-center gap-2">
                    <span className="text-base">✨</span>
                    <span>
                      <strong className="font-semibold">Free Delivery:</strong> Orders ৳2,500+ nationwide
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>🚚 Daily dispatch cut-off: 4:00 PM</span>
                <span className="font-semibold text-[#3E6351]">Dhaka Hub</span>
              </div>
            </div>

            {/* Quick Operational Actions */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between h-full hover:border-[var(--bb-gold)]/60 transition-all duration-200">
              <div>
                <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold font-serif text-stone-900">
                    Executive Quick Actions
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Command Hub
                  </span>
                </div>

                <div className="space-y-2">
                  <Link
                    href="/admin/orders"
                    className="flex items-center justify-between rounded-xl border border-stone-200/80 p-2.5 text-xs font-semibold text-stone-800 hover:border-[var(--bb-gold)] hover:bg-[var(--bb-ivory)] transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bb-plum)]/10 text-[var(--bb-plum)]">
                        📦
                      </span>
                      <span>Order Fulfillment Ledger</span>
                    </span>
                    <span className="text-stone-400 group-hover:text-[var(--bb-plum)] group-hover:translate-x-0.5 transition-all">
                      &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/products"
                    className="flex items-center justify-between rounded-xl border border-stone-200/80 p-2.5 text-xs font-semibold text-stone-800 hover:border-[var(--bb-gold)] hover:bg-[var(--bb-ivory)] transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bb-plum)]/10 text-[var(--bb-plum)]">
                        💄
                      </span>
                      <span>Catalog Stock & Shades</span>
                    </span>
                    <span className="text-stone-400 group-hover:text-[var(--bb-plum)] group-hover:translate-x-0.5 transition-all">
                      &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/coupons"
                    className="flex items-center justify-between rounded-xl border border-stone-200/80 p-2.5 text-xs font-semibold text-stone-800 hover:border-[var(--bb-gold)] hover:bg-[var(--bb-ivory)] transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bb-plum)]/10 text-[var(--bb-plum)]">
                        🎟️
                      </span>
                      <span>Campaign Voucher Codes</span>
                    </span>
                    <span className="text-stone-400 group-hover:text-[var(--bb-plum)] group-hover:translate-x-0.5 transition-all">
                      &rarr;
                    </span>
                  </Link>

                  <Link
                    href="/admin/subscribers"
                    className="flex items-center justify-between rounded-xl border border-stone-200/80 p-2.5 text-xs font-semibold text-stone-800 hover:border-[var(--bb-gold)] hover:bg-[var(--bb-ivory)] transition-all group"
                  >
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--bb-plum)]/10 text-[var(--bb-plum)]">
                        💌
                      </span>
                      <span>VIP Subscribers Export ({data.counts.totalSubscribers})</span>
                    </span>
                    <span className="text-stone-400 group-hover:text-[var(--bb-plum)] group-hover:translate-x-0.5 transition-all">
                      &rarr;
                    </span>
                  </Link>
                </div>
              </div>

              <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                <span>⚡ Real-time Supabase sync</span>
                <span className="font-semibold text-[var(--bb-plum)]">RBAC Admin</span>
              </div>
            </div>
          </div>

          {/* Recent Orders Ledger Table */}
          <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
            <div className="flex items-center justify-between border-b border-stone-200/80 bg-[var(--bb-ivory)] px-6 py-4">
              <div>
                <h3 className="text-base font-bold font-serif text-stone-900">
                  Recent Orders Stream
                </h3>
                <p className="text-xs text-stone-500">
                  Latest customer orders placed via storefront
                </p>
              </div>
              <Link
                href="/admin/orders"
                className="text-xs font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] transition-colors inline-flex items-center gap-1 group"
              >
                <span>View Complete Order Ledger ({data.metrics.totalOrders})</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500">
                  <tr>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Order #</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Customer</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Destination</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Amount (৳)</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Payment</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Status</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider">Courier</th>
                    <th className="py-3 px-4 font-bold uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        No orders recorded yet. Placed orders will stream here in real time.
                      </td>
                    </tr>
                  ) : (
                    data.recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-stone-900">
                          #{order.orderNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-stone-900">{order.customerName}</p>
                          <p className="text-[11px] text-stone-500">{order.customerPhone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-stone-800">{order.district}</p>
                          <span className="text-[10px] text-stone-500">
                            {order.deliveryZone === 'dhaka' ? 'Dhaka 24h' : 'Outside 48h'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex rounded-lg bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                            {order.paymentMethod} &bull; {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getStatusBadge(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-stone-600">
                          {order.courierTrackingCode || (
                            <span className="text-stone-400 italic">Unassigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}

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
