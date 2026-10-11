'use client';

import React, { useState, useEffect } from 'react';
import type { Product, Category, Shade } from '../../data/types.ts';
import { generateSlug } from '../../lib/slug.ts';

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
  categories: Category[];
  initialProduct?: Product | null;
}

export function CreateProductModal({
  isOpen,
  onClose,
  onSaved,
  categories,
  initialProduct,
}: CreateProductModalProps) {
  const isEditing = Boolean(initialProduct);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [categorySlug, setCategorySlug] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [primaryImage, setPrimaryImage] = useState('');
  const [hoverImage, setHoverImage] = useState('');
  const [tagsText, setTagsText] = useState('');

  // Flags
  const [inStock, setInStock] = useState(true);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isNewLaunch, setIsNewLaunch] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isKit, setIsKit] = useState(false);

  // Specifications
  const [netWeight, setNetWeight] = useState('50g');
  const [shelfLife, setShelfLife] = useState('24 Months');
  const [origin, setOrigin] = useState('Bangladesh / Korea');
  const [finish, setFinish] = useState('Velvet Matte');
  const [formulation, setFormulation] = useState('Botanical Infused');

  // Shades builder
  const [shades, setShades] = useState<Shade[]>([]);
  const [newShadeName, setNewShadeName] = useState('');
  const [newShadeCode, setNewShadeCode] = useState('');
  const [newShadeColor, setNewShadeColor] = useState('#B22222');
  const [newShadeFamily, setNewShadeFamily] = useState<Shade['family']>('red');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setTitle(initialProduct.title);
      setSlug(initialProduct.slug);
      setIsSlugManuallyEdited(true);
      setCategorySlug(initialProduct.categorySlug);
      setSubtitle(initialProduct.subtitle || '');
      setPrice(initialProduct.price);
      setCompareAtPrice(initialProduct.compareAtPrice || '');
      setShortDescription(initialProduct.shortDescription || '');
      setDescription(initialProduct.description || '');
      setHowToUse(initialProduct.howToUse || '');
      setIngredients(initialProduct.ingredients || '');
      setPrimaryImage(initialProduct.images?.primary || '');
      setHoverImage(initialProduct.images?.hover || '');
      setTagsText(initialProduct.tags?.join(', ') || '');
      setInStock(initialProduct.inStock !== false);
      setIsBestseller(Boolean(initialProduct.isBestseller));
      setIsNewLaunch(Boolean(initialProduct.isNewLaunch));
      setIsFeatured(Boolean(initialProduct.isFeatured));
      setIsKit(Boolean(initialProduct.isKit));
      setNetWeight(initialProduct.details?.netWeight || '50g');
      setShelfLife(initialProduct.details?.shelfLife || '24 Months');
      setOrigin(initialProduct.details?.origin || 'Bangladesh');
      setFinish(initialProduct.details?.finish || 'Velvet Matte');
      setFormulation(initialProduct.details?.formulation || 'Botanical Infused');
      setShades(initialProduct.shades || []);
    } else {
      setTitle('');
      setSlug('');
      setIsSlugManuallyEdited(false);
      setCategorySlug(categories[0]?.slug || 'lips');
      setSubtitle('');
      setPrice('');
      setCompareAtPrice('');
      setShortDescription('');
      setDescription('');
      setHowToUse('');
      setIngredients('');
      setPrimaryImage('');
      setHoverImage('');
      setTagsText('');
      setInStock(true);
      setIsBestseller(false);
      setIsNewLaunch(true);
      setIsFeatured(false);
      setIsKit(false);
      setNetWeight('50g');
      setShelfLife('24 Months');
      setOrigin('Bangladesh');
      setFinish('Velvet Matte');
      setFormulation('Botanical Infused');
      setShades([]);
    }
    setErrorMsg('');
  }, [initialProduct, isOpen, categories]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    // Auto-generate URL slug based on product name if user hasn't explicitly customized it
    if (!isSlugManuallyEdited) {
      setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(e.target.value);
    setIsSlugManuallyEdited(true);
  };

  const handleRegenerateSlug = () => {
    const generated = generateSlug(title);
    setSlug(generated);
    setIsSlugManuallyEdited(false);
  };

  const handleAddShade = () => {
    if (!newShadeName.trim()) return;
    const newShade: Shade = {
      id: `shade-${Date.now()}`,
      name: newShadeName.trim(),
      code: newShadeCode.trim() || String(shades.length + 1).padStart(2, '0'),
      hexColor: newShadeColor,
      family: newShadeFamily,
      inStock: true,
    };
    setShades((prev) => [...prev, newShade]);
    setNewShadeName('');
    setNewShadeCode('');
  };

  const handleRemoveShade = (index: number) => {
    setShades((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || price === '' || isNaN(Number(price))) {
      setErrorMsg('Product title and a valid price in BDT (৳) are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const matchedCategory = categories.find((c) => c.slug === categorySlug);
    const categoryName = matchedCategory ? matchedCategory.name : 'Cosmetics';

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const finalSlug = (slug.trim() ? generateSlug(slug) : generateSlug(title)) || `prod-${Date.now()}`;

    const payload = {
      title: title.trim(),
      slug: finalSlug,
      categorySlug,
      categoryName,
      subtitle: subtitle.trim(),
      shortDescription: shortDescription.trim(),
      description: description.trim(),
      howToUse: howToUse.trim(),
      ingredients: ingredients.trim(),
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : undefined,
      inStock,
      isBestseller,
      isNewLaunch,
      isFeatured,
      isKit,
      isUnder499: Number(price) <= 499,
      details: {
        netWeight,
        shelfLife,
        origin,
        finish,
        formulation,
      },
      images: {
        primary: primaryImage.trim() || '/images/products/placeholder.jpg',
        hover: hoverImage.trim() || primaryImage.trim() || '/images/products/placeholder.jpg',
        gallery: [primaryImage.trim()].filter(Boolean),
      },
      shades,
      tags,
    };

    try {
      const url = isEditing
        ? `/api/admin/products/${initialProduct!.id}`
        : '/api/admin/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      onSaved(data.product);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200/90 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4 mb-4">
          <div>
            <h2 className="text-lg font-bold font-serif text-stone-900">
              {isEditing ? 'Edit Catalog Product' : 'Add New Catalog Product'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Configure product details, shades, formulas, and pricing in Bangladesh Taka (৳).
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
          {/* Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Product Title *</label>
              <input
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="e.g. Royal Velvet Matte Lipstick"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-stone-700">URL Slug *</label>
                <button
                  type="button"
                  onClick={handleRegenerateSlug}
                  title="Auto-generate slug based on product name"
                  className="text-[11px] font-semibold text-[var(--bb-plum)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>⚡ Auto-generate</span>
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={handleSlugChange}
                placeholder="e.g. royal-velvet-matte-lipstick"
                required
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-mono focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1 truncate">
                Preview: <span className="font-mono text-stone-600">/product/{slug || '...'}</span>
              </p>
            </div>
          </div>

          {/* Category & Subtitle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Category *</label>
              <select
                value={categorySlug}
                onChange={(e) => setCategorySlug(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs bg-white focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Subtitle / Tagline</label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="e.g. Infused with Royal Propolis & Honey Nectar"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] focus:ring-1 focus:ring-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[var(--bb-ivory)] p-3.5 rounded-xl border border-amber-200/60">
            <div>
              <label className="block font-bold text-stone-900 mb-1">
                Selling Price (৳ BDT) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="e.g. 1250"
                required
                min={0}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-900 focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Compare At Price / MRP (৳ BDT)
              </label>
              <input
                type="number"
                value={compareAtPrice}
                onChange={(e) =>
                  setCompareAtPrice(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 1500 (Optional for discount strike-through)"
                min={0}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Image URLs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">Primary Image URL</label>
              <input
                type="text"
                value={primaryImage}
                onChange={(e) => setPrimaryImage(e.target.value)}
                placeholder="/images/products/... or https://..."
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Hover Image URL</label>
              <input
                type="text"
                value={hoverImage}
                onChange={(e) => setHoverImage(e.target.value)}
                placeholder="/images/products/... or https://..."
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Short & Full Description */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              placeholder="Quick 1-2 sentence product highlight..."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Full Ritual Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed product story, benefits, and luxury South Asian formulation..."
              className="w-full rounded-xl border border-stone-200 p-2.5 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          {/* Ingredients & How to Use */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-stone-700 mb-1">How To Use</label>
              <textarea
                rows={2}
                value={howToUse}
                onChange={(e) => setHowToUse(e.target.value)}
                placeholder="Application steps and artistry recommendations..."
                className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">Ingredients</label>
              <textarea
                rows={2}
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                placeholder="Raw Propolis, Niacinamide, Botanical Nectar..."
                className="w-full rounded-xl border border-stone-200 p-2 text-xs focus:border-[var(--bb-plum)] outline-none"
              />
            </div>
          </div>

          {/* Product Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 bg-stone-50 p-3 rounded-xl border border-stone-200">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Net Weight</label>
              <input
                type="text"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Shelf Life</label>
              <input
                type="text"
                value={shelfLife}
                onChange={(e) => setShelfLife(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Origin</label>
              <input
                type="text"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Finish</label>
              <input
                type="text"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-0.5">Formulation</label>
              <input
                type="text"
                value={formulation}
                onChange={(e) => setFormulation(e.target.value)}
                className="w-full rounded-lg border border-stone-200 bg-white px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Shades Builder */}
          <div className="border border-stone-200/90 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-900">Color Shades Matrix ({shades.length})</span>
              <span className="text-[10px] text-stone-400">Add customizable shades & swatches</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {shades.map((s, idx) => (
                <div
                  key={s.id || idx}
                  className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs shadow-xs"
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: s.hexColor }}
                  />
                  <span className="font-semibold text-stone-800">{s.name}</span>
                  <span className="text-stone-400 text-[10px]">({s.code})</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveShade(idx)}
                    className="ml-1 text-stone-400 hover:text-rose-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Add Shade Row */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-stone-100">
              <input
                type="text"
                placeholder="Shade name (e.g. Royal Plum)"
                value={newShadeName}
                onChange={(e) => setNewShadeName(e.target.value)}
                className="rounded-lg border border-stone-200 px-2 py-1 text-xs sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Code (e.g. 01)"
                value={newShadeCode}
                onChange={(e) => setNewShadeCode(e.target.value)}
                className="rounded-lg border border-stone-200 px-2 py-1 text-xs"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  value={newShadeColor}
                  onChange={(e) => setNewShadeColor(e.target.value)}
                  className="h-7 w-7 rounded border border-stone-200 cursor-pointer"
                />
                <select
                  value={newShadeFamily}
                  onChange={(e) => setNewShadeFamily(e.target.value as any)}
                  className="rounded-lg border border-stone-200 px-1 py-1 text-[11px] bg-white"
                >
                  <option value="red">Red</option>
                  <option value="nude">Nude</option>
                  <option value="pink">Pink</option>
                  <option value="berry">Berry</option>
                  <option value="brown">Brown</option>
                  <option value="neutral">Neutral</option>
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddShade}
                className="rounded-lg bg-[var(--bb-plum)] hover:bg-[#831843] text-white px-3 py-1 font-semibold text-xs"
              >
                ＋ Add Shade
              </button>
            </div>
          </div>

          {/* Tags & Flags */}
          <div>
            <label className="block font-bold text-stone-700 mb-1">Search Tags (Comma-separated)</label>
            <input
              type="text"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="lipstick, matte, propolis, hydrating, bridal"
              className="w-full rounded-xl border border-stone-200 px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => setInStock(e.target.checked)}
                className="rounded accent-[var(--bb-plum)]"
              />
              <span className="font-semibold text-stone-800">In Stock</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isBestseller}
                onChange={(e) => setIsBestseller(e.target.checked)}
                className="rounded accent-[var(--bb-plum)]"
              />
              <span className="font-semibold text-stone-800">Bestseller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isNewLaunch}
                onChange={(e) => setIsNewLaunch(e.target.checked)}
                className="rounded accent-[var(--bb-plum)]"
              />
              <span className="font-semibold text-stone-800">New Launch</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="rounded accent-[var(--bb-plum)]"
              />
              <span className="font-semibold text-stone-800">Featured Home</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isKit}
                onChange={(e) => setIsKit(e.target.checked)}
                className="rounded accent-[var(--bb-plum)]"
              />
              <span className="font-semibold text-stone-800">Gift Set / Bundle</span>
            </label>
          </div>

          {/* Submit buttons */}
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
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
