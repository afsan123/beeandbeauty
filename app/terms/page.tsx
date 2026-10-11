import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { FileText, Scale, Shield, AlertTriangle } from 'lucide-react';
import { PolicyDisclaimer } from '../../components/ui/PolicyDisclaimer';

export const metadata: Metadata = {
  title: 'Terms & Conditions | Bee & Beauty Bangladesh',
  description:
    'Bee & Beauty terms of service, customer agreement, ordering guidelines, and website conditions in Bangladesh.',
};

export default function TermsPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8 font-sans">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Terms &amp; Conditions</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Legal Agreement
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed font-sans">
          Terms governing your access to and purchases from the Bee &amp; Beauty e-commerce platform.
        </p>
      </div>

      {/* Staging disclaimer */}
      <PolicyDisclaimer
        title="Terms & Conditions Status: Draft for Development (Pending Legal Review)"
        message="These terms outline the preliminary commercial conditions for Bee & Beauty. Complete contractual terms and statutory consumer protections are subject to formal legal verification under the laws of Bangladesh."
      />

      {/* Terms Sections */}
      <div className="space-y-8 text-xs text-[#2C2C2C] font-sans leading-relaxed my-10">
        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing, browsing, or placing an order through Bee &amp; Beauty (&ldquo;beeandbeauty.com&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions along with our Privacy and Delivery Policies.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            2. Product Descriptions &amp; Pricing Accuracy
          </h2>
          <p className="mb-2">
            All prices on our storefront are quoted in Bangladeshi Taka (BDT ৳) and are inclusive of applicable value-added taxes unless explicitly stated otherwise.
          </p>
          <p>
            While we strive for photographic accuracy, slight color variations may occur depending on your screen display settings and natural lighting conditions. Product ingredients and benefits are detailed based on verified manufacturer laboratory testing.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            3. Order Placement &amp; Acceptance
          </h2>
          <p className="mb-2">
            Placement of an order constitutes an offer to purchase. An order is confirmed once verified by our logistics concierge via phone, SMS, or WhatsApp. Bee &amp; Beauty reserves the right to decline or cancel orders in cases of suspected fraud, pricing errors, or sudden stock depletion.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            4. Payment Methods &amp; Settlement
          </h2>
          <p className="mb-2">
            We accept Cash on Delivery (COD), bKash mobile payment, and Nagad digital wallet payments. For Cash on Delivery, the exact billed amount must be tendered to the courier upon delivery before opening outer shipping seals.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            5. Intellectual Property
          </h2>
          <p>
            The Bee &amp; Beauty brand name, logo, &ldquo;Nature, refined.&rdquo; trademark, botanical illustrations, product photography, editorial text, and website design are the exclusive intellectual property of Bee &amp; Beauty. Reproduction, unauthorized scraping, or commercial duplication is strictly prohibited.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            6. Governing Jurisdiction
          </h2>
          <p>
            These terms are governed by and construed in accordance with the substantive laws of the People&rsquo;s Republic of Bangladesh. Any dispute arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in Dhaka, Bangladesh.
          </p>
        </section>
      </div>
    </main>
  );
}
