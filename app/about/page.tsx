import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Shield, Heart, Award, ArrowRight, Eye, Target } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { PolicyDisclaimer } from '../../components/ui/PolicyDisclaimer';

export const metadata: Metadata = {
  title: 'Our Story & Brand Philosophy | Bee & Beauty Bangladesh',
  description:
    'Bee & Beauty: Nature, refined. Discover our apicultural formulations, vision, mission, and clean cosmetics designed for Bangladesh.',
};

export default function AboutPage() {
  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-16 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">About Bee &amp; Beauty</span>
      </nav>

      {/* Official Logo & Hero Intro */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <div className="mb-6 flex justify-center">
          <Logo variant="full" linkToHome={false} />
        </div>

        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
          Nature, refined.
        </span>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif leading-tight">
          Modern Beauty Inspired By Nature
        </h1>
        <div className="w-16 h-0.5 bg-[#D4AF37] mx-auto my-6" />
        <p className="text-xs sm:text-sm md:text-base text-[#666666] leading-relaxed font-light">
          Bee &amp; Beauty is a premium-inspired, modern, clean, and customer-focused cosmetics destination crafted for Bangladesh. We celebrate the beauty of South Asian complexions through skincare-infused formulas enriched with pure honey nectar, royal jelly extracts, and featherweight mineral pigments.
        </p>
      </div>

      {/* Official Vision & Mission (Section 13) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
        {/* Vision Card */}
        <div className="bg-white border border-[#F0E6DD] p-8 rounded-[2px] shadow-2xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#6A1B6D] mb-4">
            <Eye size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">
            Our Destination
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            Our Vision
          </h2>
          <p className="text-xs sm:text-sm text-[#2C2C2C] leading-relaxed font-light">
            &ldquo;To become a trusted beauty and skincare destination in Bangladesh, helping customers discover products that fit their beauty needs and personal routines.&rdquo;
          </p>
        </div>

        {/* Mission Card */}
        <div className="bg-white border border-[#F0E6DD] p-8 rounded-[2px] shadow-2xs relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#C2188B]/40 flex items-center justify-center text-[#C2188B] mb-4">
            <Target size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2188B] block mb-1">
            Our Commitment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            Our Mission
          </h2>
          <p className="text-xs sm:text-sm text-[#2C2C2C] leading-relaxed font-light">
            &ldquo;To make beauty and skincare shopping more convenient, transparent, and trustworthy through clear product information, a smooth shopping experience, responsive customer support, and understandable delivery and return policies.&rdquo;
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mb-16">
        <PolicyDisclaimer
          title="Vision & Mission Note: Draft for Development"
          message="Vision and mission formulations represent the approved development direction and are pending final formal sign-off by the business owner before launch."
        />
      </div>

      {/* Stats Counter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20 max-w-5xl mx-auto">
        <div className="bg-white border border-[#F0E6DD] p-6 text-center rounded-[2px] shadow-2xs">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#6A1B6D] font-serif">24h</div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Target Dhaka Delivery</div>
        </div>
        <div className="bg-white border border-[#F0E6DD] p-6 text-center rounded-[2px] shadow-2xs">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#D4AF37] font-serif">100%</div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Cruelty-Free Certified</div>
        </div>
        <div className="bg-white border border-[#F0E6DD] p-6 text-center rounded-[2px] shadow-2xs">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#6A1B6D] font-serif">64</div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Districts Covered</div>
        </div>
        <div className="bg-white border border-[#F0E6DD] p-6 text-center rounded-[2px] shadow-2xs">
          <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#C2188B] font-serif">3-Day</div>
          <div className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1 font-semibold">Reporting Window</div>
        </div>
      </div>

      {/* 3 Story Chapters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-5xl mx-auto">
        <div className="bg-white border border-[#F0E6DD] p-8 rounded-[2px] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] text-[#D4AF37] flex items-center justify-center mb-4">
            <Sparkles size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
            The Honey Nectar Complex
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed font-light">
            Every product in our collection harnesses pure botanical honey extracts, royal jelly, and cold-pressed botanical oils. This locks in essential moisture beneath velvet layers without caking.
          </p>
        </div>

        <div className="bg-white border border-[#F0E6DD] p-8 rounded-[2px] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] text-[#6A1B6D] flex items-center justify-center mb-4">
            <Award size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
            South Asian Undertones
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed font-light">
            Our shades are calibrated specifically to harmonize with golden, neutral, and warm undertones, ensuring colors look vibrant, true-to-skin, and never ashy in humid weather.
          </p>
        </div>

        <div className="bg-white border border-[#F0E6DD] p-8 rounded-[2px] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] text-[#C2188B] flex items-center justify-center mb-4">
            <Heart size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
            Clean &amp; Conscious
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed font-light">
            We are proudly cruelty-free and dermatologically tested. Formulated without parabens, microplastics, or harmful synthetic phthalates. Gentle for daily beauty rituals.
          </p>
        </div>
      </div>

      {/* Closing Call to Action */}
      <div className="bg-[#6A1B6D] text-white p-8 sm:p-12 rounded-[2px] text-center max-w-4xl mx-auto shadow-md">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-wider font-serif mb-3 text-white">
          Experience Nature, Refined.
        </h2>
        <p className="text-xs sm:text-sm text-[#FCE4EC] max-w-xl mx-auto leading-relaxed mb-6 font-light">
          Discover lightweight, high-performance makeup designed to enhance your natural grace.
        </p>
        <Link
          href="/shop/all"
          className="inline-flex items-center gap-2 bg-[#D4AF37] hover:bg-[#B8942A] text-[#2C2C2C] text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-8 rounded-[2px] transition-all transform hover:-translate-y-0.5 shadow-xs"
        >
          <span>Shop The Collection</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
