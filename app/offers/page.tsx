'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Copy, Check, Gift, Truck, Percent } from 'lucide-react';
import { OFFERS } from '../../data/mock/catalogData';
import { Accordion } from '../../components/ui/Accordion';
import type { Offer } from '../../data/types';
import { useStorefrontRealtime } from '../../lib/services/realtimeStorefront.ts';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>(OFFERS);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const loadOffers = React.useCallback(async () => {
    try {
      const res = await fetch('/api/offers?refresh=true');
      if (res.ok) {
        const data = await res.json();
        if (data.offers && data.offers.length > 0) {
          setOffers(data.offers);
        }
      }
    } catch {
      // Fallback to initial OFFERS
    }
  }, []);

  // Real-time limited offers updates directly from Admin mutations
  useStorefrontRealtime({
    onOfferUpdate: () => {
      loadOffers();
    },
  });

  useEffect(() => {
    let isMounted = true;
    loadOffers();
    return () => {
      isMounted = false;
    };
  }, [loadOffers]);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const termsItems = [
    {
      id: 'how-to-redeem',
      title: 'How to Redeem a Promo Code',
      content: (
        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
          Simply copy your desired offer code using the &ldquo;Copy Code&rdquo; button above. When you are inside your Cart Drawer or on the Checkout page, paste the code into the Promo Code input and click &ldquo;Apply&rdquo;. The discount will immediately reflect in your order total.
        </p>
      ),
    },
    {
      id: 'free-shipping-terms',
      title: 'Free Shipping Threshold Terms',
      content: (
        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
          All orders with a final merchandise subtotal of ৳2,500 or more automatically receive free tracked delivery across all 64 districts in Bangladesh (Inside Dhaka 24h &bull; Outside Dhaka 48h via Steadfast / Pathao). Regular delivery is ৳70 inside Dhaka and ৳130 outside Dhaka. No coupon code required.
        </p>
      ),
    },
    {
      id: 'combining-offers',
      title: 'Stacking & Combining Offers',
      content: (
        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
          Only one promotional voucher may be applied per transaction. In addition, orders eligible for free shipping (subtotal &ge; ৳2,500) retain free shipping even after coupon discounts are subtracted.
        </p>
      ),
    },
  ];

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-14 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-6">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Offers &amp; Deals</span>
      </nav>

      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2">
          Exclusive Brand Savings
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.12em] text-[#6A1B6D] font-serif">
          Promotional Offers &amp; Perks
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-3 leading-relaxed font-light">
          Discover verified vouchers, welcome codes, and threshold gifts crafted to elevate your beauty collection.
        </p>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {offers.map((offer) => {
          const isCopied = copiedCode === offer.code;

          return (
            <div
              key={offer.id}
              className="bg-white border border-[#F0E6DD] rounded-[2px] p-6 shadow-2xs flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-[#D4AF37]"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FCE4EC] text-[#C2188B] px-2.5 py-1 rounded-[2px] border border-[#C2188B]/20">
                    {offer.badge}
                  </span>
                  <span className="text-[11px] text-neutral-400 font-medium">
                    {offer.expiryNote}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
                  {offer.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed mb-4 font-light">
                  {offer.description}
                </p>
              </div>

              {/* Code Box & Actions */}
              <div className="pt-4 border-t border-[#F0E6DD] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-[#FFF9F5] border border-[#F0E6DD] px-3 py-2 rounded-[2px]">
                  <Tag size={14} className="text-[#D4AF37]" />
                  <span className="font-mono text-xs font-bold tracking-widest text-[#6A1B6D]">
                    {offer.code}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="flex items-center gap-1.5 bg-white border border-[#F0E6DD] hover:border-[#6A1B6D] text-[#6A1B6D] text-xs font-bold uppercase tracking-wider py-2 px-3.5 rounded-[2px] transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check size={13} className="text-[#2E7D32]" />
                        <span className="text-[#2E7D32]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>

                  <Link
                    href="/shop/all"
                    className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-[2px] transition-colors shadow-2xs"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
        <div className="bg-white p-5 rounded-[2px] border border-[#F0E6DD] flex items-center gap-3 shadow-2xs">
          <Truck size={24} className="text-[#D4AF37] shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
              Fast Nationwide Delivery
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Inside Dhaka 24h (৳70) &bull; Outside Dhaka 48h (৳130). Free over ৳2,500.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2px] border border-[#F0E6DD] flex items-center gap-3 shadow-2xs">
          <Percent size={24} className="text-[#C2188B] shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
              First Order Perk
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">
              10% instant off with code BEEFIRST.
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[2px] border border-[#F0E6DD] flex items-center gap-3 shadow-2xs">
          <Gift size={24} className="text-[#D4AF37] shrink-0" />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
              Luxury Gift Sets
            </h3>
            <p className="text-[11px] text-[#666666] mt-0.5">
              Curated vanity boxes &amp; savings.
            </p>
          </div>
        </div>
      </div>

      {/* Accordion Terms & Conditions */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-4 pb-2 border-b border-[#F0E6DD] font-serif">
          Frequently Asked Questions &amp; Offer Policies
        </h3>
        <Accordion items={termsItems} allowMultiple />
      </div>
    </main>
  );
}
