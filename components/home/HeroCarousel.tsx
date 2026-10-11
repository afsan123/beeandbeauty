'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface HeroSlide {
  id: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  bgColor: string;
  accentColor: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    tagline: 'LUXURY COSMETICS | NEW LAUNCH',
    title: 'ROYAL VELVET MATTE LIPSTICK',
    subtitle: 'Infused with botanical royal jelly & honey nectar. 16-hour weightless comfort in bespoke shades for South Asian complexions.',
    ctaText: 'Shop Lipsticks',
    ctaHref: '/shop/lips',
    secondaryCtaText: 'Explore Makeup',
    secondaryCtaHref: '/shop/all',
    bgColor: 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]',
    accentColor: '#D4AF37',
  },
  {
    id: 'slide-2',
    tagline: 'DERMATOLOGICALLY TESTED | CLEAN SKINCARE',
    title: 'HONEY BARRIER REPAIR & GLOW SERUM',
    subtitle: 'Raw propolis, 5% niacinamide & ceramide NP. Rebuilds compromised moisture barriers, calms redness, and unlocks an effortless glass glow.',
    ctaText: 'Shop Skincare',
    ctaHref: '/shop/skin',
    secondaryCtaText: 'View All Rituals',
    secondaryCtaHref: '/shop/skin',
    bgColor: 'from-[#1B3828] via-[#2A4D39] to-[#14261C]',
    accentColor: '#F4D06F',
  },
  {
    id: 'slide-3',
    tagline: 'SKINCARE-INFUSED BASE | SOUTH ASIAN TONES',
    title: 'HONEY SILK HD SERUM FOUNDATION',
    subtitle: 'Flawless luminous coverage with SPF 30 & antioxidant propolis. Breathable skin-first makeup engineered for warm & olive undertones.',
    ctaText: 'Find Your Shade',
    ctaHref: '/shop/face',
    secondaryCtaText: 'Explore Face',
    secondaryCtaHref: '/shop/face',
    bgColor: 'from-[#4E243B] via-[#6E3052] to-[#341627]',
    accentColor: '#D4AF37',
  },
  {
    id: 'slide-4',
    tagline: 'CURATED BEAUTY & SKINCARE VAULTS',
    title: 'THE QUEEN BEE LUXE BOX',
    subtitle: 'Complete luxury rituals pairing barrier skincare with high-pigment cosmetics in gold-embossed keepsake packaging. Nationwide delivery.',
    ctaText: 'Shop Gift Sets',
    ctaHref: '/shop/kits',
    secondaryCtaText: 'View Deals',
    secondaryCtaHref: '/offers',
    bgColor: 'from-[#3A0C3C] via-[#5C165F] to-[#2B082D]',
    accentColor: '#F4E295',
  },
];

export function HeroCarousel() {
  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_SLIDES);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadRemoteBanners() {
      try {
        const res = await fetch('/api/banners');
        if (res.ok) {
          const data = await res.json();
          if (data.banners && data.banners.length > 0 && isMounted) {
            const mapped: HeroSlide[] = data.banners.map((b: any) => ({
              id: b.id,
              tagline: b.tagline || 'BEE & BEAUTY EXCLUSIVE',
              title: b.title,
              subtitle: b.subtitle || '',
              ctaText: b.ctaText,
              ctaHref: b.ctaHref,
              secondaryCtaText: b.secondaryCtaText,
              secondaryCtaHref: b.secondaryCtaHref,
              bgColor: b.bgColor || 'from-[#4A104C] via-[#6A1B6D] to-[#360C38]',
              accentColor: b.accentColor || '#D4AF37',
            }));
            setSlides(mapped);
          }
        }
      } catch {
        // Fallback to DEFAULT_SLIDES
      }
    }
    loadRemoteBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIdx((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setCurrentIdx((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [nextSlide, isPaused, totalSlides]);

  return (
    <div
      className="relative w-full h-[460px] sm:h-[520px] md:h-[600px] overflow-hidden select-none bg-[#360C38] text-white font-sans"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full h-full">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIdx;

          return (
            <div
              key={slide.id}
              className={cn(
                'absolute inset-0 flex items-center justify-center transition-opacity duration-700 ease-in-out bg-gradient-to-r',
                slide.bgColor,
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              )}
            >
              {/* Subtle luxury geometric pattern */}
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:24px_24px]" />

              <div className="relative max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center">
                {/* Tagline */}
                <span
                  className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-[2px] mb-3 md:mb-4 border border-[#D4AF37]/50 bg-black/25 backdrop-blur-xs text-[#D4AF37]"
                >
                  {slide.tagline}
                </span>

                {/* Headline */}
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider leading-tight font-serif max-w-4xl text-white">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="text-xs sm:text-sm md:text-base text-[#FCE4EC] mt-3 md:mt-4 max-w-2xl font-light leading-relaxed">
                  {slide.subtitle}
                </p>

                {/* CTAs */}
                <div className="flex items-center gap-3.5 mt-6 md:mt-8 flex-wrap justify-center">
                  <Link
                    href={slide.ctaHref}
                    className="bg-[#D4AF37] hover:bg-[#B8942A] text-[#2C2C2C] text-xs md:text-sm font-bold uppercase tracking-[0.14em] py-3 md:py-3.5 px-6 md:px-8 rounded-[2px] transition-all transform hover:-translate-y-0.5 shadow-md"
                  >
                    {slide.ctaText}
                  </Link>

                  {slide.secondaryCtaText && slide.secondaryCtaHref && (
                    <Link
                      href={slide.secondaryCtaHref}
                      className="border border-[#FCE4EC]/50 hover:border-white text-white hover:bg-white/10 text-xs md:text-sm font-semibold uppercase tracking-[0.14em] py-3 md:py-3.5 px-6 md:px-8 rounded-[2px] transition-all backdrop-blur-xs"
                    >
                      {slide.secondaryCtaText}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Prev / Next Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#6A1B6D] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs hover:scale-105"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-black/40 hover:bg-[#6A1B6D] border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs hover:scale-105"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIdx(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={cn(
                  'h-1.5 transition-all rounded-full cursor-pointer',
                  idx === currentIdx
                    ? 'w-7 bg-[#D4AF37]'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
