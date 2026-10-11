'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, ShieldCheck, Leaf, Eye, Target, ArrowRight } from 'lucide-react';

export function FounderNote() {
  return (
    <section className="py-14 md:py-20 bg-[#FFF9F5] border-t border-b border-[#F0E6DD] font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
            Nature, refined.
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.12em] text-[#6A1B6D] font-serif">
            Luxury Beauty, Formulated for Bangladesh
          </h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto my-4" />
          <p className="text-xs sm:text-sm md:text-base text-[#666666] leading-relaxed font-light">
            Bee &amp; Beauty was born from a clear conviction: you deserve makeup formulated specifically for your undertones, lifestyle, and weather &mdash; never compromised, never settling. We harmonize apicultural nectar extracts with modern featherweight pigments.
          </p>
        </div>

        {/* Vision & Mission Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-7 rounded-[2px] border border-[#F0E6DD] shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#6A1B6D] mb-2 font-serif font-bold text-lg">
              <Eye size={20} className="text-[#D4AF37]" />
              <span>Our Vision</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              To become a trusted beauty and skincare destination in Bangladesh, helping customers discover products that fit their beauty needs and personal routines.
            </p>
          </div>

          <div className="bg-white p-7 rounded-[2px] border border-[#F0E6DD] shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#6A1B6D] mb-2 font-serif font-bold text-lg">
              <Target size={20} className="text-[#C2188B]" />
              <span>Our Mission</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              To make beauty shopping more convenient, transparent, and trustworthy through clear product information, responsive support, and understandable policies.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] flex items-center justify-center text-[#D4AF37] mb-3">
              <Leaf size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              Botanical Infusion
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Enriched with ethically harvested royal jelly, honey nectar, and nourishing seed oils.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] flex items-center justify-center text-[#C2188B] mb-3">
              <Heart size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              100% Cruelty-Free
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Humanely certified. We never test on animals at any stage of product development.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] flex items-center justify-center text-[#6A1B6D] mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              Custom Undertones
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Calibrated specifically to enhance golden, neutral, and warm South Asian undertones.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] flex items-center justify-center text-[#2E7D32] mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              Dermatologist Tested
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Hypoallergenic and non-comedogenic formulations safe for sensitive, humid-weather skin.
            </p>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6A1B6D] hover:text-[#C2188B] border-b border-[#6A1B6D] pb-1 transition-colors"
          >
            <span>Read More About Our Story &amp; Values</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </section>
  );
}
