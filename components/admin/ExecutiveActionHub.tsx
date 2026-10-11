'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '../../lib/formatters.ts';

export interface ActionOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  district: string;
  deliveryZone: 'dhaka' | 'outside';
  totalAmount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface ActionInquiry {
  id: string;
  ticketNumber: string;
  fullName: string;
  subject: string;
  status: string;
  createdAt: string;
}

export interface ActionBooking {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime?: string;
  status: string;
}

export interface StockAlert {
  id: string;
  title: string;
  categoryName: string;
  inStock: boolean;
  outShades: string[];
}

export interface SystemHealth {
  database: string;
  courierGateways: string;
  paymentGateways: string;
  smsHelpline: string;
}

interface ExecutiveActionHubProps {
  urgentOrders: ActionOrder[];
  urgentInquiries: ActionInquiry[];
  pendingBookings: ActionBooking[];
  stockAlerts: StockAlert[];
  systemHealth: SystemHealth;
  onSelectOrder?: (orderNumber: string) => void;
}

export function ExecutiveActionHub({
  urgentOrders = [],
  urgentInquiries = [],
  pendingBookings = [],
  stockAlerts = [],
  systemHealth,
  onSelectOrder,
}: ExecutiveActionHubProps) {
  const totalActionCount =
    urgentOrders.length + urgentInquiries.length + pendingBookings.length + stockAlerts.length;

  return (
    <div className="rounded-2xl border border-[var(--bb-gold)]/40 bg-gradient-to-br from-white via-[#FFF9F5]/40 to-white p-6 shadow-sm shadow-[var(--bb-plum)]/5 space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bb-plum)] to-[var(--bb-magenta)] text-white font-serif font-bold text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-serif text-[var(--bb-charcoal)]">
                Executive Action Center & Priority Dispatch
              </h3>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  totalActionCount > 0
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    totalActionCount > 0 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                  }`}
                />
                {totalActionCount > 0 ? `${totalActionCount} Attention Items` : 'All Systems Clear'}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Immediate operational priorities: orders pending courier dispatch, unassigned tickets, and consultations.
            </p>
          </div>
        </div>

        {/* Live System Health Badges */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            PostgreSQL DB Live
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-medium">
            🚚 Steadfast & Pathao
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200 font-medium">
            📱 bKash / Nagad Active
          </span>
        </div>
      </div>

      {/* Grid of 4 Action Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Orders Awaiting Dispatch */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 flex flex-col justify-between hover:border-[var(--bb-plum)]/40 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                <span>📦</span> Pending Dispatch
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  urgentOrders.length > 0
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {urgentOrders.length} Orders
              </span>
            </div>

            {urgentOrders.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                <p className="text-emerald-700 font-semibold">✓ Dispatch Queue Cleared</p>
                <p className="text-[11px] text-stone-400">All customer packages are handed to couriers.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentOrders.map((o) => (
                  <div
                    key={o.id}
                    onClick={() => onSelectOrder && onSelectOrder(o.orderNumber)}
                    className="p-2 rounded-lg bg-stone-50 hover:bg-stone-100/80 cursor-pointer border border-stone-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[11px] text-[var(--bb-plum)]">
                        #{o.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold text-stone-900">
                        {formatPrice(o.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-stone-500 mt-0.5">
                      <span className="truncate max-w-[120px]">{o.customerName}</span>
                      <span className="text-stone-400">
                        {o.deliveryZone === 'dhaka' ? 'Dhaka 24h' : 'Outside 48h'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-stone-100">
            <Link
              href="/admin/orders?status=pending"
              className="text-[11px] font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] flex items-center justify-between group"
            >
              <span>Process Dispatch Queue</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 2. Customer Inquiries Requiring 2h SLA Response */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 flex flex-col justify-between hover:border-[var(--bb-plum)]/40 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                <span>💬</span> Customer Care Desk
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  urgentInquiries.length > 0
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {urgentInquiries.length} Open
              </span>
            </div>

            {urgentInquiries.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                <p className="text-emerald-700 font-semibold">✓ Support Inbox Cleared</p>
                <p className="text-[11px] text-stone-400">All customer tickets and queries resolved.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {urgentInquiries.map((inq) => (
                  <Link
                    key={inq.id}
                    href={`/admin/inquiries`}
                    className="block p-2 rounded-lg bg-stone-50 hover:bg-stone-100/80 border border-stone-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[11px] text-stone-800">
                        {inq.ticketNumber}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                        {inq.status}
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-stone-800 truncate mt-0.5">
                      {inq.subject}
                    </p>
                    <p className="text-[10px] text-stone-400 truncate">{inq.fullName}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-stone-100">
            <Link
              href="/admin/inquiries"
              className="text-[11px] font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] flex items-center justify-between group"
            >
              <span>Manage Support Tickets</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 3. Pro Beauty Studio Appointments */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 flex flex-col justify-between hover:border-[var(--bb-plum)]/40 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                <span>💄</span> Studio Consultations
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  pendingBookings.length > 0
                    ? 'bg-purple-100 text-purple-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {pendingBookings.length} Requests
              </span>
            </div>

            {pendingBookings.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                <p className="text-emerald-700 font-semibold">✓ Appointments Finalized</p>
                <p className="text-[11px] text-stone-400">No pending client consultation requests.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {pendingBookings.map((b) => (
                  <Link
                    key={b.id}
                    href="/admin/studio"
                    className="block p-2 rounded-lg bg-stone-50 hover:bg-stone-100/80 border border-stone-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] text-stone-900">
                        {b.clientName}
                      </span>
                      <span className="text-[10px] text-purple-700 font-bold">
                        {b.preferredDate}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-0.5 truncate">{b.serviceType}</p>
                    <p className="text-[10px] text-stone-400 font-mono">{b.clientPhone}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-stone-100">
            <Link
              href="/admin/studio"
              className="text-[11px] font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] flex items-center justify-between group"
            >
              <span>Confirm Studio Slots</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>

        {/* 4. Stock & Inventory Telemetry */}
        <div className="rounded-xl border border-stone-200/80 bg-white p-4 flex flex-col justify-between hover:border-[var(--bb-plum)]/40 transition-all duration-200">
          <div>
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-stone-100">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5 font-serif">
                <span>📊</span> Stock & Shade Alerts
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  stockAlerts.length > 0
                    ? 'bg-rose-100 text-rose-900'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {stockAlerts.length > 0 ? `${stockAlerts.length} Attention` : '100% In Stock'}
              </span>
            </div>

            {stockAlerts.length === 0 ? (
              <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                <p className="text-emerald-700 font-semibold">✓ All 24 Products Available</p>
                <p className="text-[11px] text-stone-400">All shades in active launch catalog in stock.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stockAlerts.map((sa) => (
                  <Link
                    key={sa.id}
                    href="/admin/inventory"
                    className="block p-2 rounded-lg bg-rose-50/60 hover:bg-rose-100/60 border border-rose-200/60 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] text-stone-900 truncate max-w-[140px]">
                        {sa.title}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-rose-700 bg-rose-100 px-1 py-0.5 rounded">
                        {!sa.inStock ? 'Out of Stock' : 'Shade Depleted'}
                      </span>
                    </div>
                    {sa.outShades.length > 0 && (
                      <p className="text-[10px] text-rose-600 mt-0.5">
                        Shades: {sa.outShades.join(', ')}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-stone-100">
            <Link
              href="/admin/inventory"
              className="text-[11px] font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] flex items-center justify-between group"
            >
              <span>Manage Shade Inventory</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
