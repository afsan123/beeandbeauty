'use client';

import React, { useState, useRef } from 'react';
import type { Product, Category } from '../../data/types.ts';
import {
  parseProductCsv,
  parseProductJson,
  getSampleCsvTemplate,
  getSampleJsonTemplate,
  type ParsedProductRow,
  type ParseResult,
} from '../../lib/productBulkParser.ts';
import { formatPrice } from '../../lib/formatters.ts';

interface BulkProductUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductsImported: (newProducts: Product[]) => void;
  categories: Category[];
}

export function BulkProductUploadModal({
  isOpen,
  onClose,
  onProductsImported,
  categories,
}: BulkProductUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [pastedText, setPastedText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Parsing state
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'errors'>('all');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [importErrorMsg, setImportErrorMsg] = useState<string | null>(null);
  const [showImageGuide, setShowImageGuide] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setFileName(null);
    setPastedText('');
    setParseResult(null);
    setFilterView('all');
    setImportSuccessMsg(null);
    setImportErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const processContent = (content: string, name: string) => {
    setFileName(name);
    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    const isJson = name.endsWith('.json') || content.trim().startsWith('[') || content.trim().startsWith('{');
    if (isJson) {
      const res = parseProductJson(content, categories);
      setParseResult(res);
    } else {
      const res = parseProductCsv(content, categories);
      setParseResult(res);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processContent(text, file.name);
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        processContent(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    processContent(pastedText, 'pasted-content.csv');
  };

  const handleDownloadCsvTemplate = () => {
    const csvContent = getSampleCsvTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'beeandbeauty_products_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJsonTemplate = () => {
    const jsonContent = getSampleJsonTemplate();
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'beeandbeauty_products_template.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExecuteImport = async () => {
    if (!parseResult || parseResult.validCount === 0) return;

    const validProducts = parseResult.rows
      .filter((r) => r.isValid && r.product)
      .map((r) => r.product as Product);

    setIsSubmitting(true);
    setImportErrorMsg(null);
    setImportSuccessMsg(null);

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: validProducts }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete bulk product upload.');
      }

      setImportSuccessMsg(
        `🎉 Successfully imported ${data.count} products into the catalog and Supabase database!`
      );
      onProductsImported(data.products || []);

      setTimeout(() => {
        onClose();
        handleReset();
      }, 1600);
    } catch (err: any) {
      setImportErrorMsg(err.message || 'Error occurred while executing bulk upload.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayRows = parseResult
    ? parseResult.rows.filter((r) => {
        if (filterView === 'valid') return r.isValid;
        if (filterView === 'errors') return !r.isValid;
        return true;
      })
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 sm:p-6 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white shadow-2xl ring-1 ring-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/80 px-6 py-4.5 shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--bb-plum)] text-white text-sm font-bold shadow-xs">
                📥
              </span>
              <h2 className="text-lg sm:text-xl font-bold font-serif text-stone-900">
                Bulk Catalog Product Upload
              </h2>
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-900">
                CSV / JSON
              </span>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              Bulk import new catalog formulas with automatic SEO slug generation, shade palettes, and BDT (৳) pricing.
            </p>
          </div>
          <button
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700 transition-all"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Template Bar */}
        <div className="bg-[var(--bb-ivory)]/80 border-b border-amber-200/60 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 text-stone-700">
            <span className="text-base">📋</span>
            <span className="font-medium">
              Required: <strong>Title</strong>, <strong>Category</strong>, <strong>BDT Price</strong>. Slugs are auto-generated!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImageGuide(!showImageGuide)}
              className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 font-bold text-amber-900 hover:bg-amber-100 transition-all shadow-2xs"
            >
              <span>🖼️</span>
              <span>{showImageGuide ? 'Hide Image Guide' : 'Image Hosting Guide'}</span>
            </button>
            <button
              onClick={handleDownloadCsvTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--bb-plum)]/30 bg-white px-3 py-1.5 font-bold text-[var(--bb-plum)] hover:bg-[var(--bb-plum)] hover:text-white transition-all shadow-2xs"
            >
              <span>📄</span>
              <span>Download CSV Template</span>
            </button>
            <button
              onClick={handleDownloadJsonTemplate}
              className="flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-bold text-stone-700 hover:bg-stone-100 transition-all shadow-2xs"
            >
              <span>{'{ }'}</span>
              <span>Download JSON Template</span>
            </button>
          </div>
        </div>

        {/* Expandable Image Guide */}
        {showImageGuide && (
          <div className="bg-amber-50/70 border-b border-amber-200/80 px-6 py-4 text-xs text-stone-700 space-y-3 shrink-0">
            <div className="flex items-center justify-between font-bold text-stone-900 text-sm">
              <span className="flex items-center gap-2">
                <span>📸</span>
                <span>How to Format &amp; Host Product Images in Bulk Upload</span>
              </span>
              <button
                onClick={() => setShowImageGuide(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-amber-200 bg-white p-3.5 space-y-2">
                <div className="font-bold text-[var(--bb-plum)] flex items-center gap-1.5">
                  <span>📁</span>
                  <span>Option A: Local Image Files (Recommended for Fast Setup)</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Drop your image files (<code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.jpg, .png, .webp, .svg</code>) into the project folder:
                  <br />
                  <code className="text-stone-800 font-bold block mt-1 bg-amber-50/80 p-1 rounded border border-amber-200/50">
                    public/images/products/
                  </code>
                </p>
                <div className="text-[11px] text-stone-600">
                  Then in your CSV or JSON columns, reference them directly:
                  <div className="font-mono text-[10px] bg-stone-50 border border-stone-200 p-1.5 rounded mt-1 space-y-0.5">
                    <div><strong>primary_image</strong>: /images/products/my-lipstick.jpg</div>
                    <div><strong>hover_image</strong>: /images/products/my-lipstick-swatch.jpg</div>
                    <div><strong>gallery</strong>: /images/products/img1.jpg,/images/products/img2.jpg</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-white p-3.5 space-y-2">
                <div className="font-bold text-[#3E6351] flex items-center gap-1.5">
                  <span>☁️</span>
                  <span>Option B: Cloud Storage / Supabase / External CDN</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed">
                  Upload images to your <strong>Supabase Storage bucket</strong>, Cloudinary, Imgur, or AWS S3, and paste the full public HTTPS URL directly into the column:
                </p>
                <div className="font-mono text-[10px] bg-stone-50 border border-stone-200 p-1.5 rounded mt-1 space-y-0.5 break-all">
                  <div><strong>primary_image</strong>: https://your-project.supabase.co/storage/v1/object/public/products/lipstick.jpg</div>
                  <div><strong>hover_image</strong>: https://your-cdn.com/images/lipstick-swatch.jpg</div>
                </div>
                <p className="text-[10px] text-stone-500 italic">
                  💡 Note: If left blank or invalid, the platform automatically applies an elegant brand fallback placeholder.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {importSuccessMsg && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <span>✓</span>
              <span>{importSuccessMsg}</span>
            </div>
          )}

          {importErrorMsg && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <span>⚠</span>
              <span>{importErrorMsg}</span>
            </div>
          )}

          {/* If no file parsed yet, show tabs & upload box */}
          {!parseResult ? (
            <div className="space-y-4">
              {/* Tab Selector */}
              <div className="flex rounded-xl bg-stone-100 p-1 w-fit">
                <button
                  onClick={() => setActiveTab('upload')}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'upload'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  📁 Upload File (.csv, .json)
                </button>
                <button
                  onClick={() => setActiveTab('paste')}
                  className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                    activeTab === 'paste'
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  📝 Direct Paste (Spreadsheet / JSON)
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                    dragActive
                      ? 'border-[var(--bb-plum)] bg-[var(--bb-blush)]/20 scale-[0.99]'
                      : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .json, text/csv, application/json"
                    onChange={handleFileChange}
                    className="hidden"
                    id="bulk-product-file"
                  />
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-2xl text-[var(--bb-gold)] border border-amber-200/80 mb-4 shadow-xs">
                    📤
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-stone-800">
                    Drag and drop your product catalog file here
                  </h3>
                  <p className="mt-1 text-xs text-stone-500">
                    Supports <strong>.csv</strong> (Excel / Sheets export) and <strong>.json</strong> file formats
                  </p>

                  <div className="mt-5">
                    <label
                      htmlFor="bulk-product-file"
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow transition-all"
                    >
                      <span>Choose File from Computer</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">
                    Paste raw CSV lines (with header row) or JSON array copied directly from your spreadsheet or inventory system:
                  </p>
                  <textarea
                    rows={8}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="title,category,price,compare_at_price,shades,tags&#10;Royal Matte Lipstick,lips,1250,1450,Ruby|#9E2A2B|01|red,matte,lips"
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50/50 p-4 font-mono text-xs focus:border-[var(--bb-plum)] focus:bg-white focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handleParsePastedText}
                      disabled={!pastedText.trim()}
                      className="rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] disabled:opacity-50 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-all"
                    >
                      Parse & Validate Products &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Results & Matrix Preview */
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5">
                  <div className="text-[11px] font-semibold text-stone-500">Source File</div>
                  <div className="text-sm font-bold text-stone-800 truncate mt-0.5">
                    {fileName || 'Input stream'}
                  </div>
                </div>
                <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3.5">
                  <div className="text-[11px] font-semibold text-stone-500">Total Rows</div>
                  <div className="text-base font-bold text-stone-900 mt-0.5">
                    {parseResult.totalRows} Products
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3.5">
                  <div className="text-[11px] font-semibold text-emerald-700">Valid & Ready</div>
                  <div className="text-base font-bold text-emerald-800 mt-0.5">
                    {parseResult.validCount} Products
                  </div>
                </div>
                <div className={`rounded-2xl border p-3.5 ${
                  parseResult.errorCount > 0
                    ? 'border-rose-200 bg-rose-50/60'
                    : 'border-stone-200 bg-stone-50'
                }`}>
                  <div className={`text-[11px] font-semibold ${
                    parseResult.errorCount > 0 ? 'text-rose-700' : 'text-stone-500'
                  }`}>
                    Errors / Invalids
                  </div>
                  <div className={`text-base font-bold mt-0.5 ${
                    parseResult.errorCount > 0 ? 'text-rose-800' : 'text-stone-800'
                  }`}>
                    {parseResult.errorCount} Rows
                  </div>
                </div>
              </div>

              {/* Filter tabs & Reset Button */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilterView('all')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      filterView === 'all'
                        ? 'bg-stone-900 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    All ({parseResult.totalRows})
                  </button>
                  <button
                    onClick={() => setFilterView('valid')}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      filterView === 'valid'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    Ready ({parseResult.validCount})
                  </button>
                  {parseResult.errorCount > 0 && (
                    <button
                      onClick={() => setFilterView('errors')}
                      className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                        filterView === 'errors'
                          ? 'bg-rose-600 text-white'
                          : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                      }`}
                    >
                      Errors Only ({parseResult.errorCount})
                    </button>
                  )}
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 underline"
                >
                  Upload a different file
                </button>
              </div>

              {/* Preview Table */}
              <div className="rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-stone-100 text-[11px] font-bold text-stone-600 uppercase border-b border-stone-200 z-10">
                      <tr>
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Image</th>
                        <th className="py-2.5 px-3">Product Title & Auto-Slug</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3 text-right">Price (BDT)</th>
                        <th className="py-2.5 px-3">Shades</th>
                        <th className="py-2.5 px-3">Specs / Flags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {displayRows.map((row) => (
                        <tr
                          key={row.rowNumber}
                          className={row.isValid ? 'hover:bg-stone-50/60' : 'bg-rose-50/40 hover:bg-rose-50/70'}
                        >
                          <td className="py-2.5 px-3 font-mono text-stone-400">
                            {row.rowNumber}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {row.isValid ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                <span>✓</span>
                                <span>Ready</span>
                              </span>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                                  <span>✕</span>
                                  <span>Invalid</span>
                                </span>
                                {row.errors.map((e, idx) => (
                                  <div key={idx} className="text-[10px] text-rose-600 font-medium">
                                    {e}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {row.product?.images?.primary ? (
                              <div className="relative h-10 w-10 rounded-lg border border-stone-200 overflow-hidden bg-stone-50 flex items-center justify-center shrink-0 shadow-2xs">
                                <img
                                  src={row.product.images.primary}
                                  alt={row.product.title || 'Product'}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = '/images/products/placeholder.jpg';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="h-10 w-10 rounded-lg border border-dashed border-stone-200 bg-stone-50 flex items-center justify-center text-[10px] text-stone-400">
                                🖼️
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-stone-900">
                              {row.product?.title || row.raw.title || 'Untitled'}
                            </div>
                            <div className="font-mono text-[10px] text-stone-400">
                              /{row.product?.slug || 'slug-pending'}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="rounded-lg bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700">
                              {row.product?.categoryName || row.raw.category || 'Lips'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right whitespace-nowrap">
                            <div className="font-bold text-[var(--bb-plum)]">
                              {row.product?.price ? formatPrice(row.product.price) : '—'}
                            </div>
                            {row.product?.compareAtPrice && (
                              <div className="text-[10px] text-stone-400 line-through">
                                {formatPrice(row.product.compareAtPrice)}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            {row.product?.shades && row.product.shades.length > 0 ? (
                              <div className="flex items-center gap-1 flex-wrap max-w-48">
                                {row.product.shades.slice(0, 4).map((s, idx) => (
                                  <span
                                    key={idx}
                                    title={`${s.name} (${s.code})`}
                                    className="h-3.5 w-3.5 rounded-full border border-stone-300 shadow-2xs"
                                    style={{ backgroundColor: s.hexColor }}
                                  />
                                ))}
                                <span className="text-[10px] text-stone-500 font-medium ml-1">
                                  {row.product.shades.length} shades
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 text-[11px]">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1 flex-wrap">
                              {row.product?.isBestseller && (
                                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800">
                                  Bestseller
                                </span>
                              )}
                              {row.product?.isNewLaunch && (
                                <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[9px] font-bold text-rose-800">
                                  New
                                </span>
                              )}
                              {row.product?.isUnder499 && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                                  &le;৳499
                                </span>
                              )}
                              <span className="text-[10px] text-stone-400">
                                {row.product?.details?.netWeight || '50g'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-stone-200/80 bg-stone-50/80 px-6 py-4 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            {parseResult ? (
              <span>
                Ready to commit <strong>{parseResult.validCount}</strong> valid products to Supabase PostgreSQL.
              </span>
            ) : (
              <span>Upload CSV or JSON to preview and validate catalog entries.</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
            {parseResult && parseResult.validCount > 0 && (
              <button
                onClick={handleExecuteImport}
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-[var(--bb-plum)] hover:bg-[#831843] disabled:opacity-60 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:shadow transition-all"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Importing into Database...</span>
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    <span>Import {parseResult.validCount} Valid Products</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
