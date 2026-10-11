'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '../ui/Badge';
import { ProductBadge } from '../../data/types';
import { cn } from '../../lib/cn';

export interface ImageGalleryProps {
  images: string[];
  title: string;
  badges?: ProductBadge[];
}

export function ImageGallery({ images, title, badges = [] }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] || images[0];

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 w-full">
      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto no-scrollbar max-h-[520px] shrink-0">
          {images.map((img, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  'relative w-16 h-16 md:w-20 md:h-20 border rounded-[2px] overflow-hidden shrink-0 transition-all cursor-pointer bg-[#FBFBFA]',
                  isActive
                    ? 'border-[#111111] ring-2 ring-[#111111] ring-offset-1'
                    : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                )}
                aria-label={`View image ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Large Display Preview */}
      <div className="relative aspect-square w-full bg-[#FBFBFA] border border-neutral-200/80 rounded-[2px] overflow-hidden flex-1 shadow-xs">
        {activeImage && (
          <Image
            src={activeImage}
            alt={title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain p-4 transition-transform duration-300 hover:scale-105"
          />
        )}

        {/* Floating Badges */}
        {badges.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10 pointer-events-none">
            {badges.map((b, i) => (
              <Badge key={i} type={b.type} label={b.label} size="md" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
