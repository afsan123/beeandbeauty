'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '../../lib/formatters.ts';

export interface CustomerIntelligence {
  totalCustomers: number;
  repeatCustomers: number;
  repeatRate: number;
  vipCustomers: number;
  averageLtv: number;
  totalSubscribers: number;
}

export interface FulfillmentPipeline {
  pendingCount: number;
  processingCount: number;
  shippedCount: number;
  deliveredCount: number;
  cancelledCount: number;
  slaInsideDhaka: string;
  slaOutsideDhaka: string;
}

interface ExecutiveCustomerLogisticsHubProps {
  customerIntelligence: CustomerIntelligence;
  fulfillmentPipeline: FulfillmentPipeline;
  zoneBreakdown: { dhaka: number; outside: number };
  paymentBreakdown: { cod: number; bkash: number; nagad: number };
  totalOrders: number;
  freeShippingCount: number;
  freeShippingPercent: number;
}

export function ExecutiveCustomerLogisticsHub({
  customerIntelligence,
  fulfillmentPipeline,
  zoneBreakdown,
  paymentBreakdown,
  totalOrders,
  freeShippingCount,
  freeShippingPercent,
}: ExecutiveCustomerLogisticsHubProps) {
  const digitalSettlementCount = paymentBreakdown.bkash + paymentBreakdown.nagad;
  const digitalSettlementPercent =
    totalOrders > 0 ? Math.round((digitalSettlementCount / totalOrders) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Logistics, Courier Hub & SLA Compliance */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[var(--bb-gold)]/60 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif text-stone-900">
                  Logistics & Fulfillment Funnel
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6351] bg-[#3E6351]/10 px-2 py-0.5 rounded-full">
                  Steadfast & Pathao
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Couriers SLA routing, Dhaka 24h & nationwide 48h dispatch operations.
              </p>
            </div>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Fulfillment</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* Fulfillment Pipeline 4-Stage Pill Strip */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            <div className="rounded-xl bg-amber-50/80 border border-amber-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-amber-800 block">Confirmed</span>
              <span className="text-lg font-bold font-serif text-amber-950">
                {fulfillmentPipeline.pendingCount}
              </span>
            </div>

            <div className="rounded-xl bg-purple-50/80 border border-purple-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-purple-800 block">Processing</span>
              <span className="text-lg font-bold font-serif text-purple-950">
                {fulfillmentPipeline.processingCount}
              </span>
            </div>

            <div className="rounded-xl bg-blue-50/80 border border-blue-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-blue-800 block">Shipped</span>
              <span className="text-lg font-bold font-serif text-blue-950">
                {fulfillmentPipeline.shippedCount}
              </span>
            </div>

            <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/80 p-2.5 text-center">
              <span className="text-[10px] font-bold uppercase text-emerald-800 block">Delivered</span>
              <span className="text-lg font-bold font-serif text-emerald-950">
                {fulfillmentPipeline.deliveredCount}
              </span>
            </div>
          </div>

          {/* Geographic Breakdown (Dhaka vs Outside) */}
          <div className="grid grid-cols-2 gap-3.5 mb-4">
            <div className="rounded-xl border border-[#3E6351]/20 bg-[#3E6351]/5 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#3E6351]">
                  Inside Dhaka (24h)
                </span>
                <span className="text-xs font-semibold text-[#3E6351]">৳70</span>
              </div>
              <p className="text-xl font-bold font-serif text-[#2B473A]">
                {zoneBreakdown.dhaka} Orders
              </p>
              <p className="text-[10px] text-[#3E6351]/80">Express doorstep courier SLA</p>
            </div>

            <div className="rounded-xl border border-[var(--bb-plum)]/20 bg-[var(--bb-plum)]/5 p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bb-plum)]">
                  Outside Dhaka (48h)
                </span>
                <span className="text-xs font-semibold text-[var(--bb-plum)]">৳130</span>
              </div>
              <p className="text-xl font-bold font-serif text-[var(--bb-plum)]">
                {zoneBreakdown.outside} Orders
              </p>
              <p className="text-[10px] text-[var(--bb-plum)]/80">District hub transit SLA</p>
            </div>
          </div>

          {/* Free Shipping Badge */}
          <div className="rounded-xl bg-[var(--bb-ivory)] border border-[var(--bb-gold)]/30 p-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">🚚</span>
              <div>
                <strong className="text-stone-900">Free Delivery Tier:</strong>
                <span className="text-stone-600 ml-1">Orders ৳2,500+ nationwide</span>
              </div>
            </div>
            <span className="font-bold text-[#3E6351] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {freeShippingPercent}% of volume
            </span>
          </div>
        </div>

        <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
          <span>⏰ Daily dispatch cut-off: 4:00 PM</span>
          <span className="font-semibold text-stone-800">Dhaka Central Hub</span>
        </div>
      </div>

      {/* 2. Customer Intelligence & CRM Health */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between hover:border-[var(--bb-gold)]/60 transition-all duration-200">
        <div>
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-serif text-stone-900">
                  Customer Intelligence & Lifetime Value
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bb-magenta)] bg-[var(--bb-magenta)]/10 px-2 py-0.5 rounded-full">
                  CRM Telemetry
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Client retention, VIP tier engagement, and digital settlement mix.
              </p>
            </div>
            <Link
              href="/admin/customers"
              className="text-xs font-bold text-[var(--bb-plum)] hover:text-[var(--bb-magenta)] transition-colors inline-flex items-center gap-1 group"
            >
              <span>Customers</span>
              <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
            </Link>
          </div>

          {/* CRM Metric Badges */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="rounded-xl bg-stone-50 border border-stone-200/60 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Profiles</span>
              <span className="text-xl font-bold font-serif text-stone-900">
                {customerIntelligence.totalCustomers}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">Unique buyers</span>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200/60 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">Repeat Rate</span>
              <span className="text-xl font-bold font-serif text-[#3E6351]">
                {customerIntelligence.repeatRate}%
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">
                {customerIntelligence.repeatCustomers} repeat
              </span>
            </div>

            <div className="rounded-xl bg-stone-50 border border-stone-200/60 p-3 text-center">
              <span className="text-[10px] font-bold uppercase text-stone-400 block">VIP Clients</span>
              <span className="text-xl font-bold font-serif text-[var(--bb-plum)]">
                {customerIntelligence.vipCustomers}
              </span>
              <span className="text-[10px] text-stone-500 block mt-0.5">৳5k+ spend</span>
            </div>
          </div>

          {/* Payment Method Settlement Breakdown */}
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-stone-800">Settlement Method Split</span>
              <span className="text-stone-500">{totalOrders} Total Orders</span>
            </div>

            {/* bKash */}
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-pink-50/50 border border-pink-200/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#D12053]">bKash MFS</span>
                <span className="text-[10px] text-stone-500">Direct wallet token</span>
              </div>
              <span className="font-bold text-stone-900">
                {paymentBreakdown.bkash} ({totalOrders > 0 ? Math.round((paymentBreakdown.bkash / totalOrders) * 100) : 0}%)
              </span>
            </div>

            {/* Nagad */}
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-orange-50/50 border border-orange-200/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#F26522]">Nagad MFS</span>
                <span className="text-[10px] text-stone-500">Instant merchant settlement</span>
              </div>
              <span className="font-bold text-stone-900">
                {paymentBreakdown.nagad} ({totalOrders > 0 ? Math.round((paymentBreakdown.nagad / totalOrders) * 100) : 0}%)
              </span>
            </div>

            {/* Cash on Delivery */}
            <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-stone-50 border border-stone-200/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-700">Cash on Delivery (COD)</span>
                <span className="text-[10px] text-stone-500">Courier doorstep collection</span>
              </div>
              <span className="font-bold text-stone-900">
                {paymentBreakdown.cod} ({totalOrders > 0 ? Math.round((paymentBreakdown.cod / totalOrders) * 100) : 0}%)
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3.5 mt-4 border-t border-stone-100 flex items-center justify-between text-xs">
          <span className="text-stone-500">
            VIP Club: <strong>{customerIntelligence.totalSubscribers} subscribers</strong>
          </span>
          <Link
            href="/admin/subscribers"
            className="font-bold text-[var(--bb-plum)] hover:underline"
          >
            Export VIP List &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
