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
      className="fixed bottom-6 right-6 z-30 w-10 h-10 rounded-full bg-[#111111] text-white hover:bg-[#C5A059] shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer border border-neutral-700 active:scale-95 animate-in fade-in"
    >
      <ArrowUp size={18} />
    </button>
  );
}
