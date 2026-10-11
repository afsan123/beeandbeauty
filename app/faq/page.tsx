'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, Phone, MessageCircle, Truck, CreditCard, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '../../lib/cn';

interface FAQItem {
  question: string;
  answer: string | React.ReactNode;
  category: 'delivery' | 'payment' | 'returns' | 'products';
}

const FAQ_DATA: FAQItem[] = [
  {
    category: 'delivery',
    question: 'How fast do you deliver inside Dhaka?',
    answer:
      'Our target delivery timeline inside Dhaka is within 24 hours. Orders confirmed before 2:00 PM are packaged same-day and scheduled for express doorstep delivery across all metropolitan zones including Banani, Gulshan, Dhanmondi, Uttara, and Mirpur.',
  },
  {
    category: 'delivery',
    question: 'What is the delivery timeline for locations outside Dhaka?',
    answer:
      'For addresses across all 64 districts outside Dhaka (including Chittagong, Sylhet, Rajshahi, Khulna, etc.), our target delivery time is within 48 hours via reputable courier partners (Steadfast, Pathao, RedX).',
  },
  {
    category: 'delivery',
    question: 'What are the delivery charges and is there free shipping?',
    answer:
      'Standard delivery inside Dhaka is ৳80 and outside Dhaka is ৳130. However, all retail orders with a cart subtotal above ৳1,499 automatically receive 100% Free Shipping nationwide!',
  },
  {
    category: 'payment',
    question: 'Can I pay via Cash on Delivery (COD)?',
    answer:
      'Yes! Cash on Delivery is available across all 64 districts of Bangladesh. You can inspect the outer tamper-evident courier packaging and pay cash directly to the delivery agent upon handover.',
  },
  {
    category: 'payment',
    question: 'Do you accept bKash and Nagad payments?',
    answer:
      'Yes, we support online digital payments via both bKash and Nagad. During checkout, select bKash or Nagad to view merchant payment instructions or receive an instant payment request link.',
  },
  {
    category: 'returns',
    question: 'What is the return and reporting window?',
    answer:
      'We offer a proposed 3-day (72-hour) reporting window from the delivery timestamp. If your product arrives damaged in transit, with a manufacturing defect, or with an incorrect shade code, please notify our team within 3 days for immediate replacement.',
  },
  {
    category: 'returns',
    question: 'Can I return an opened or swatched lipstick/foundation?',
    answer:
      'In strict compliance with cosmetics hygiene and public health standards in Bangladesh, beauty items that have been opened, swatched, or had their protective seals removed cannot be returned or refunded. Returns apply to unsealed/untampered items or transit damage verified upon unboxing.',
  },
  {
    category: 'returns',
    question: 'How do I submit a return or defect claim?',
    answer: (
      <span>
        Simply take clear photos of the damaged item along with the courier parcel label, and message our WhatsApp concierge at{' '}
        <a href="https://wa.me/8801754502430" className="text-[#6A1B6D] font-bold underline">
          +880 1754-502430
        </a>{' '}
        or email{' '}
        <a href="mailto:beeandbeauty.bd@gmail.com" className="text-[#6A1B6D] font-bold underline">
          beeandbeauty.bd@gmail.com
        </a>{' '}
        with your Order ID.
      </span>
    ),
  },
  {
    category: 'products',
    question: 'Are Bee & Beauty formulas formulated for Bangladeshi weather and skin tones?',
    answer:
      'Yes! Bee & Beauty products are engineered specifically for South Asian complexions with warm, golden, and neutral undertones. Our lightweight, non-oxidizing, humidity-resistant formulas are infused with royal jelly, honey nectar, and peptide botanicals designed to withstand humid climates.',
  },
  {
    category: 'products',
    question: 'Are Bee & Beauty products cruelty-free?',
    answer:
      'Absolutely 100%. We never test our formulas or ingredients on animals at any stage of product research, formulation, or manufacturing. Nature, refined.',
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filteredFaqs =
    activeCategory === 'all'
      ? FAQ_DATA
      : FAQ_DATA.filter((item) => item.category === activeCategory);

  const toggleAccordion = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-14 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">FAQ</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Help Center
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed">
          Quick answers about delivery, payment methods, returns, and our nature-refined formulations.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
        {[
          { id: 'all', label: 'All Questions', icon: <HelpCircle size={14} /> },
          { id: 'delivery', label: 'Delivery & Shipping', icon: <Truck size={14} /> },
          { id: 'payment', label: 'bKash & COD Payments', icon: <CreditCard size={14} /> },
          { id: 'returns', label: 'Returns & 3-Day Window', icon: <RotateCcw size={14} /> },
          { id: 'products', label: 'Products & Shades', icon: <Sparkles size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveCategory(tab.id);
              setOpenIndex(null);
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-[2px] text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer',
              activeCategory === tab.id
                ? 'bg-[#6A1B6D] text-white shadow-xs'
                : 'bg-white text-[#2C2C2C] border border-[#F0E6DD] hover:border-[#6A1B6D]/40'
            )}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="bg-white border border-[#F0E6DD] rounded-[2px] overflow-hidden shadow-2xs transition-all"
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full text-left p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FFF9F5]/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-xs sm:text-sm font-bold text-[#6A1B6D] font-serif">
                  {faq.question}
                </span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'text-[#D4AF37] shrink-0 transition-transform duration-200',
                    isOpen && 'rotate-180 text-[#6A1B6D]'
                  )}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-[#666666] leading-relaxed border-t border-[#F0E6DD]/60">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Contact Banner */}
      <div className="mt-12 bg-white border border-[#F0E6DD] p-8 rounded-[2px] text-center shadow-xs">
        <h3 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
          Still Have Questions?
        </h3>
        <p className="text-xs text-[#666666] max-w-md mx-auto mb-5 leading-relaxed">
          Our friendly beauty advisors in Dhaka are available via WhatsApp and phone to help with orders, shades, and delivery.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="https://wa.me/8801754502430"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors shadow-xs"
          >
            <MessageCircle size={15} />
            <span>Chat on WhatsApp (+880 1754-502430)</span>
          </a>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors shadow-xs"
          >
            <Phone size={14} />
            <span>Contact Support</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
