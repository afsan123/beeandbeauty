'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { AnnouncementBar } from './AnnouncementBar';
import { MegaMenu } from './MegaMenu';
import { MobileNav } from './MobileNav';
import { Logo } from '../ui/Logo';
import { useCart } from '../../store/cart';
import { useWishlist } from '../../store/wishlist';

export function Header() {
  const router = useRouter();
  const { totals, openDrawer } = useCart();
  const { wishlistCount } = useWishlist();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchExpanded(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-xs border-b border-[#F0E6DD]/80">
      <AnnouncementBar />

      <div className="max-w-[1360px] mx-auto px-4 md:px-8 h-[74px] flex items-center justify-between gap-4">
        {/* Mobile hamburger menu */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open mobile menu"
            className="p-2 -ml-2 text-[#6A1B6D] hover:text-[#C2188B] transition-colors cursor-pointer"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Brand Logo with Official Illustration & Typography */}
        <div className="flex items-center">
          <Logo variant="header" />
        </div>

        {/* Desktop Navigation */}
        <MegaMenu />

        {/* Right Action Icons */}
        <div className="flex items-center gap-2 md:gap-3.5">
          {/* Live Search Trigger & Expandable Input */}
          <div className="relative">
            {isSearchExpanded ? (
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center bg-[#FFF9F5] border border-[#6A1B6D]/30 rounded-xs px-2.5 py-1 text-xs shadow-xs"
              >
                <input
                  type="search"
                  placeholder="Search lipstick, kohl..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="bg-transparent border-none outline-hidden w-36 md:w-56 text-xs text-[#2C2C2C] placeholder:text-neutral-400 font-sans"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="p-1 text-[#6A1B6D] hover:text-[#C2188B] cursor-pointer"
                >
                  <Search size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(false)}
                  aria-label="Close search"
                  className="p-1 text-neutral-400 hover:text-[#6A1B6D] text-[10px] ml-1 cursor-pointer font-bold"
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchExpanded(true)}
                aria-label="Search catalog"
                className="p-2 text-[#6A1B6D] hover:text-[#C2188B] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Search size={20} />
                <span className="hidden xl:inline text-[11px] uppercase tracking-wider font-medium text-neutral-600 font-sans">
                  Search
                </span>
              </button>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            aria-label={`Wishlist (${wishlistCount} items)`}
            className="relative p-2 text-[#6A1B6D] hover:text-[#C2188B] transition-colors cursor-pointer"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-[#C2188B] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Shopping Bag / Cart Drawer Button */}
          <button
            type="button"
            onClick={openDrawer}
            aria-label={`Cart (${totals.itemCount} items)`}
            className="relative p-2 text-[#6A1B6D] hover:text-[#C2188B] transition-colors cursor-pointer"
          >
            <ShoppingBag size={21} />
            {totals.itemCount > 0 && (
              <span className="absolute top-1 right-1 w-4.5 h-4.5 bg-[#6A1B6D] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none border border-white">
                {totals.itemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </header>
  );
}
