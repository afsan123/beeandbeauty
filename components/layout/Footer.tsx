'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  CheckCircle,
  ShieldCheck,
  Sparkles,
  Truck,
  Phone,
  Mail,
  MessageCircle,
} from 'lucide-react';
import { Logo } from '../ui/Logo';
import { CATEGORIES } from '../../data/mock/catalogData';

export function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@')) {
      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } catch {
        // graceful
      }
      setIsSubscribed(true);
      setEmail('');
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#3D0A3F] text-white pt-14 pb-8 border-t border-[#5E1361]">
      {/* Trust & Guarantee Banner */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 pb-12 border-b border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <ShieldCheck size={28} className="text-[#D4AF37] mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">100% Authentic</h4>
            <p className="text-[11px] text-[#FCE4EC]/75 mt-1">Directly crafted &amp; certified clean formulations</p>
          </div>

          <div className="flex flex-col items-center">
            <Truck size={28} className="text-[#D4AF37] mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Target Fast Delivery</h4>
            <p className="text-[11px] text-[#FCE4EC]/75 mt-1">Inside Dhaka 24h &bull; Outside Dhaka 48h</p>
          </div>

          <div className="flex flex-col items-center">
            <Sparkles size={28} className="text-[#D4AF37] mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Nature, Refined.</h4>
            <p className="text-[11px] text-[#FCE4EC]/75 mt-1">Cruelty-free &amp; apicultural botanicals</p>
          </div>

          <div className="flex flex-col items-center">
            <CheckCircle size={28} className="text-[#D4AF37] mb-2" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Easy Payments</h4>
            <p className="text-[11px] text-[#FCE4EC]/75 mt-1">Cash on Delivery &bull; bKash &bull; Nagad</p>
          </div>
        </div>
      </div>

      {/* Main 4-Column Footer */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Column 1: Brand & Newsletter */}
        <div className="space-y-4">
          <Logo variant="footer" />
          <p className="text-xs text-[#FCE4EC]/80 leading-relaxed font-sans">
            Premium-inspired, modern, clean, and customer-focused cosmetics destination in Bangladesh. Formulated for South Asian undertones with pure honey nectar and botanical science.
          </p>

          <div className="pt-2 font-sans">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37] mb-2">
              Join The Bee Club
            </div>
            {isSubscribed ? (
              <div className="bg-[#6A1B6D] text-[#D4AF37] text-xs p-2.5 rounded font-medium border border-[#D4AF37]/30">
                Thank you! You are subscribed for exclusive VIP drops.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/25 border border-white/20 text-xs text-white px-3 py-2 rounded-xs flex-1 outline-hidden focus:border-[#D4AF37]"
                />
                <button
                  type="submit"
                  className="bg-[#D4AF37] hover:bg-[#B8942A] text-[#2C2C2C] text-xs uppercase font-bold tracking-wider px-4 py-2 rounded-xs transition-colors cursor-pointer"
                >
                  Join
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Column 2: Collections */}
        <div className="font-sans">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4">
            Shop Collections
          </h4>
          <ul className="space-y-2.5 text-xs text-[#FCE4EC]/80">
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link href={`/shop/${c.slug}`} className="hover:text-white transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop/under499" className="text-[#C2188B] hover:text-[#E035A7] font-semibold">
                Under ৳499 Value Store
              </Link>
            </li>
            <li>
              <Link href="/offers" className="text-[#D4AF37] hover:underline font-semibold">
                Special Offers &amp; Deals
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Customer Care & Policies */}
        <div className="font-sans">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4">
            Customer Care &amp; Policies
          </h4>
          <ul className="space-y-2.5 text-xs text-[#FCE4EC]/80">
            <li>
              <Link href="/track-order" className="text-[#D4AF37] hover:underline font-semibold flex items-center gap-1.5">
                <Truck size={13} />
                <span>Track My Order</span>
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-white transition-colors">
                Frequently Asked Questions (FAQ)
              </Link>
            </li>
            <li>
              <Link href="/delivery-policy" className="hover:text-white transition-colors">
                Delivery Policy (24h / 48h)
              </Link>
            </li>
            <li>
              <Link href="/return-policy" className="hover:text-white transition-colors">
                Return &amp; Refund Policy (3-Day Window)
              </Link>
            </li>
            <li>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-white transition-colors">
                About Bee &amp; Beauty
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                Help Center &amp; Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Social */}
        <div className="font-sans">
          <h4 className="text-xs font-bold uppercase tracking-widest text-[#D4AF37] mb-4">
            Direct Inquiries
          </h4>
          <div className="space-y-3 text-xs text-[#FCE4EC]/80 leading-relaxed">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#D4AF37] shrink-0" />
              <a href="tel:+8801754502430" className="hover:text-white">
                +880 1754-502430
              </a>
            </div>

            <div className="flex items-center gap-2">
              <MessageCircle size={14} className="text-[#25D366] shrink-0" />
              <a
                href="https://wa.me/8801754502430"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white text-[#25D366] font-medium"
              >
                WhatsApp: +880 1754-502430
              </a>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={14} className="text-[#D4AF37] shrink-0" />
              <a href="mailto:beeandbeauty.bd@gmail.com" className="hover:text-white">
                beeandbeauty.bd@gmail.com
              </a>
            </div>

            <p className="pt-1 text-[11px] text-[#FCE4EC]/60">
              Customer Support: Saturday &ndash; Thursday (10:00 AM &ndash; 8:00 PM)
            </p>

            {/* Social Media Channels */}
            <div className="pt-2">
              <div className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold mb-2">
                Follow Bee &amp; Beauty
              </div>
              <div className="flex flex-wrap gap-2 text-[11px]">
                <a
                  href="https://www.facebook.com/BeeandBeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-[#6A1B6D] text-white px-2.5 py-1 rounded-xs transition-colors"
                >
                  Facebook
                </a>
                <a
                  href="https://www.instagram.com/beeyoubebeauty/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-[#C2188B] text-white px-2.5 py-1 rounded-xs transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://www.tiktok.com/@beeandbeauty.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-black text-white px-2.5 py-1 rounded-xs transition-colors"
                >
                  TikTok
                </a>
                <a
                  href="https://www.threads.net/@beeyoubebeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 hover:bg-[#6A1B6D] text-white px-2.5 py-1 rounded-xs transition-colors"
                >
                  Threads
                </a>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={scrollToTop}
                className="inline-flex items-center gap-2 text-xs text-[#D4AF37] hover:text-white border border-[#D4AF37]/40 px-3 py-1.5 rounded-xs transition-colors cursor-pointer"
              >
                <ArrowUp size={14} />
                <span>Back to Top</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Policy Bar */}
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#FCE4EC]/60 gap-4 font-sans">
        <p>&copy; 2026 Bee &amp; Beauty. All rights reserved. Nature, refined.</p>
        <div className="flex flex-wrap gap-4 sm:gap-6">
          <Link href="/delivery-policy" className="hover:text-white transition-colors">
            Delivery Policy
          </Link>
          <Link href="/return-policy" className="hover:text-white transition-colors">
            Return &amp; Refund
          </Link>
          <Link href="/privacy-policy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms &amp; Conditions
          </Link>
          <Link href="/faq" className="hover:text-white transition-colors">
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}
