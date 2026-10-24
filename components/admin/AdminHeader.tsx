'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAdminUI } from './AdminUIContext.tsx';
import { isOrderSoundMuted, setOrderSoundMuted } from '../../lib/services/realtimeOrders.ts';

interface AdminHeaderProps {
  onToggleSidebar?: () => void;
  title: string;
  subtitle?: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryActionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function AdminHeader({
  onToggleSidebar,
  title,
  subtitle,
  actionButton,
  secondaryActionButton,
}: AdminHeaderProps) {
  const { toggleSidebar } = useAdminUI();
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isOrderSoundMuted());
  }, []);

  const handleToggleSound = () => {
    const next = !muted;
    setMuted(next);
    setOrderSoundMuted(next);
  };

  const handleToggle = () => {
    if (onToggleSidebar) onToggleSidebar();
    toggleSidebar();
  };

  return (
    <header className="sticky top-0 z-30 flex min-h-16 py-3.5 items-center justify-between border-b border-stone-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-md rounded-2xl shadow-xs mb-6 sm:mb-8">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {/* Mobile menu toggle */}
        <button
          onClick={handleToggle}
          className="rounded-xl border border-stone-200 p-2 text-stone-600 hover:bg-stone-50 hover:text-stone-900 lg:hidden shrink-0"
          aria-label="Toggle navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-2xl font-bold tracking-tight text-stone-900 font-serif truncate">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden md:block text-xs text-stone-500 font-sans mt-0.5 truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Realtime Live Sync Status */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span className="hidden sm:inline">Live Sync Active</span>
          <span className="sm:hidden">Live</span>
        </div>

        {/* Audio Alert Chime Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          title={muted ? 'Order Chimes Muted (Click to Unmute)' : 'Order Chimes Active (Click to Mute)'}
          className={`flex items-center justify-center h-8 w-8 rounded-full border transition-all ${
            muted
              ? 'border-stone-200 bg-stone-100 text-stone-400 hover:text-stone-700'
              : 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-2xs'
          }`}
          aria-label={muted ? 'Unmute order audio alert' : 'Mute order audio alert'}
        >
          <span className="text-xs">{muted ? '🔇' : '🔔'}</span>
        </button>

        {/* Currency BDT Tag */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
          <span>৳ BDT</span>
        </div>

        {/* Secondary Action Button (e.g. Bulk Upload) */}
        {secondaryActionButton && (
          <button
            onClick={secondaryActionButton.onClick}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-stone-200 bg-white hover:border-[var(--bb-plum)] hover:text-[var(--bb-plum)] hover:bg-[var(--bb-ivory)] text-stone-700 p-2.5 sm:px-4 sm:py-2.5 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all"
            title={secondaryActionButton.label}
          >
            {secondaryActionButton.icon}
            <span className="hidden sm:inline">{secondaryActionButton.label}</span>
          </button>
        )}

        {/* Action Button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white p-2.5 sm:px-4 sm:py-2.5 text-xs font-semibold shadow-xs hover:shadow transition-all"
            title={actionButton.label}
          >
            {actionButton.icon}
            <span className="hidden sm:inline">{actionButton.label}</span>
          </button>
        )}

        {/* Live Storefront Icon Button */}
        <Link
          href="/"
          target="_blank"
          title="Open Public Storefront"
          className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-stone-200 text-stone-600 hover:border-[var(--bb-gold)] hover:text-[var(--bb-plum)] hover:bg-[var(--bb-ivory)] transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </Link>
      </div>
    </header>
  );
}
