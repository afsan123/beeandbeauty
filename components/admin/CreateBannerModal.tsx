'use client';

import React, { useState, useEffect } from 'react';
import type { BannerSlide } from '../../lib/services/bannerService.ts';

interface CreateBannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (banner: BannerSlide) => void;
  initialBanner?: BannerSlide | null;
}

const BG_PRESETS = [
  { label: 'Royal Plum Velvet', value: 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]' },
  { label: 'Botanical Sage Forest', value: 'from-[#1B3828] via-[#2A4D39] to-[#14261C]' },
  { label: 'Deep Rose Wine', value: 'from-[#4E243B] via-[#6E3052] to-[#341627]' },
  { label: 'Midnight Honey Luxe', value: 'from-[#3A0C3C] via-[#5C165F] to-[#2B082D]' },
  { label: 'Warm Nectar Gold', value: 'from-[#521354] to-[#6A1B6D]' },
];

export function CreateBannerModal({
  isOpen,
  onClose,
  onSaved,
  initialBanner,
}: CreateBannerModalProps) {
  const isEditing = Boolean(initialBanner);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [ctaText, setCtaText] = useState('');
  const [ctaHref, setCtaHref] = useState('');
  const [secondaryCtaText, setSecondaryCtaText] = useState('');
  const [secondaryCtaHref, setSecondaryCtaHref] = useState('');
  const [bgColor, setBgColor] = useState(BG_PRESETS[0].value);
  const [accentColor, setAccentColor] = useState('#D4AF37');
  const [bannerType, setBannerType] = useState<BannerSlide['bannerType']>('hero');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialBanner) {
      setTitle(initialBanner.title);
      setSubtitle(initialBanner.subtitle || '');
      setTagline(initialBanner.tagline || '');
      setCtaText(initialBanner.ctaText);
      setCtaHref(initialBanner.ctaHref);
      setSecondaryCtaText(initialBanner.secondaryCtaText || '');
      setSecondaryCtaHref(initialBanner.secondaryCtaHref || '');
      setBgColor(initialBanner.bgColor || BG_PRESETS[0].value);
      setAccentColor(initialBanner.accentColor || '#D4AF37');
      setBannerType(initialBanner.bannerType || 'hero');
      setSortOrder(initialBanner.sortOrder || 1);
      setIsActive(initialBanner.isActive !== false);
    } else {
      setTitle('');
      setSubtitle('');
      setTagline('LUXURY COSMETICS | NEW LAUNCH');
      setCtaText('Shop Collection');
      setCtaHref('/shop/all');
      setSecondaryCtaText('');
      setSecondaryCtaHref('');
      setBgColor(BG_PRESETS[0].value);
      setAccentColor('#D4AF37');
      setBannerType('hero');
      setSortOrder(1);
      setIsActive(true);
    }
    setErrorMsg('');
  }, [initialBanner, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !ctaText.trim() || !ctaHref.trim()) {
      setErrorMsg('Title, CTA button text, and CTA link are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      tagline: tagline.trim(),
      ctaText: ctaText.trim(),
      ctaHref: ctaHref.trim(),
      secondaryCtaText: secondaryCtaText.trim() || undefined,
      secondaryCtaHref: secondaryCtaHref.trim() || undefined,
      bgColor,
      accentColor,
      bannerType,
      sortOrder: Number(sortOrder) || 1,
      isActive,
    };

    try {
      const url = isEditing
        ? `/api/admin/banners/${initialBanner!.id}`
        : '/api/admin/banners';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save banner');

      onSaved(data.banner);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving banner.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-stone-200/90 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              {isEditing ? 'Edit Banner Slide' : 'Create New Banner'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure homepage hero slides, mid-page promotional banners, or announcements.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
            ⚠ {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Banner Type *</label>
              <select
                value={bannerType}
                onChange={(e) => setBannerType(e.target.value as any)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs bg-white focus:border-[var(--bb-plum)] outline-none"
              >
                <option value="hero">Hero Carousel Slide</option>
                <option value="promo">Mid-Page Promotional Banner</option>
                <option value="announcement">Top Announcement Bar</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Sort Order *</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={1}
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Small Tagline / Category Pill</label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. LUXURY COSMETICS | NEW LAUNCH"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Headline Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ROYAL VELVET MATTE LIPSTICK"
              required
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none font-bold font-serif"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Subtitle / Campaign Copy</label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Infused with botanical royal jelly & honey nectar. 16-hour weightless comfort..."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Primary CTA Text *</label>
              <input
                type="text"
                value={ctaText}
                onChange={(e) => setCtaText(e.target.value)}
                placeholder="e.g. Shop Lipsticks"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Primary CTA URL *</label>
              <input
                type="text"
                value={ctaHref}
                onChange={(e) => setCtaHref(e.target.value)}
                placeholder="e.g. /shop/lips"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Secondary CTA Text (Optional)</label>
              <input
                type="text"
                value={secondaryCtaText}
                onChange={(e) => setSecondaryCtaText(e.target.value)}
                placeholder="e.g. Explore Makeup"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Secondary CTA URL (Optional)</label>
              <input
                type="text"
                value={secondaryCtaHref}
                onChange={(e) => setSecondaryCtaHref(e.target.value)}
                placeholder="e.g. /shop/all"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Background Gradient & Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Background Preset</label>
              <select
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs"
              >
                {BG_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-8 w-8 rounded border border-stone-200 cursor-pointer"
                />
                <input
                  type="text"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="flex-1 rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Active status */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded accent-[var(--bb-plum)]"
            />
            <span className="font-semibold text-stone-800">
              Active (Visible on Storefront)
            </span>
          </label>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-stone-200 px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-5 py-2.5 text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Banner' : 'Create Banner'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
