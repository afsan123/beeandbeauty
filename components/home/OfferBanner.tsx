'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, Copy, Check, ArrowRight } from 'lucide-react';

export interface OfferBannerProps {
  code?: string;
  headline?: string;
  description?: string;
  badge?: string;
  ctaHref?: string;
  ctaText?: string;
}

export function OfferBanner({
  code = 'BEE700',
  headline = 'Festive Glamour Celebration: Flat ৳700 Off',
  description = 'Enjoy an instant ৳700 discount on cart value over ৳2,999. Plus, complimentary tracked doorstep delivery across Bangladesh.',
  badge = 'Special Launch Offer',
  ctaHref = '/offers',
  ctaText = 'View All Offers',
}: OfferBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="py-8 md:py-12 bg-[#FFF9F5] border-y border-[#F0E6DD] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#521354] text-white rounded-[2px] p-6 sm:p-8 md:p-10 relative overflow-hidden shadow-xl border border-[#6A1B6D]">
          {/* Subtle gold line accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#F4E295] to-[#D4AF37]" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl text-center lg:text-left">
              <span className="inline-block text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#D4AF37] bg-black/20 px-3 py-1 rounded-[2px] mb-3 border border-[#D4AF37]/40">
                {badge}
              </span>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider font-serif text-white">
                {headline}
              </h3>
              <p className="text-xs sm:text-sm text-[#FCE4EC] mt-2 leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* Code Copy & CTA action block */}
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="flex items-center bg-black/40 border border-[#D4AF37]/50 px-3 py-2 rounded-[2px]">
                <Tag size={14} className="text-[#D4AF37] mr-2" />
                <span className="font-mono text-xs font-bold text-white tracking-widest mr-3">
                  {code}
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-[10px] font-bold uppercase tracking-wider text-[#D4AF37] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-[#25D366]" />
                      <span className="text-[#25D366]">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                href={ctaHref}
                className="flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8942A] text-[#2C2C2C] text-xs font-bold uppercase tracking-[0.14em] py-3 px-6 rounded-[2px] transition-all transform hover:-translate-y-0.5 shadow-sm"
              >
                <span>{ctaText}</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
