'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Tag, Check, Copy } from 'lucide-react';
import { Product, Offer } from '../../data/types';
import { Accordion, AccordionItemData } from '../ui/Accordion';

export interface OfferAccordionProps {
  product: Product;
  offers?: Offer[];
}

export function OfferAccordion({ product, offers = [] }: OfferAccordionProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const accordionItems: AccordionItemData[] = [
    {
      id: 'description',
      title: 'Description & Formula Benefits',
      content: (
        <div className="space-y-3 font-sans">
          <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
            {product.description}
          </p>
          <div className="bg-[#FFF9F5] p-3 rounded-[2px] border border-[#F0E6DD]">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
              Key Highlights
            </h4>
            <ul className="list-disc list-inside text-xs text-neutral-600 space-y-1">
              <li>Infused with botanical royal jelly &amp; honey nectar for weightless hydration</li>
              <li>Lightweight, non-oxidizing all-day wear formula formulated for South Asian undertones</li>
              <li>100% cruelty-free, gentle botanicals, and dermatologically tested</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'how-to-use',
      title: 'How To Apply & Pro Artist Tips',
      content: (
        <div className="space-y-2 font-sans">
          <p className="text-xs md:text-sm text-neutral-700 leading-relaxed">
            {product.howToUse}
          </p>
          <p className="text-xs text-neutral-500 italic">
            Pro Tip: Prep with our apicultural nectar primer before application for seamless blending and extended longevity in humid weather.
          </p>
        </div>
      ),
    },
    {
      id: 'ingredients',
      title: 'Ingredients & Clean Formula',
      content: (
        <div className="space-y-2 font-sans">
          <p className="text-xs text-neutral-600 font-mono leading-relaxed bg-[#FFF9F5] p-3 rounded-[2px] border border-[#F0E6DD]">
            {product.ingredients}
          </p>
          <p className="text-[11px] text-neutral-500">
            Formulated without parabens, microplastics, harmful synthetic phthalates, or harsh fillers.
          </p>
        </div>
      ),
    },
    {
      id: 'specifications',
      title: 'Product Specifications & Origin',
      content: (
        <div className="grid grid-cols-2 gap-3 text-xs font-sans">
          <div className="border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Net Weight</span>
            <span className="font-semibold text-[#6A1B6D]">{product.details.netWeight}</span>
          </div>
          <div className="border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Shelf Life</span>
            <span className="font-semibold text-[#6A1B6D]">{product.details.shelfLife}</span>
          </div>
          <div className="border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Country of Origin</span>
            <span className="font-semibold text-[#6A1B6D]">{product.details.origin}</span>
          </div>
          <div className="border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Formulation</span>
            <span className="font-semibold text-[#6A1B6D]">{product.details.formulation}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'shipping-returns',
      title: 'Shipping, COD & Return Policy',
      content: (
        <div className="space-y-2 text-xs text-neutral-700 font-sans">
          <p>
            &bull; <strong>Inside Dhaka:</strong> Target delivery within 24 hours (৳80, free over ৳1,499).
          </p>
          <p>
            &bull; <strong>Outside Dhaka:</strong> Target delivery within 48 hours to all 64 districts (৳130, free over ৳1,499).
          </p>
          <p>
            &bull; <strong>Cash on Delivery (COD) &amp; bKash / Nagad:</strong> Available nationwide.
          </p>
          <p>
            &bull; <strong>3-Day Defect Reporting Window:</strong> Report damaged or incorrect items within 3 days via WhatsApp at +880 1754-502430. See our{' '}
            <Link href="/return-policy" className="text-[#6A1B6D] font-bold underline">
              Return Policy
            </Link>
            .
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 pt-4 font-sans">
      {/* Available Offers Cards */}
      {offers.length > 0 && (
        <div className="border border-[#F0E6DD] bg-[#FFF9F5] p-4 rounded-[2px]">
          <div className="flex items-center gap-2 mb-3">
            <Tag size={16} className="text-[#D4AF37]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
              Available Brand Offers &amp; Discounts
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {offers.map((offer) => {
              const isCopied = copiedCode === offer.code;

              return (
                <div
                  key={offer.id}
                  className="bg-white border border-[#F0E6DD] p-3 rounded-[2px] flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#6A1B6D] bg-[#FFF9F5] px-1.5 py-0.5 rounded-[2px] border border-[#F0E6DD]">
                        {offer.code}
                      </span>
                      <span className="text-[10px] font-bold text-[#C2188B] uppercase">
                        {offer.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#2C2C2C] font-medium truncate mt-1">
                      {offer.title}
                    </p>
                    <p className="text-[10px] text-neutral-400">
                      {offer.expiryNote}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopy(offer.code)}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-[2px] border border-[#F0E6DD] hover:border-[#6A1B6D] text-[#6A1B6D] transition-colors cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check size={12} className="text-[#2E7D32]" />
                        <span className="text-[#2E7D32]">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Accordion Panels */}
      <div>
        <Accordion items={accordionItems} defaultOpenId="description" allowMultiple />
      </div>
    </div>
  );
}
