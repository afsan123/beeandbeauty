import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface RatingProps {
  rating: number; // e.g. 4.8
  reviewCount?: number; // e.g. 791
  size?: 'sm' | 'md';
  showCount?: boolean;
  className?: string;
}

export function Rating({
  rating,
  reviewCount,
  size = 'sm',
  showCount = true,
  className,
}: RatingProps) {
  const iconSize = size === 'sm' ? 12 : 14;
  const roundedRating = Math.round(rating);

  return (
    <div className={cn('inline-flex items-center gap-1.5 select-none', className)}>
      <div className="flex items-center text-[#111111]" aria-label={`${rating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= roundedRating;
          return (
            <Star
              key={starIndex}
              size={iconSize}
              className={cn(
                'transition-colors',
                isFilled
                  ? 'fill-[#111111] text-[#111111]'
                  : 'fill-neutral-200 text-neutral-300'
              )}
            />
          );
        })}
      </div>

      {showCount && typeof reviewCount === 'number' && (
        <span className="text-[11px] text-[#666666] font-medium leading-none">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
