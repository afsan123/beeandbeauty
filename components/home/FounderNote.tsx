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
            Luxury Cosmetics &amp; Clean Skincare, Formulated for Bangladesh
          </h2>
          <div className="w-12 h-0.5 bg-[#D4AF37] mx-auto my-4" />
          <p className="text-xs sm:text-sm md:text-base text-[#666666] leading-relaxed font-light">
            Bee &amp; Beauty was born from a clear conviction: you deserve both high-efficacy skincare rituals and weightless luxury cosmetics formulated specifically for South Asian undertones, skin barrier health, and humid tropical weather &mdash; never compromised, never settling. We harmonize apicultural raw honey and propolis with clinical barrier ceramides and modern velvet pigments.
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
              To become the foremost luxury cosmetics and clean skincare destination in Bangladesh, empowering customers through dermatologist-conscious formulations and transformative beauty rituals.
            </p>
          </div>

          <div className="bg-white p-7 rounded-[2px] border border-[#F0E6DD] shadow-2xs">
            <div className="flex items-center gap-2.5 text-[#6A1B6D] mb-2 font-serif font-bold text-lg">
              <Target size={20} className="text-[#3E6351]" />
              <span>Our Mission</span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed">
              To unite high-performance color artistry with clinical skin barrier care through transparent ingredient standards, responsive concierge guidance, and trustworthy nationwide service.
            </p>
          </div>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FEF7ED] flex items-center justify-center text-[#E5A93C] mb-3">
              <Leaf size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              Raw Propolis &amp; Nectar
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Enriched with ethically harvested royal jelly, raw honey propolis, and bio-identical squalane.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#EBF3EE] flex items-center justify-center text-[#3E6351] mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3E6351] mb-1.5 font-serif">
              Dermatologist Tested
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Barrier-safe, non-comedogenic, and hypoallergenic formulations proven for tropical climates.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FFF9F5] flex items-center justify-center text-[#6A1B6D] mb-3">
              <Sparkles size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              Bespoke Undertones
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Calibrated specifically to enhance golden, olive, and warm South Asian complexions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] text-center flex flex-col items-center shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FCE4EC] flex items-center justify-center text-[#C2188B] mb-3">
              <Heart size={22} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-1.5 font-serif">
              100% Cruelty-Free
            </h3>
            <p className="text-[11px] text-[#666666] leading-relaxed">
              Ethically crafted with zero animal testing across every phase of formulation and production.
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
