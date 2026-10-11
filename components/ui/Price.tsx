import React from 'react';
import { cn } from '../../lib/cn';
import { calculateDiscountPercentage, formatPrice, hasDiscount } from '../../lib/price';

export interface PriceProps {
  price: number;
  compareAtPrice?: number;
  showDiscountBadge?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Price({
  price,
  compareAtPrice,
  showDiscountBadge = true,
  size = 'md',
  className,
}: PriceProps) {
  const isDiscounted = hasDiscount(price, compareAtPrice);
  const discountPercent = calculateDiscountPercentage(price, compareAtPrice);

  const sizeClasses = {
    sm: {
      current: 'text-xs font-bold text-[#6A1B6D]',
      compare: 'text-[11px] text-[#888888] line-through',
      discount: 'text-[10px] text-[#C2188B] font-semibold',
    },
    md: {
      current: 'text-sm font-bold text-[#6A1B6D]',
      compare: 'text-xs text-[#888888] line-through',
      discount: 'text-[11px] text-[#C2188B] font-semibold',
    },
    lg: {
      current: 'text-lg font-bold text-[#6A1B6D]',
      compare: 'text-sm text-[#888888] line-through',
      discount: 'text-xs text-[#C2188B] font-semibold',
    },
    xl: {
      current: 'text-2xl font-bold text-[#6A1B6D]',
      compare: 'text-base text-[#888888] line-through',
      discount: 'text-sm text-[#C2188B] font-bold',
    },
  };

  const currentStyles = sizeClasses[size];

  return (
    <div className={cn('inline-flex items-baseline gap-2 flex-wrap font-sans', className)}>
      <span className={currentStyles.current}>{formatPrice(price)}</span>

      {isDiscounted && compareAtPrice && (
        <>
          <span className={currentStyles.compare}>
            {formatPrice(compareAtPrice)}
          </span>

          {showDiscountBadge && discountPercent > 0 && (
            <span className={currentStyles.discount}>
              | {discountPercent}% Off
            </span>
          )}
        </>
      )}
    </div>
  );
}
