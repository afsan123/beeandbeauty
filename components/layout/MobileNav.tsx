'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Heart, Percent, Sparkles, MessageCircle, Phone } from 'lucide-react';
import { Drawer } from '../ui/Drawer';
import { CATEGORIES } from '../../data/mock/catalogData';
import { useWishlist } from '../../store/wishlist';

export interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const { wishlistCount } = useWishlist();
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const toggleCategory = (slug: string) => {
    setExpandedCat((prev) => (prev === slug ? null : slug));
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="left" title="Menu" width="max-w-xs">
      <div className="flex flex-col gap-1 py-2 font-sans">
        {/* Quick Highlights */}
        <div className="flex items-center gap-3 pb-3 mb-2 border-b border-[#F0E6DD]">
          <Link
            href="/offers"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFF9F5] border border-[#F0E6DD] rounded text-xs font-semibold uppercase tracking-wider text-[#6A1B6D]"
          >
            <Percent size={14} className="text-[#D4AF37]" />
            <span>Offers</span>
          </Link>
          <Link
            href="/wishlist"
            onClick={onClose}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-[#FFF9F5] border border-[#F0E6DD] rounded text-xs font-semibold uppercase tracking-wider text-[#6A1B6D]"
          >
            <Heart size={14} className="text-[#C2188B]" />
            <span>Saved ({wishlistCount})</span>
          </Link>
        </div>

        {/* Categories */}
        <div className="text-[10px] font-bold uppercase tracking-widest text-[#6A1B6D] px-1 py-2">
          Shop By Category
        </div>

        {CATEGORIES.map((cat) => {
          const isExpanded = expandedCat === cat.slug;
          return (
            <div key={cat.id} className="border-b border-[#F0E6DD]/60">
              <div className="flex items-center justify-between">
                <Link
                  href={`/shop/${cat.slug}`}
                  onClick={onClose}
                  className="py-3 px-1 text-xs font-bold uppercase tracking-wider text-[#2C2C2C] hover:text-[#6A1B6D] flex-1"
                >
                  {cat.name}
                </Link>
                <button
                  type="button"
                  onClick={() => toggleCategory(cat.slug)}
                  className="p-3 text-neutral-400 hover:text-[#6A1B6D] cursor-pointer"
                  aria-label={`Toggle ${cat.name} subcategories`}
                >
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isExpanded ? 'rotate-180 text-[#6A1B6D]' : ''
                    }`}
                  />
                </button>
              </div>

              {isExpanded && (
                <div className="pl-4 pb-3 flex flex-col gap-2 bg-[#FFF9F5] py-2 rounded">
                  {cat.subcategories.map((sub) => (
                    <Link
                      key={sub.slug}
                      href={`/shop/${cat.slug}`}
                      onClick={onClose}
                      className="text-xs text-neutral-600 hover:text-[#6A1B6D] py-1"
                    >
                      {sub.name}
                    </Link>
                  ))}
                  <Link
                    href={`/shop/${cat.slug}`}
                    onClick={onClose}
                    className="text-xs text-[#6A1B6D] font-bold py-1 hover:text-[#C2188B]"
                  >
                    View All {cat.name} &rarr;
                  </Link>
                </div>
              )}
            </div>
          );
        })}

        {/* Value Store link */}
        <Link
          href="/shop/under499"
          onClick={onClose}
          className="flex items-center gap-2 py-3 px-1 text-xs font-bold uppercase tracking-wider text-[#C2188B] border-b border-[#F0E6DD]/60"
        >
          <Sparkles size={14} />
          <span>Under ৳499 Value Store</span>
        </Link>

        {/* Brand Information & Support */}
        <div className="pt-4 mt-2 flex flex-col gap-2.5 text-xs text-neutral-600">
          <Link href="/about" onClick={onClose} className="hover:text-[#6A1B6D] py-1">
            Our Brand Story (Nature, refined.)
          </Link>
          <Link href="/faq" onClick={onClose} className="hover:text-[#6A1B6D] py-1">
            Frequently Asked Questions
          </Link>
          <Link href="/delivery-policy" onClick={onClose} className="hover:text-[#6A1B6D] py-1">
            Delivery Policy (24h / 48h)
          </Link>
          <Link href="/return-policy" onClick={onClose} className="hover:text-[#6A1B6D] py-1">
            Return &amp; Refund Policy (3-Day Window)
          </Link>
          <Link href="/contact" onClick={onClose} className="hover:text-[#6A1B6D] py-1">
            Contact Us &amp; Boutiques
          </Link>
        </div>

        {/* Quick Contact buttons */}
        <div className="mt-4 pt-4 border-t border-[#F0E6DD] space-y-2">
          <a
            href="https://wa.me/8801754502430"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#25D366] text-white text-xs font-bold uppercase tracking-wider rounded"
          >
            <MessageCircle size={15} />
            <span>WhatsApp Support</span>
          </a>
          <a
            href="tel:+8801754502430"
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#FFF9F5] border border-[#F0E6DD] text-[#6A1B6D] text-xs font-semibold uppercase tracking-wider rounded"
          >
            <Phone size={14} />
            <span>+880 1754-502430</span>
          </a>
        </div>
      </div>
    </Drawer>
  );
}
