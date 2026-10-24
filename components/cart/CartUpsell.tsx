'use client';

import React from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { Product } from '../../data/types';
import { formatPrice } from '../../lib/formatters';

export interface CartUpsellProps {
  products: Product[];
  onAddUpsell: (product: Product) => void;
}

export function CartUpsell({ products, onAddUpsell }: CartUpsellProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="border-t border-neutral-200 pt-3">
      <h4 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-2.5">
        Recommended Add-ons
      </h4>

      <div className="space-y-2">
        {products.slice(0, 3).map((prod) => (
          <div
            key={prod.id}
            className="flex items-center justify-between gap-2.5 p-2 bg-[#FAF8F5] border border-[#EAE2D5] rounded-[2px]"
          >
            <div className="relative w-12 h-12 bg-white rounded-[2px] overflow-hidden shrink-0 border border-neutral-200">
              <Image
                src={prod.images.primary}
                alt={prod.title}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#111111] truncate">
                {prod.title}
              </p>
              <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                {formatPrice(prod.price)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onAddUpsell(prod)}
              className="shrink-0 flex items-center gap-1 bg-white hover:bg-[#111111] text-[#111111] hover:text-white border border-neutral-300 hover:border-[#111111] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-[2px] transition-colors cursor-pointer"
            >
              <Plus size={12} />
              <span>Add</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
