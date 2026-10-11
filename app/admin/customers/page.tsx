'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import { CustomerDetailModal } from '../../../components/admin/CustomerDetailModal.tsx';
import { OrderDetailModal } from '../../../components/admin/OrderDetailModal.tsx';
import type { CustomerProfile } from '../../../lib/services/customerService.ts';
import type { StoredOrder } from '../../../lib/services/orderService.ts';
import { formatPrice } from '../../../lib/formatters.ts';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<StoredOrder | null>(null);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (tierFilter !== 'all') params.set('tier', tierFilter);

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load customers');
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading customer ledger.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers();
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

  const totalRevenueFromCustomers = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const vipCount = customers.filter((c) => c.tier === 'VIP Client').length;

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        title="Customer Profiles & Relationship Management"
        subtitle="Track customer purchase history, lifetime order values (LTV), repeat retention, and VIP client profiles."
        actionButton={{
          label: 'Refresh Customers',
          onClick: fetchCustomers,
          icon: <span>↺</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
            Total Customers
          </p>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-1">
            {customers.length}
          </p>
          <p className="text-xs text-stone-500 mt-0.5">Aggregated unique buyers</p>
        </div>

        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
            VIP Clients (৳5,000+)
          </p>
          <p className="text-2xl font-bold font-serif text-amber-900 mt-1">
            {vipCount}
          </p>
          <p className="text-xs text-amber-700 mt-0.5">High-frequency patrons</p>
        </div>

        <div className="rounded-2xl border border-purple-200/80 bg-purple-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-800">
            Repeat Retention
          </p>
          <p className="text-2xl font-bold font-serif text-purple-900 mt-1">
            {customers.filter((c) => c.totalOrders >= 2).length}
          </p>
          <p className="text-xs text-purple-700 mt-0.5">Placed multiple orders</p>
        </div>

        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-xs">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            Customer LTV Revenue
          </p>
          <p className="text-2xl font-bold font-serif text-emerald-900 mt-1">
            {formatPrice(totalRevenueFromCustomers)}
          </p>
          <p className="text-xs text-emerald-700 mt-0.5">Total lifetime spend</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs">
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {['all', 'vip', 'repeat', 'new'].map((tier) => (
            <button
              key={tier}
              onClick={() => setTierFilter(tier)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                tierFilter === tier
                  ? 'bg-[var(--bb-plum)] text-white shadow-xs'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
              }`}
            >
              {tier === 'all'
                ? 'All Customers'
                : tier === 'vip'
                ? 'VIP Clients'
                : tier === 'repeat'
                ? 'Repeat Buyers'
                : 'New Buyers'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <input
            type="text"
            placeholder="Search by phone, email, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-9 pr-3 py-1.5 text-xs focus:border-[var(--bb-plum)] outline-none"
          />
          <span className="absolute left-3 top-2 text-stone-400 text-xs">🔍</span>
        </form>
      </div>

      {/* Customers Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/80 border-b border-stone-200/80 text-stone-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Primary District</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4 text-right">Lifetime Spend (৳)</th>
                <th className="py-3 px-4">Tier Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    Aggregating customer history profiles...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    No customers found matching criteria.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-stone-100 border border-stone-200 text-stone-700 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                          {c.name ? c.name.slice(0, 2).toUpperCase() : 'CU'}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 font-serif text-sm">
                            {c.name}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Last order: {new Date(c.lastOrderDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <p className="font-bold text-stone-900">{c.phone}</p>
                      <p className="text-[11px] text-stone-500">{c.email}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-800">{c.district}</p>
                      <span className="text-[10px] text-stone-400 uppercase">
                        {c.deliveryZone === 'dhaka' ? 'Dhaka 24h SLA' : 'Outside 48h SLA'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-bold text-stone-800">
                        {c.totalOrders}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                      {formatPrice(c.totalSpent)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${getTierBadge(
                          c.tier
                        )}`}
                      >
                        {c.tier}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                      >
                        View History &rarr;
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer Modal */}
      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={Boolean(selectedCustomer)}
        onClose={() => setSelectedCustomer(null)}
        onInspectOrder={(order) => setSelectedOrder(order)}
        onCustomerUpdated={(updated) => {
          setSelectedCustomer(updated);
          setCustomers((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }}
      />

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={() => {
          fetchCustomers();
        }}
      />
    </div>
  );
}
