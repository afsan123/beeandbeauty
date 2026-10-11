'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (newValue: number) => void;
  size?: 'sm' | 'md';
  className?: string;
  disabled?: boolean;
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = 'md',
  className,
  disabled = false,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  const isAtMin = value <= min || disabled;
  const isAtMax = value >= max || disabled;

  const sizeStyles = {
    sm: 'h-7 text-xs',
    md: 'h-9 text-sm',
  };

  const buttonSize = size === 'sm' ? 12 : 14;

  return (
    <div
      className={cn(
        'inline-flex items-center border border-neutral-300 bg-white select-none rounded-[2px]',
        sizeStyles[size],
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={isAtMin}
        aria-label="Decrease quantity"
        className="px-2.5 h-full flex items-center justify-center text-[#222222] hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <Minus size={buttonSize} />
      </button>

      <span className="min-w-8 text-center font-medium text-[#111111] px-1">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={isAtMax}
        aria-label="Increase quantity"
        className="px-2.5 h-full flex items-center justify-center text-[#222222] hover:bg-neutral-100 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
      >
        <Plus size={buttonSize} />
      </button>
    </div>
  );
}
