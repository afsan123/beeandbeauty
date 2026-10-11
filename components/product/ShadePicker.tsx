'use client';

import React, { useState } from 'react';
import { Shade } from '../../data/types';
import { cn } from '../../lib/cn';

export interface ShadePickerProps {
  shades: Shade[];
  selectedShade?: Shade;
  onSelectShade: (shade: Shade) => void;
}

export function ShadePicker({
  shades,
  selectedShade,
  onSelectShade,
}: ShadePickerProps) {
  const [familyFilter, setFamilyFilter] = useState<string>('all');

  if (shades.length === 0) return null;

  // Extract available families
  const families = ['all', ...Array.from(new Set(shades.map((s) => s.family)))];

  const filteredShades =
    familyFilter === 'all'
      ? shades
      : shades.filter((s) => s.family === familyFilter);

  return (
    <div className="space-y-3 py-2 border-y border-[#F0E6DD] font-sans">
      {/* Active Shade Header & Count */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-[#6A1B6D] uppercase tracking-wider">
            Color:
          </span>
          <span className="font-semibold text-[#D4AF37]">
            {selectedShade ? selectedShade.name : 'Select a Shade'}
          </span>
        </div>
        <span className="text-[11px] text-neutral-500 font-medium">
          {shades.length} {shades.length === 1 ? 'Shade' : 'Shades'}
        </span>
      </div>

      {/* Family Tabs (only if more than 1 family exists) */}
      {families.length > 2 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {families.map((fam) => (
            <button
              key={fam}
              type="button"
              onClick={() => setFamilyFilter(fam)}
              className={cn(
                'text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-[2px] transition-colors cursor-pointer',
                familyFilter === fam
                  ? 'bg-[#6A1B6D] text-white'
                  : 'bg-[#FFF9F5] border border-[#F0E6DD] text-[#666666] hover:bg-[#FCE4EC]'
              )}
            >
              {fam === 'all' ? 'All Shades' : fam}
            </button>
          ))}
        </div>
      )}

      {/* Visual Swatch Circles Grid */}
      <div className="flex items-center gap-2.5 flex-wrap pt-1">
        {filteredShades.map((shade) => {
          const isSelected = selectedShade?.id === shade.id;
          const isOutOfStock = !shade.inStock;

          return (
            <button
              key={shade.id}
              type="button"
              disabled={isOutOfStock}
              onClick={() => onSelectShade(shade)}
              aria-label={`Shade ${shade.name} ${isOutOfStock ? '(Sold Out)' : ''}`}
              title={`${shade.name} ${isOutOfStock ? '(Sold Out)' : ''}`}
              className={cn(
                'relative w-7 h-7 rounded-full transition-transform cursor-pointer flex items-center justify-center',
                isSelected
                  ? 'ring-2 ring-offset-2 ring-[#6A1B6D] scale-110'
                  : 'hover:scale-105',
                isOutOfStock && 'opacity-40 cursor-not-allowed'
              )}
              style={{ backgroundColor: shade.hexColor }}
            >
              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-0.5 bg-neutral-900 rotate-45" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
