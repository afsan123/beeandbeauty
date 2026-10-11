'use client';

import React, { useState } from 'react';
import { formatPrice } from '../../lib/formatters.ts';

export interface SalesTrendPoint {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface ExecutiveSalesAnalyticsProps {
  salesTrends: SalesTrendPoint[];
  totalRevenue: number;
  totalOrders: number;
  aov: number;
  basketSize: number;
  freeShippingPercent: number;
  digitalSettlementPercent: number;
}

export function ExecutiveSalesAnalytics({
  salesTrends = [],
  totalRevenue,
  totalOrders,
  aov,
  basketSize,
  freeShippingPercent,
  digitalSettlementPercent,
}: ExecutiveSalesAnalyticsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const maxRevenue = Math.max(...salesTrends.map((p) => p.revenue), 1000);
  const chartHeight = 160;

  return (
    <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-6">
      {/* Header with KPI Highlights */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold font-serif text-stone-900">
              Executive Sales & Fulfillment Velocity
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--bb-plum)] bg-[var(--bb-plum)]/10 px-2 py-0.5 rounded-full">
              7-Day Telemetry
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Real-time daily gross sales, transaction volume, and basket size metrics across Bangladesh.
          </p>
        </div>

        {/* Financial Highlights Pill Array */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3 py-1.5 text-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">AOV Benchmark</span>
            <span className="font-bold text-stone-900 font-serif">{formatPrice(aov)}</span>
          </div>

          <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3 py-1.5 text-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Units Per Order</span>
            <span className="font-bold text-stone-900">{basketSize || '1.0'} pcs</span>
          </div>

          <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3 py-1.5 text-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Free Shipping (৳2.5k+)</span>
            <span className="font-bold text-[#3E6351]">{freeShippingPercent}%</span>
          </div>

          <div className="rounded-xl bg-stone-50 border border-stone-200/70 px-3 py-1.5 text-stone-700">
            <span className="text-[10px] uppercase font-bold text-stone-400 block">Digital MFS (bKash/Nagad)</span>
            <span className="font-bold text-[var(--bb-plum)]">{digitalSettlementPercent}%</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Trend Visualizer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span>Daily Revenue Trend (৳ BDT)</span>
          <span>Max Benchmark: {formatPrice(maxRevenue)}</span>
        </div>

        <div className="relative pt-6 pb-2">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40">
            <div className="border-b border-dashed border-stone-200 w-full" />
            <div className="border-b border-dashed border-stone-200 w-full" />
            <div className="border-b border-dashed border-stone-200 w-full" />
          </div>

          {/* Bar & Stem Columns */}
          <div className="relative z-10 grid grid-cols-7 gap-2 sm:gap-4 items-end h-[160px] pt-4">
            {salesTrends.map((point, idx) => {
              const heightPercent = Math.max(
                point.revenue > 0 ? Math.round((point.revenue / maxRevenue) * 100) : 4,
                4
              );
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={point.date}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-stone-900 text-white text-[11px] font-semibold py-1 px-2.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap">
                      <div>{point.label}</div>
                      <div className="text-[var(--bb-gold)] font-bold">
                        {formatPrice(point.revenue)} ({point.orders} orders)
                      </div>
                    </div>
                  )}

                  {/* Visual Bar Column */}
                  <div className="w-full max-w-[48px] flex flex-col items-center justify-end h-full">
                    <div
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        point.revenue > 0
                          ? isHovered
                            ? 'bg-gradient-to-t from-[var(--bb-plum)] to-[var(--bb-magenta)] shadow-md'
                            : 'bg-gradient-to-t from-[var(--bb-plum)]/80 via-[var(--bb-plum)] to-[var(--bb-gold)]'
                          : 'bg-stone-100 hover:bg-stone-200'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>

                  {/* Day Label */}
                  <span className="text-[10px] font-semibold text-stone-500 mt-2 truncate w-full text-center">
                    {point.label.split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Empty state caption if launch state */}
        {totalOrders === 0 && (
          <div className="rounded-xl bg-amber-50/70 border border-amber-200/80 p-3 text-center text-xs text-amber-900 font-medium">
            🍯 <strong>Launch Ready State:</strong> The sales ledger is currently clear of test data. Live storefront orders will automatically stream and populate this telemetry graph in real time.
          </div>
        )}
      </div>
    </div>
  );
}
