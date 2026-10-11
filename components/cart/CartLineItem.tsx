'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { CartItem } from '../../data/types';
import { Price } from '../ui/Price';
import { QuantityStepper } from '../ui/QuantityStepper';

export interface CartLineItemProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartLineItem({
  item,
  onUpdateQuantity,
  onRemove,
}: CartLineItemProps) {
  return (
    <div className="flex gap-3 py-3.5 border-b border-neutral-100 last:border-b-0 items-start">
      {/* Product Image */}
      <Link
        href={`/product/${item.productSlug}`}
        className="relative w-18 h-18 bg-[#FBFBFA] rounded-[2px] overflow-hidden shrink-0 border border-neutral-200/80"
      >
        <Image
          src={item.image}
          alt={item.title}
          fill
          sizes="72px"
          className="object-cover"
        />
      </Link>

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              href={`/product/${item.productSlug}`}
              className="text-xs font-semibold text-[#111111] hover:text-[#C5A059] line-clamp-1 transition-colors"
            >
              {item.title}
            </Link>
            <button
              type="button"
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.title} from cart`}
              className="text-neutral-400 hover:text-[#C53030] transition-colors p-0.5 cursor-pointer"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {/* Selected Shade */}
          {item.selectedShade && (
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-neutral-600">
              <span
                className="w-2.5 h-2.5 rounded-full border border-neutral-300 shrink-0"
                style={{ backgroundColor: item.selectedShade.hexColor }}
              />
              <span className="truncate">
                {item.selectedShade.code} {item.selectedShade.name}
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Quantity Stepper */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <Price
            price={item.price * item.quantity}
            compareAtPrice={
              item.compareAtPrice ? item.compareAtPrice * item.quantity : undefined
            }
            size="sm"
          />

          <QuantityStepper
            value={item.quantity}
            onChange={(q) => onUpdateQuantity(item.id, q)}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
