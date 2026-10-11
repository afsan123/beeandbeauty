'use client';

import React from 'react';
import { SortOption } from '../../data/types';

export interface SortDropdownProps {
  value: SortOption;
  onChange: (option: SortOption) => void;
}

export function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-bold uppercase tracking-wider text-neutral-500 shrink-0">
        Sort By:
      </label>
      <select
        id="sort-select"
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        className="bg-white border border-neutral-300 text-xs font-medium text-[#111111] px-3 py-2 rounded-xs focus:outline-hidden focus:border-black cursor-pointer uppercase tracking-wider"
      >
        <option value="featured">Featured</option>
        <option value="bestselling">Bestselling</option>
        <option value="price-asc">Price: Low to High</option>
        <option value="price-desc">Price: High to Low</option>
        <option value="rating">Highest Rated</option>
        <option value="newest">New Launches</option>
      </select>
    </div>
  );
}
