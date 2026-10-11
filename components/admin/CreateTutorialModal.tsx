'use client';

import React, { useState, useEffect } from 'react';
import type { StudioTutorial } from '../../lib/services/studioService';

interface CreateTutorialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (tutorial: StudioTutorial) => void;
  initialTutorial?: StudioTutorial | null;
}

const CATEGORIES = [
  'Bridal & Occasion',
  'Lip Artistry',
  'Eye & Brow Artistry',
  'Skincare Rituals',
  'Complexion Masterclass',
  'Pro Tips & Routine',
];

export function CreateTutorialModal({
  isOpen,
  onClose,
  onSaved,
  initialTutorial,
}: CreateTutorialModalProps) {
  const isEditing = Boolean(initialTutorial);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [duration, setDuration] = useState('5 min masterclass');
  const [description, setDescription] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [productSlug, setProductSlug] = useState('');
  const [productName, setProductName] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(1);
  const [isActive, setIsActive] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialTutorial) {
      setTitle(initialTutorial.title);
      setCategory(initialTutorial.category || CATEGORIES[0]);
      setDuration(initialTutorial.duration || '5 min masterclass');
      setDescription(initialTutorial.description || '');
      setStepsText((initialTutorial.steps || []).join('\n'));
      setProductSlug(initialTutorial.productSlug || '');
      setProductName(initialTutorial.productName || '');
      setVideoUrl(initialTutorial.videoUrl || '');
      setThumbnailUrl(initialTutorial.thumbnailUrl || '');
      setSortOrder(initialTutorial.sortOrder || 1);
      setIsActive(initialTutorial.isActive !== false);
    } else {
      setTitle('');
      setCategory(CATEGORIES[0]);
      setDuration('5 min masterclass');
      setDescription('');
      setStepsText('Prep skin with barrier serum.\nApply foundation with damp sponge.\nSet with translucent powder.');
      setProductSlug('');
      setProductName('');
      setVideoUrl('');
      setThumbnailUrl('');
      setSortOrder(1);
      setIsActive(true);
    }
    setErrorMsg('');
  }, [initialTutorial, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      setErrorMsg('Tutorial Title and Category are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const steps = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      title: title.trim(),
      category: category.trim(),
      duration: duration.trim(),
      description: description.trim(),
      steps,
      productSlug: productSlug.trim() || undefined,
      productName: productName.trim() || undefined,
      videoUrl: videoUrl.trim() || undefined,
      thumbnailUrl: thumbnailUrl.trim() || undefined,
      sortOrder: Number(sortOrder) || 1,
      isActive,
    };

    try {
      const url = isEditing
        ? `/api/admin/studio/tutorials/${initialTutorial!.id}`
        : '/api/admin/studio/tutorials';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save tutorial');

      onSaved(data.tutorial);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving tutorial.');
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
              {isEditing ? 'Edit Studio Tutorial' : 'Add Studio Masterclass'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Publish beauty masterclasses and application guides for the Pro Beauty Studio.
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
          <div>
            <label className="block font-bold text-stone-700 mb-1">Tutorial Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Royal Golden Hour Bridal Look"
              required
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-serif font-bold text-stone-900 focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Duration Tag *</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 5 min masterclass"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Tutorial Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of makeup application techniques and artistry highlights..."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">
              Step-by-Step Instructions (one step per line)
            </label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder="Step 1: Prep skin&#10;Step 2: Apply foundation&#10;Step 3: Highlight cheekbones"
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs font-mono focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* Featured Product */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Featured Product Name</label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Honey Silk HD Foundation"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Featured Product Slug</label>
              <input
                type="text"
                value={productSlug}
                onChange={(e) => setProductSlug(e.target.value)}
                placeholder="e.g. honey-silk-hd-serum-foundation"
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Video Link (YouTube/MP4)</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Display Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={1}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
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
              Active (Visible in Pro Beauty Studio)
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Tutorial' : 'Save Tutorial'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
