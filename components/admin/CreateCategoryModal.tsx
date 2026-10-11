'use client';

import React, { useState, useEffect } from 'react';
import type { Category } from '../../data/types.ts';
import { generateSlug } from '../../lib/slug.ts';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (category: Category) => void;
  initialCategory?: Category | null;
}

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSaved,
  initialCategory,
}: CreateCategoryModalProps) {
  const isEditing = Boolean(initialCategory);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortTitle, setShortTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tileImage, setTileImage] = useState('');
  const [heroBannerImage, setHeroBannerImage] = useState('');
  const [subcategoriesText, setSubcategoriesText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialCategory) {
      setName(initialCategory.name);
      setSlug(initialCategory.slug);
      setShortTitle(initialCategory.shortTitle);
      setDescription(initialCategory.description || '');
      setTileImage(initialCategory.tileImage || '');
      setHeroBannerImage(initialCategory.heroBannerImage || '');
      setSubcategoriesText(
        initialCategory.subcategories?.map((s) => s.name).join(', ') || ''
      );
    } else {
      setName('');
      setSlug('');
      setShortTitle('');
      setDescription('');
      setTileImage('');
      setHeroBannerImage('');
      setSubcategoriesText('');
    }
    setErrorMsg('');
  }, [initialCategory, isOpen]);

  // Auto-slugify name if creating
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isEditing) {
      setSlug(generateSlug(val));
      if (!shortTitle) {
        setShortTitle(val);
      }
    }
  };

  const handleRegenerateSlug = () => {
    setSlug(generateSlug(name));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalSlug = (slug.trim() ? generateSlug(slug) : generateSlug(name)) || `cat-${Date.now()}`;
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    // Parse subcategories from comma-separated string
    const subcategories = subcategoriesText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((subName) => ({
        name: subName,
        slug: generateSlug(subName),
      }));

    const payload = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      shortTitle: (shortTitle || name).trim(),
      description: description.trim(),
      tileImage: tileImage.trim() || '/images/categories/placeholder.jpg',
      heroBannerImage: heroBannerImage.trim() || undefined,
      subcategories,
    };

    try {
      const url = isEditing
        ? `/api/admin/categories/${initialCategory!.slug}`
        : '/api/admin/categories';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save category');
      }

      onSaved(data.category);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving category.');
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
              {isEditing ? 'Edit Category' : 'Create New Category'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Categories define storefront navigation, filtering, and catalog groups.
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
              <label className="block font-bold text-stone-700 mb-1">Category Name *</label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. Lips & Liners"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-stone-700">URL Slug *</label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] font-semibold text-[var(--bb-plum)] hover:underline cursor-pointer"
                  >
                    ⚡ Auto-generate
                  </button>
                )}
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. lips"
                required
                disabled={isEditing}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none disabled:bg-stone-100 disabled:text-stone-500"
              />
              <p className="text-[10px] text-stone-400 mt-1 truncate">
                Preview: <span className="font-mono text-stone-600">/shop/{slug || '...'}</span>
              </p>
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Short Title (For Menu / Badges)</label>
            <input
              type="text"
              value={shortTitle}
              onChange={(e) => setShortTitle(e.target.value)}
              placeholder="e.g. Lips"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Luxurious botanical formulas curated for South Asian beauty..."
              className="w-full rounded-xl border border-stone-200 p-3 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Tile Image URL</label>
              <input
                type="text"
                value={tileImage}
                onChange={(e) => setTileImage(e.target.value)}
                placeholder="https://... or /images/..."
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Hero Banner Image URL</label>
              <input
                type="text"
                value={heroBannerImage}
                onChange={(e) => setHeroBannerImage(e.target.value)}
                placeholder="Optional banner image"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Subcategories (Comma-separated)</label>
            <input
              type="text"
              value={subcategoriesText}
              onChange={(e) => setSubcategoriesText(e.target.value)}
              placeholder="Velvet Mattes, Plumping Gloss, Lip Liners, Lip Oils"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
            />
            <p className="text-[10px] text-stone-400 mt-1">Separate subcategory tags with commas</p>
          </div>

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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
