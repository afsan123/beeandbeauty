'use client';

import React from 'react';
import { cn } from '../../lib/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'magenta' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium uppercase tracking-[0.14em] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.99] rounded-[2px] font-sans';

    const variantStyles = {
      primary: 'bg-[#6A1B6D] text-white hover:bg-[#521354] border border-[#6A1B6D] shadow-xs',
      secondary: 'bg-[#FFF9F5] text-[#6A1B6D] hover:bg-[#FCE4EC] border border-[#F0E6DD]',
      outline: 'bg-transparent text-[#6A1B6D] border border-[#6A1B6D] hover:bg-[#6A1B6D] hover:text-white',
      gold: 'bg-[#D4AF37] text-white hover:bg-[#B8942A] border border-[#D4AF37] shadow-xs',
      magenta: 'bg-[#C2188B] text-white hover:bg-[#9E1370] border border-[#C2188B] shadow-xs',
      ghost: 'bg-transparent text-[#2C2C2C] hover:bg-[#FCE4EC]/50 border border-transparent',
      danger: 'bg-[#C53030] text-white hover:bg-[#9B2C2C] border border-[#C53030]',
    };

    const sizeStyles = {
      sm: 'text-[11px] px-3.5 py-1.5 h-8',
      md: 'text-xs px-5 py-2.5 h-11',
      lg: 'text-sm px-7 py-3.5 h-13',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
