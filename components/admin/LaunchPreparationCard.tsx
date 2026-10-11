'use client';

import React, { useState, useEffect } from 'react';

interface LaunchStats {
  categoriesCount: number;
  productsCount: number;
  bannersCount: number;
  offersCount: number;
  tutorialsCount: number;
  ordersCount: number;
  inquiriesCount: number;
}

interface LaunchReadinessData {
  isLaunchReady: boolean;
  stats: LaunchStats;
  targets: {
    categories: number;
    products: number;
    banners: number;
    offers: number;
    tutorials: number;
    maxOrders: number;
  };
  market: {
    currency: string;
    freeShippingThreshold: number;
    dhakaFee: number;
    outsideDhakaFee: number;
    helpline: string;
    officialEmail: string;
  };
}

interface LaunchPreparationCardProps {
  onRefreshParent?: () => void;
}

export function LaunchPreparationCard({ onRefreshParent }: LaunchPreparationCardProps) {
  const [data, setData] = useState<LaunchReadinessData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchReadiness = async () => {
    try {
      const res = await fetch('/api/admin/launch-setup');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.warn('Failed to fetch launch readiness', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const handleExecuteLaunchSetup = async () => {
    setIsExecuting(true);
    setStatusMessage(null);
    setShowConfirm(false);

    try {
      const res = await fetch('/api/admin/launch-setup', {
        method: 'POST',
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setIsSuccess(true);
        setStatusMessage(
          `✓ Launch synchronization completed! Purged ${result.summary.purgedOrdersCount} test orders. Active catalog: ${result.summary.productsCount} products, ${result.summary.categoriesCount} categories, ${result.summary.bannersCount} banners, ${result.summary.offersCount} offers, ${result.summary.tutorialsCount} masterclasses.`
        );
        await fetchReadiness();
        if (onRefreshParent) {
          onRefreshParent();
        }
      } else {
        setIsSuccess(false);
        setStatusMessage(result.error || 'Failed to complete launch setup synchronization.');
      }
    } catch (err: any) {
      setIsSuccess(false);
      setStatusMessage(err?.message || 'Network error executing launch setup.');
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[var(--bb-gold)]/30 bg-gradient-to-br from-[#6A1B6D]/5 via-white to-[#D4AF37]/5 p-6 animate-pulse">
        <div className="h-6 w-1/3 bg-stone-200 rounded mb-4" />
        <div className="h-4 w-1/2 bg-stone-200 rounded" />
      </div>
    );
  }

  const isReady = data?.isLaunchReady ?? false;
  const stats = data?.stats;

  return (
    <div className="rounded-2xl border border-[var(--bb-gold)]/40 bg-gradient-to-br from-[#FFF9F5] via-white to-[#FDF8F0] p-6 shadow-sm shadow-[#6A1B6D]/5 relative overflow-hidden">
      {/* Decorative Brand Background Glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-gradient-to-bl from-[var(--bb-gold)]/10 via-[var(--bb-magenta)]/5 to-transparent pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-stone-200/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--bb-plum)] to-[var(--bb-magenta)] text-white shadow-sm font-serif font-bold text-lg">
                🐝
              </span>
              <div>
                <h3 className="text-base font-bold text-[var(--bb-charcoal)] font-serif tracking-tight flex items-center gap-2">
                  Bee & Beauty Official Launch Center
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase ${
                      isReady
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                      }`}
                    />
                    {isReady ? 'Launch Ready' : 'Sync Required'}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">
                  Pre-launch verification suite: Bangladesh SLA compliance, zero dummy transactions, and authentic catalog curation.
                </p>
              </div>
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex items-center gap-3">
            {!showConfirm ? (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={isExecuting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--bb-plum)] via-[#7E1B81] to-[var(--bb-magenta)] text-white text-xs font-bold shadow-md shadow-[var(--bb-plum)]/20 hover:shadow-lg hover:from-[var(--bb-plum)] hover:to-[var(--bb-plum)] active:scale-95 transition-all disabled:opacity-50"
              >
                {isExecuting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Synchronizing Pre-Launch Catalog...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Reset & Apply Official Launch Catalog</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2 p-1.5 bg-amber-50 border border-amber-200 rounded-xl">
                <span className="text-[11px] font-medium text-amber-800 px-2">
                  Purge {stats?.ordersCount ?? 0} dummy orders & populate 24 launch items?
                </span>
                <button
                  type="button"
                  onClick={handleExecuteLaunchSetup}
                  className="px-3 py-1.5 bg-[var(--bb-plum)] text-white text-[11px] font-bold rounded-lg hover:bg-[var(--bb-magenta)] transition-colors"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="px-2.5 py-1.5 text-stone-600 text-[11px] font-medium hover:bg-stone-200/50 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status notification banner if recently executed */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium border flex items-start justify-between gap-3 ${
              isSuccess
                ? 'bg-emerald-50/90 text-emerald-900 border-emerald-200'
                : 'bg-rose-50/90 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-sm">{isSuccess ? '✅' : '⚠️'}</span>
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-stone-400 hover:text-stone-700 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Verification Matrix Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Categories */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Categories
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-serif text-[var(--bb-charcoal)]">
                {stats?.categoriesCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">/ 7 target</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">✓ Lips, Face, Eyes, Skin</p>
          </div>

          {/* Products */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Products
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-serif text-[var(--bb-charcoal)]">
                {stats?.productsCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">/ 24 target</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">✓ Full shade specs & BDT</p>
          </div>

          {/* Hero Banners */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Hero Banners
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-serif text-[var(--bb-charcoal)]">
                {stats?.bannersCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">/ 3 target</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">✓ Propolis & Eid glam</p>
          </div>

          {/* Limited Offers */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Limited Offers
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-serif text-[var(--bb-charcoal)]">
                {stats?.offersCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">/ 3 target</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">✓ FLASH20, GLOWBEE</p>
          </div>

          {/* Studio Tutorials */}
          <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Studio Classes
            </span>
            <div className="flex items-baseline justify-between">
              <span className="text-lg font-bold font-serif text-[var(--bb-charcoal)]">
                {stats?.tutorialsCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">/ 3 target</span>
            </div>
            <p className="text-[10px] text-emerald-700 font-medium">✓ Step-by-step masterclasses</p>
          </div>

          {/* Test Orders (Must be 0) */}
          <div
            className={`rounded-xl border p-3 space-y-1 ${
              (stats?.ordersCount ?? 0) === 0
                ? 'border-emerald-200 bg-emerald-50/50'
                : 'border-amber-300 bg-amber-50/50'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Test Orders
            </span>
            <div className="flex items-baseline justify-between">
              <span
                className={`text-lg font-bold font-serif ${
                  (stats?.ordersCount ?? 0) === 0 ? 'text-emerald-700' : 'text-amber-800'
                }`}
              >
                {stats?.ordersCount ?? 0}
              </span>
              <span className="text-[11px] font-semibold text-stone-400">0 required</span>
            </div>
            <p
              className={`text-[10px] font-medium ${
                (stats?.ordersCount ?? 0) === 0 ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {(stats?.ordersCount ?? 0) === 0 ? '✓ Clean CRM state' : '⚠ Purge required'}
            </p>
          </div>
        </div>

        {/* Market SLA Compliance Pill Matrix */}
        <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-stone-600 font-medium">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
            Market SLAs:
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            🇧🇩 Bangladesh Currency: <strong className="text-[var(--bb-charcoal)]">BDT (৳)</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            🚚 Free Shipping Threshold:{' '}
            <strong className="text-[var(--bb-charcoal)]">৳2,500</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            📍 Dhaka Delivery: <strong className="text-[var(--bb-charcoal)]">৳70 (24 hrs)</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            🗺️ Outside Dhaka: <strong className="text-[var(--bb-charcoal)]">৳130 (48 hrs)</strong>
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            📞 Official Helpline:{' '}
            <strong className="text-[var(--bb-charcoal)]">+8801754502430</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
