'use client';

import React, { useState, useRef } from 'react';

interface ImageUploadFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  recommendedDimensions?: string;
  required?: boolean;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  helperText,
  recommendedDimensions = '1000 x 1000 px (1:1 Square)',
  required = false,
}: ImageUploadFieldProps) {
  const [activeMode, setActiveMode] = useState<'upload' | 'url'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadFile = async (file: File) => {
    setErrorMsg(null);
    setPreviewError(false);

    // Validate size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('Image file exceeds the 10MB limit. Please upload a smaller image.');
      return;
    }

    // Validate type
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Selected file must be an image (JPG, PNG, WEBP, SVG, or GIF).');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      onChange(data.url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
    }
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
      handleUploadFile(file);
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setErrorMsg(null);
    setPreviewError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const hasImage = Boolean(value && value.trim());

  return (
    <div className="space-y-2">
      {/* Header with Mode Switcher */}
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs font-bold text-stone-800">
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
          {helperText && (
            <p className="text-[10px] text-stone-500 mt-0.5">{helperText}</p>
          )}
        </div>

        <div className="flex items-center rounded-lg bg-stone-100 p-0.5 text-[11px] font-medium text-stone-600">
          <button
            type="button"
            onClick={() => setActiveMode('upload')}
            className={`rounded-md px-2.5 py-1 transition-all ${
              activeMode === 'upload'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            📁 Upload
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('url')}
            className={`rounded-md px-2.5 py-1 transition-all ${
              activeMode === 'url'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            🔗 URL
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error alert if any */}
      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span>⚠</span>
            <span>{errorMsg}</span>
          </span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            className="text-rose-400 hover:text-rose-700 ml-2 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Display Active Image Preview Card if an image is set */}
      {hasImage && !isUploading ? (
        <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3 flex items-center gap-3.5 transition-all hover:border-[var(--bb-gold)]">
          {/* Thumbnail */}
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-stone-200 bg-white shadow-xs">
            {previewError ? (
              <div className="flex h-full w-full items-center justify-center bg-stone-100 text-[10px] text-stone-400 text-center p-1">
                Invalid Image
              </div>
            ) : (
              <img
                src={value}
                alt={label}
                onError={() => setPreviewError(true)}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
              />
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-block rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Active Image
              </span>
              <span className="text-[10px] text-stone-400">
                {recommendedDimensions}
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-stone-600 truncate" title={value}>
              {value}
            </p>

            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--bb-plum)] hover:underline"
              >
                <span>🔄 Replace</span>
              </button>
              <span className="text-stone-300">•</span>
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-stone-500 hover:text-stone-800"
              >
                <span>👁️ View Full</span>
              </a>
              <span className="text-stone-300">•</span>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 hover:underline"
              >
                <span>🗑️ Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : isUploading ? (
        /* Uploading Spinner State */
        <div className="rounded-xl border border-dashed border-[var(--bb-plum)] bg-purple-50/50 p-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mb-2" />
          <p className="text-xs font-bold text-stone-800">Uploading image to cloud storage...</p>
          <p className="text-[10px] text-stone-500 mt-0.5">Optimizing and generating high-speed CDN URL</p>
        </div>
      ) : activeMode === 'upload' ? (
        /* Drag & Drop Upload Zone */
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
            dragActive
              ? 'border-[var(--bb-plum)] bg-purple-50/60 scale-[1.01]'
              : 'border-stone-200 bg-stone-50/60 hover:border-[var(--bb-gold)] hover:bg-amber-50/30'
          }`}
        >
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-xs border border-stone-100 text-lg mb-2">
            📸
          </div>
          <p className="text-xs font-bold text-stone-800">
            <span className="text-[var(--bb-plum)] underline decoration-[var(--bb-gold)] underline-offset-2">
              Click to browse
            </span>{' '}
            or drag & drop
          </p>
          <p className="text-[10px] text-stone-500 mt-1">
            PNG, JPG, WEBP, or SVG up to 10MB ({recommendedDimensions})
          </p>
        </div>
      ) : (
        /* Manual URL Paste Mode */
        <div className="space-y-1.5">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setPreviewError(false);
              onChange(e.target.value);
            }}
            placeholder="e.g. https://... or /images/products/sample.jpg"
            className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs focus:border-[var(--bb-plum)] outline-none font-mono"
          />
          <p className="text-[10px] text-stone-400">
            Accepts external HTTPS CDN URLs or internal paths starting with{' '}
            <code className="text-stone-600 bg-stone-100 px-1 py-0.5 rounded">/images/products/</code>
          </p>
        </div>
      )}
    </div>
  );
}
