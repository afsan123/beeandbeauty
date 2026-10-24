'use client';

import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';
import { calculateFreeShippingProgress } from '../../lib/cart';
import { formatPrice } from '../../lib/formatters';
import { cn } from '../../lib/cn';

export interface FreeShippingBarProps {
  subtotal: number;
  className?: string;
}

export function FreeShippingBar({ subtotal, className }: FreeShippingBarProps) {
  const { isUnlocked, remaining, percent } = calculateFreeShippingProgress(subtotal);

  return (
    <div
      className={cn(
        'bg-[#FFF9F5] p-3 rounded-[2px] border border-[#F0E6DD] text-[#2C2C2C] font-sans',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-2 text-xs">
        {isUnlocked ? (
          <>
            <CheckCircle2 size={16} className="text-[#2E7D32] shrink-0" />
            <span className="font-semibold text-[#2E7D32]">
              You have unlocked FREE Delivery across Bangladesh!
            </span>
          </>
        ) : (
          <>
            <Truck size={16} className="text-[#D4AF37] shrink-0" />
            <span className="font-medium text-[#2C2C2C]">
              Add <strong className="font-bold text-[#6A1B6D]">{formatPrice(remaining)}</strong> more to get <strong className="font-bold text-[#6A1B6D]">FREE Delivery</strong>
            </span>
          </>
        )}
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-[#EAE5E1] rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            isUnlocked ? 'bg-[#2E7D32]' : 'bg-[#6A1B6D]'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
