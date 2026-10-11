import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 bg-[#FFF9F5] font-sans">
      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
        Page Not Found
      </span>
      <h1 className="text-4xl sm:text-5xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-4">
        404 &mdash; Formula Not Found
      </h1>
      <p className="text-xs sm:text-sm text-[#666666] max-w-md mx-auto leading-relaxed mb-8 font-light">
        The cosmetics page or collection you are looking for has been moved, renamed, or is currently out of stock in our beauty archives.
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-colors shadow-xs"
        >
          Return to Home
        </Link>
        <Link
          href="/shop/all"
          className="border border-[#F0E6DD] hover:border-[#6A1B6D] bg-white text-[#6A1B6D] text-xs font-semibold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-colors shadow-2xs"
        >
          Explore All Cosmetics
        </Link>
      </div>
    </main>
  );
}
