'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '../../lib/cn';

export interface LogoProps {
  variant?: 'header' | 'footer' | 'full' | 'symbol';
  className?: string;
  linkToHome?: boolean;
}

export function Logo({
  variant = 'header',
  className,
  linkToHome = true,
}: LogoProps) {
  const content = (() => {
    switch (variant) {
      case 'full':
        return (
          <div className={cn('flex flex-col items-center text-center', className)}>
            <div className="relative w-36 h-36 md:w-44 md:h-44">
              <Image
                src="/images/logo.png"
                alt="Bee & Beauty - Nature, refined."
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 144px, 176px"
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className={cn('flex flex-col items-start gap-3', className)}>
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/95 p-1 border border-[#D4AF37]/50 shadow-sm">
                <Image
                  src="/images/logo.png"
                  alt="Bee & Beauty Emblem"
                  fill
                  className="object-contain scale-110"
                  sizes="48px"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-[0.16em] uppercase font-bold text-white leading-tight">
                  <span className="text-[#FCE4EC]">BEE</span>{' '}
                  <span className="text-[#D4AF37]">&amp;</span>{' '}
                  <span className="text-white">BEAUTY</span>
                </span>
                <span className="text-[9px] tracking-[0.3em] uppercase text-[#D4AF37] font-medium mt-0.5">
                  Nature, refined.
                </span>
              </div>
            </div>
          </div>
        );

      case 'symbol':
        return (
          <div className={cn('relative w-10 h-10', className)}>
            <Image
              src="/images/logo.png"
              alt="Bee & Beauty Emblem"
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
        );

      case 'header':
      default:
        return (
          <div className={cn('flex items-center gap-2.5 select-none group', className)}>
            {/* Circular Emblem with official illustration */}
            <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden bg-white shadow-xs border border-[#F0E6DD] group-hover:border-[#D4AF37] transition-colors shrink-0">
              <Image
                src="/images/logo.png"
                alt="Bee & Beauty"
                fill
                priority
                className="object-contain scale-125 group-hover:scale-130 transition-transform duration-300"
                sizes="44px"
              />
            </div>

            {/* Typography Lockup */}
            <div className="flex flex-col text-left">
              <div className="font-serif text-lg md:text-xl font-bold tracking-[0.16em] uppercase leading-none transition-colors">
                <span className="text-[#C2188B]">BEE</span>{' '}
                <span className="text-[#D4AF37] text-base mx-0.5">&amp;</span>{' '}
                <span className="text-[#6A1B6D]">BEAUTY</span>
              </div>
              <span className="text-[8px] md:text-[9px] tracking-[0.32em] uppercase text-[#6A1B6D]/80 font-medium mt-1 font-sans">
                Nature, refined.
              </span>
            </div>
          </div>
        );
    }
  })();

  if (linkToHome) {
    return (
      <Link href="/" aria-label="Bee & Beauty - Nature, refined." className="inline-block">
        {content}
      </Link>
    );
  }

  return content;
}
