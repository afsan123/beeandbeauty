'use client';

import React from 'react';
import { FilterState } from '../../data/types';
import { CATEGORIES } from '../../data/mock/catalogData';

export interface FilterSidebarProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalProductsCount: number;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  totalProductsCount,
}: FilterSidebarProps) {
  const handleInStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, inStockOnly: e.target.checked });
  };

  const handlePriceChange = (min: number, max: number) => {
    onChange({ ...filters, minPrice: min, maxPrice: max });
  };

  const handleRatingChange = (rating: number) => {
    onChange({ ...filters, ratingMin: filters.ratingMin === rating ? 0 : rating });
  };

  const handleBadgeChange = (badgeType: string) => {
    onChange({ ...filters, badge: filters.badge === badgeType ? undefined : badgeType });
  };

  return (
    <aside className="w-full space-y-6 text-xs text-[#222222]">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
        <span className="font-bold uppercase tracking-wider text-sm text-[#111111]">
          Filters ({totalProductsCount})
        </span>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-[#C5A059] hover:underline font-semibold uppercase tracking-wider cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* 1. In Stock Only */}
      <div className="pb-4 border-b border-neutral-100">
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filters.inStockOnly}
            onChange={handleInStockChange}
            className="w-4 h-4 accent-[#111111] rounded cursor-pointer"
          />
          <span className="font-medium text-xs text-[#111111]">In Stock Only</span>
        </label>
      </div>

      {/* 2. Categories */}
      <div className="pb-5 border-b border-neutral-100 space-y-2">
        <div className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
          Category
        </div>
        <div className="space-y-1.5 pt-1">
          <label className="flex items-center gap-2 cursor-pointer select-none py-0.5">
            <input
              type="radio"
              name="category"
              checked={!filters.category || filters.category === 'all'}
              onChange={() => onChange({ ...filters, category: 'all' })}
              className="accent-[#111111]"
            />
            <span>All Categories</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat.id} className="flex items-center gap-2 cursor-pointer select-none py-0.5">
              <input
                type="radio"
                name="category"
                checked={filters.category === cat.slug}
                onChange={() => onChange({ ...filters, category: cat.slug })}
                className="accent-[#111111]"
              />
              <span>{cat.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 3. Price Range */}
      <div className="pb-5 border-b border-neutral-100 space-y-3">
        <div className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
          Price Range (BDT ৳)
        </div>

        <div className="flex items-center gap-2">
          <div className="flex-1">
            <span className="text-[10px] text-neutral-500 block mb-1">Min</span>
            <input
              type="number"
              min={0}
              max={filters.maxPrice}
              value={filters.minPrice}
              onChange={(e) => handlePriceChange(Number(e.target.value) || 0, filters.maxPrice)}
              className="w-full bg-neutral-50 border border-neutral-300 px-2 py-1.5 text-xs rounded-xs"
            />
          </div>
          <span className="text-neutral-400 pt-4">-</span>
          <div className="flex-1">
            <span className="text-[10px] text-neutral-500 block mb-1">Max</span>
            <input
              type="number"
              min={filters.minPrice}
              max={3500}
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange(filters.minPrice, Number(e.target.value) || 3500)}
              className="w-full bg-neutral-50 border border-neutral-300 px-2 py-1.5 text-xs rounded-xs"
            />
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={3500}
          step={50}
          value={filters.maxPrice}
          onChange={(e) => handlePriceChange(filters.minPrice, Number(e.target.value))}
          className="w-full accent-[#111111] cursor-pointer"
        />
      </div>

      {/* 4. Minimum Rating */}
      <div className="pb-5 border-b border-neutral-100 space-y-2">
        <div className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
          Rating
        </div>
        <div className="space-y-1.5 pt-1">
          {[4.8, 4.5, 4.0].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => handleRatingChange(rate)}
              className={`w-full flex items-center justify-between py-1.5 px-2 rounded-xs text-xs font-medium cursor-pointer transition-colors ${
                filters.ratingMin === rate
                  ? 'bg-neutral-100 text-[#111111] font-bold'
                  : 'text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <span>{rate} Stars &amp; Above</span>
              <span className="text-[#C5A059]">★</span>
            </button>
          ))}
        </div>
      </div>

      {/* 5. Badges & Collections */}
      <div className="space-y-2">
        <div className="font-bold uppercase tracking-wider text-[11px] text-neutral-400">
          Collection Badges
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['bestseller', 'new', 'sale'].map((badgeType) => {
            const isSelected = filters.badge === badgeType;
            return (
              <button
                key={badgeType}
                type="button"
                onClick={() => handleBadgeChange(badgeType)}
                className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1.5 rounded-xs border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#111111] text-white border-[#111111]'
                    : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-500'
                }`}
              >
                {badgeType === 'new' ? 'New Launches' : badgeType === 'bestseller' ? 'Bestsellers' : 'On Sale'}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
