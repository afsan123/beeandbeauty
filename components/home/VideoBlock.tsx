'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, Sparkles, X, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';

interface TutorialItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  steps: string[];
  productSlug: string;
  productName: string;
}

const TUTORIALS: TutorialItem[] = [
  {
    id: 'tut-1',
    title: 'The 10-Minute Luminous Honey Glow',
    category: 'Daily Complexion',
    duration: '3 min routine',
    description: 'Learn how to layer our Honey Dew Serum Foundation with Golden Elixir Glow Drops for an unclockable natural luminosity that stays shine-free all afternoon.',
    steps: [
      'Dispense 2 drops of Honey Dew Foundation onto the back of your hand.',
      'Dot evenly across high points of forehead, cheeks, and chin.',
      'Blend with damp sponge or dense buffer brush using upward motions.',
      'Lock in place with Hydra-Veil Dewy Setting Mist.',
    ],
    productSlug: 'honey-dew-serum-foundation',
    productName: 'Honey Dew Serum Foundation',
  },
  {
    id: 'tut-2',
    title: 'Smouldering Royal Velvet Evening Glam',
    category: 'Dramatic Evening',
    duration: '5 min masterclass',
    description: 'Craft a high-impact dramatic lip with our Velvet Matte Royal Lipstick in shade 01 Crimson Queen, paired with ultra-precise liquid ink liner wings.',
    steps: [
      'Line lips cleanly using a shade-matched contour pencil.',
      'Apply Velvet Matte directly from the bullet starting at cupid\'s bow.',
      'Blot once with tissue for an ultra-velvety soft-focus finish.',
      'Add a dab of Honey Nectar Gloss to center of lips for dimensional volume.',
    ],
    productSlug: 'velvet-matte-royal-lipstick',
    productName: 'Velvet Matte Royal Lipstick',
  },
  {
    id: 'tut-3',
    title: 'Arch & Define: Feathered Brow Tutorial',
    category: 'Eye & Brow Artistry',
    duration: '2 min quick tip',
    description: 'Master effortless micro-stroke feathered brows that resist Dhaka humidity with our Arch Precision Micro Brow Pencil.',
    steps: [
      'Brush natural brow hairs upward using the spoolie brush.',
      'Use light flicking motions to fill sparse gaps following hair growth direction.',
      'Set arches in place with clear brow gel for 16-hour hold.',
    ],
    productSlug: 'arch-precision-micro-brow-pencil',
    productName: 'Arch Precision Micro Brow Pencil',
  },
];

export function VideoBlock() {
  const [activeTutorial, setActiveTutorial] = useState<TutorialItem | null>(null);

  return (
    <section className="py-12 md:py-18 bg-[#3D0A3F] text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
            Pro Beauty Studio
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold uppercase tracking-[0.14em] font-serif text-white">
            Master The Signature Looks
          </h2>
          <p className="text-xs sm:text-sm text-[#FCE4EC]/80 mt-2 font-light">
            Step-by-step masterclasses curated by our resident South Asian beauty artists.
          </p>
        </div>

        {/* 3 Tutorial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TUTORIALS.map((tut) => (
            <div
              key={tut.id}
              className="bg-[#2D072F] border border-white/10 hover:border-[#D4AF37]/60 rounded-[2px] p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] mb-3">
                  <span className="text-[#D4AF37] font-bold uppercase tracking-wider">
                    {tut.category}
                  </span>
                  <span className="text-[#FCE4EC]/60 font-mono text-[10px]">
                    {tut.duration}
                  </span>
                </div>

                <h3 className="text-base font-bold uppercase tracking-wider text-white group-hover:text-[#D4AF37] transition-colors mb-2 font-serif">
                  {tut.title}
                </h3>

                <p className="text-xs text-[#FCE4EC]/70 leading-relaxed line-clamp-3 font-light">
                  {tut.description}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTutorial(tut)}
                  className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white hover:text-[#D4AF37] transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D4AF37] text-[#2C2C2C] flex items-center justify-center">
                    <Play size={12} className="ml-0.5 fill-[#2C2C2C]" />
                  </div>
                  <span>View Routine</span>
                </button>

                <Link
                  href={`/product/${tut.productSlug}`}
                  className="text-[11px] text-[#FCE4EC]/70 hover:text-white underline underline-offset-2"
                >
                  Shop Product
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Routine Detail Modal */}
      {activeTutorial && (
        <Modal
          isOpen={!!activeTutorial}
          onClose={() => setActiveTutorial(null)}
          title={activeTutorial.title}
          className="max-w-lg"
        >
          <div className="space-y-4 text-[#2C2C2C] font-sans">
            <div className="bg-[#FFF9F5] p-3 rounded-[2px] border border-[#F0E6DD] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
                {activeTutorial.category}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {activeTutorial.duration}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
              {activeTutorial.description}
            </p>

            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D] mb-2 font-serif">
                Application Steps:
              </h4>
              <ol className="space-y-2 text-xs text-neutral-700">
                {activeTutorial.steps.map((st, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#6A1B6D] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{st}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="pt-4 border-t border-[#F0E6DD] flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-neutral-600 truncate">
                Featured: {activeTutorial.productName}
              </span>
              <Link
                href={`/product/${activeTutorial.productSlug}`}
                onClick={() => setActiveTutorial(null)}
                className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-[2px] shrink-0 transition-colors"
              >
                Shop Now
              </Link>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
