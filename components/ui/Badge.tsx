import React from 'react';
import { cn } from '../../lib/cn';

export interface BadgeProps {
  type?: 'new' | 'bestseller' | 'sale' | 'exclusive' | 'limited' | 'custom';
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function Badge({
  type = 'custom',
  label,
  className,
  size = 'md',
}: BadgeProps) {
  const typeStyles = {
    new: 'bg-[#6A1B6D] text-white',
    bestseller: 'bg-[#D4AF37] text-white font-bold',
    sale: 'bg-[#C2188B] text-white font-semibold',
    exclusive: 'bg-[#FCE4EC] text-[#6A1B6D] border border-[#C2188B]/40 font-semibold',
    limited: 'bg-[#A98724] text-white',
    custom: 'bg-[#6A1B6D] text-white',
  };

  const sizeStyles = {
    sm: 'text-[9px] px-1.5 py-0.5 tracking-wider',
    md: 'text-[10px] px-2.5 py-1 tracking-widest',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center uppercase font-medium leading-none select-none rounded-[2px]',
        typeStyles[type],
        sizeStyles[size],
        className
      )}
    >
      {label}
    </span>
  );
}
