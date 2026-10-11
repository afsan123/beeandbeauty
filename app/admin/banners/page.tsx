'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CreateBannerModal } from '../../../components/admin/CreateBannerModal';
import type { BannerSlide } from '../../../lib/services/bannerService';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'hero' | 'promo' | 'announcement'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerSlide | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/banners');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load banners');
      setBanners(data.banners || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleToggleActive = async (banner: BannerSlide) => {
    setActionLoadingId(banner.id);
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update banner');
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? data.banner : b))
      );
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (banner: BannerSlide) => {
    if (!confirm(`Are you sure you want to delete banner "${banner.title}"?`)) return;
    setActionLoadingId(banner.id);
    try {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete banner');
      setBanners((prev) => prev.filter((b) => b.id !== banner.id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSaved = (savedBanner: BannerSlide) => {
    setBanners((prev) => {
      const index = prev.findIndex((b) => b.id === savedBanner.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = savedBanner;
        return copy.sort((a, b) => a.sortOrder - b.sortOrder);
      }
      return [...prev, savedBanner].sort((a, b) => a.sortOrder - b.sortOrder);
    });
  };

  const filteredBanners = banners.filter((b) => {
    if (typeFilter === 'all') return true;
    return b.bannerType === typeFilter;
  });

  const heroCount = banners.filter((b) => b.bannerType === 'hero').length;
  const activeCount = banners.filter((b) => b.isActive).length;
  const promoCount = banners.filter((b) => b.bannerType === 'promo').length;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1">
            <Link href="/admin" className="hover:text-[var(--bb-plum)] transition-colors">
              Admin
            </Link>
            <span>/</span>
            <span className="text-[var(--bb-plum)]">Hero & Banners</span>
          </div>
          <h1 className="text-2xl font-bold font-serif text-stone-900 tracking-tight">
            Homepage Banners & Hero Showcase
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-xl">
            Control the visual storytelling of Bee & Beauty. Manage homepage hero slides, mid-page promotional banners, and announcement ribbons with live storefront synchronization.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBanner(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-all hover:scale-[1.02]"
        >
          <span className="text-sm font-bold">+</span> Create New Banner
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Slides</p>
          <p className="mt-1 text-2xl font-black font-serif text-stone-900">{banners.length}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">All configurations</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Live Active</p>
          <p className="mt-1 text-2xl font-black font-serif text-emerald-700">{activeCount}</p>
          <span className="inline-block mt-1 text-[11px] text-emerald-600 font-medium">Currently visible to shoppers</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Hero Slides</p>
          <p className="mt-1 text-2xl font-black font-serif text-[var(--bb-plum)]">{heroCount}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Homepage hero carousel</span>
        </div>
        <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs">
          <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Promo Banners</p>
          <p className="mt-1 text-2xl font-black font-serif text-amber-600">{promoCount}</p>
          <span className="inline-block mt-1 text-[11px] text-stone-400">Mid-page high-impact promos</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 pb-3">
        {(['all', 'hero', 'promo', 'announcement'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
              typeFilter === type
                ? 'bg-[var(--bb-plum)] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            {type === 'all' ? 'All Banners' : `${type} Banners`}
          </button>
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
          ⚠ {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-stone-100 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="rounded-2xl border border-stone-200 bg-white p-12 text-center shadow-xs">
          <p className="text-base font-serif font-bold text-stone-800">No banners found</p>
          <p className="text-xs text-stone-500 mt-1">
            {typeFilter !== 'all' ? `No banners match the "${typeFilter}" filter.` : 'Get started by creating your first hero banner.'}
          </p>
          <button
            onClick={() => {
              setEditingBanner(null);
              setModalOpen(true);
            }}
            className="mt-4 rounded-xl bg-[var(--bb-plum)] text-white px-4 py-2 text-xs font-semibold hover:bg-[#831843] transition-colors"
          >
            Create Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBanners.map((banner) => (
            <div
              key={banner.id}
              className={`flex flex-col justify-between rounded-2xl border bg-white shadow-xs overflow-hidden transition-all duration-200 hover:shadow-md ${
                banner.isActive ? 'border-stone-200' : 'border-stone-200/60 opacity-70 bg-stone-50/50'
              }`}
            >
              {/* Visual Banner Preview Ribbon */}
              <div
                className={`p-6 text-white bg-gradient-to-r ${banner.bgColor || 'from-[#4A104C] to-[#360C38]'} relative min-h-[140px] flex flex-col justify-between`}
              >
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs border border-white/10 text-amber-300">
                    {banner.bannerType || 'hero'} #{banner.sortOrder}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                      banner.isActive
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-stone-800/80 text-stone-300'
                    }`}
                  >
                    {banner.isActive ? 'Active' : 'Draft'}
                  </span>
                </div>

                <div className="mt-4">
                  {banner.tagline && (
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 mb-1">
                      {banner.tagline}
                    </p>
                  )}
                  <h3 className="text-base font-bold font-serif leading-tight text-white line-clamp-2">
                    {banner.title}
                  </h3>
                  {banner.subtitle && (
                    <p className="text-[11px] text-stone-200/85 line-clamp-2 mt-1">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Banner Details & Action Controls */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="text-stone-400">Primary CTA:</span>
                    <span className="font-semibold text-stone-800">
                      {banner.ctaText} → <span className="font-mono text-[11px] text-stone-500">{banner.ctaHref}</span>
                    </span>
                  </div>

                  {banner.secondaryCtaText && (
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="text-stone-400">Secondary CTA:</span>
                      <span className="font-semibold text-stone-800">
                        {banner.secondaryCtaText} → <span className="font-mono text-[11px] text-stone-500">{banner.secondaryCtaHref}</span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-stone-600 pt-1 border-t border-stone-100">
                    <span className="text-stone-400">Accent Tint:</span>
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <span
                        className="h-3 w-3 rounded-full border border-stone-300"
                        style={{ backgroundColor: banner.accentColor || '#D4AF37' }}
                      />
                      <span>{banner.accentColor || '#D4AF37'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    disabled={actionLoadingId === banner.id}
                    className={`rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      banner.isActive
                        ? 'border border-stone-200 text-stone-600 hover:bg-stone-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {actionLoadingId === banner.id ? 'Updating...' : banner.isActive ? 'Deactivate' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingBanner(banner);
                        setModalOpen(true);
                      }}
                      className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(banner)}
                      disabled={actionLoadingId === banner.id}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <CreateBannerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={handleSaved}
        initialBanner={editingBanner}
      />
    </div>
  );
}
