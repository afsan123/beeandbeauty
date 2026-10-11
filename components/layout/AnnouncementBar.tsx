'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const ANNOUNCEMENTS = [
  { text: 'Bee & Beauty — Nature, refined. | Clean Skincare & Bespoke Luxury Cosmetics', link: '/about' },
  { text: 'Inside Dhaka within 24h | Outside Dhaka within 48h Tracked Delivery', link: '/delivery-policy' },
  { text: 'New: Raw Propolis & Ceramide Barrier Care Rituals Now Live', link: '/shop/skin' },
  { text: 'Special Offer: Flat ৳700 Off on Orders Above ৳2,999 with code BEE700', link: '/offers' },
  { text: 'Beauty & Skincare Concierge via WhatsApp: +8801754502430', link: 'https://wa.me/8801754502430' },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 4200);

    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  const current = ANNOUNCEMENTS[currentIndex];
  const isExternal = current.link.startsWith('http');

  return (
    <div className="bg-[#6A1B6D] text-[#FFF9F5] text-[10px] sm:text-[11px] tracking-[0.14em] uppercase h-[38px] flex items-center justify-between px-3 md:px-8 border-b border-[#521354] z-40 select-none">
      <button
        type="button"
        onClick={handlePrev}
        aria-label="Previous announcement"
        className="text-[#D4AF37] hover:text-white p-1 transition-colors cursor-pointer"
      >
        <ChevronLeft size={14} />
      </button>

      <div className="overflow-hidden flex-1 text-center px-2 flex items-center justify-center gap-2">
        <Sparkles size={11} className="text-[#D4AF37] shrink-0 hidden sm:inline" />
        {isExternal ? (
          <a
            href={current.link}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#D4AF37] transition-colors font-medium inline-block truncate max-w-full font-sans"
          >
            {current.text}
          </a>
        ) : (
          <Link
            href={current.link}
            className="hover:text-[#D4AF37] transition-colors font-medium inline-block truncate max-w-full font-sans"
          >
            {current.text}
          </Link>
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        aria-label="Next announcement"
        className="text-[#D4AF37] hover:text-white p-1 transition-colors cursor-pointer"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
