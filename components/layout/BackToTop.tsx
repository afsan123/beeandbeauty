'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
      className="fixed bottom-[5.25rem] right-6 z-30 w-11 h-11 rounded-full bg-[#6A1B6D] text-white hover:bg-[#531355] hover:text-[#D4AF37] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer border border-[#D4AF37]/30 active:scale-95 animate-in fade-in"
    >
      <ArrowUp size={18} />
    </button>
  );
}
