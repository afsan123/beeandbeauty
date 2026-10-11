import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { RotateCcw, ShieldAlert, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { PolicyDisclaimer } from '../../components/ui/PolicyDisclaimer';

export const metadata: Metadata = {
  title: 'Return & Refund Policy | Bee & Beauty Bangladesh',
  description:
    'Bee & Beauty return and refund policy: proposed 3-day reporting window for damaged, defective, or incorrect cosmetics items.',
};

export default function ReturnPolicyPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8 font-sans">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Return &amp; Refund Policy</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Customer Protection
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
          Return &amp; Refund Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed font-sans">
          Clear, hygienic, and honest procedures designed to safeguard your beauty purchases.
        </p>
      </div>

      {/* Staging disclaimer */}
      <PolicyDisclaimer
        title="Return Policy Status: Draft for Development (Pending Business Approval)"
        message="The proposed 3-day reporting window and refund workflows below are development guidelines pending legal review and formal owner approval. Do not consider these clauses finalized until confirmed by Bee & Beauty management."
      />

      {/* 3 Pillars Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-10 font-sans">
        <div className="bg-white border border-[#F0E6DD] p-6 rounded-[2px] shadow-2xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#6A1B6D] mb-3">
            <RotateCcw size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
            3-Day Reporting Window
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            Report any damaged, broken, missing, or mismatched item within 3 days (72 hours) of parcel delivery.
          </p>
        </div>

        <div className="bg-white border border-[#F0E6DD] p-6 rounded-[2px] shadow-2xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#C2188B] mb-3">
            <ShieldAlert size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
            Cosmetics Hygiene Standard
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            Due to strict health and sanitation regulations, opened, swabbed, or used cosmetic items cannot be returned.
          </p>
        </div>

        <div className="bg-white border border-[#F0E6DD] p-6 rounded-[2px] shadow-2xs text-center flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-3">
            <CheckCircle2 size={22} />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
            Prompt Replacements
          </h2>
          <p className="text-xs text-[#666666] leading-relaxed">
            Approved defect claims receive an immediate replacement dispatch or original payment refund via bKash/Nagad.
          </p>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-8 text-xs text-[#2C2C2C] font-sans leading-relaxed">
        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            1. Eligible Cases for Return or Exchange
          </h2>
          <p className="mb-2">
            You are fully protected in any of the following instances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>
              <strong>Transit Damage:</strong> The product arrives cracked, broken, leaking, or crushed.
            </li>
            <li>
              <strong>Manufacturing Defect:</strong> Faulty applicator, malfunctioning dropper, or formulation anomaly upon opening.
            </li>
            <li>
              <strong>Incorrect Product or Shade:</strong> The delivered item does not match your confirmed order receipt.
            </li>
            <li>
              <strong>Missing Items:</strong> An item from your bundle or order receipt was omitted from the outer shipping parcel.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            2. Ineligible Cases (Hygiene &amp; Safety Protocol)
          </h2>
          <p className="mb-2">
            Under Bangladesh consumer health standards, cosmetics and personal care products come into direct contact with mucous membranes and skin. Consequently:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>Products with unsealed plastic wrap, broken tamper seals, or evidence of swatching cannot be returned or refunded.</li>
            <li>Changes of mind after product opening or testing are ineligible for return.</li>
            <li>Damage resulting from improper customer handling, dropping, or extreme temperature exposure after delivery is not covered.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            3. Step-by-Step Reporting Channel
          </h2>
          <ol className="list-decimal pl-5 space-y-2 text-[#666666]">
            <li>
              <strong>Capture Clear Evidence:</strong> Take clear photographs or a short video showing the outer shipping box, courier label, and the specific item defect or incorrect shade code.
            </li>
            <li>
              <strong>Submit within 72 Hours:</strong> Message our WhatsApp concierge at{' '}
              <a href="https://wa.me/8801754502430" className="text-[#6A1B6D] font-bold underline">
                +880 1754-502430
              </a>{' '}
              or email{' '}
              <a href="mailto:beeandbeauty.bd@gmail.com" className="text-[#6A1B6D] font-bold underline">
                beeandbeauty.bd@gmail.com
              </a>{' '}
              with your Order Reference Number (e.g., #BB-123456).
            </li>
            <li>
              <strong>Verification &amp; Resolution:</strong> Our advisory team will review your submission within 24 business hours. If approved, we will arrange a reverse pickup or immediately dispatch a replacement.
            </li>
          </ol>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            4. Order Cancellation Before Dispatch
          </h2>
          <p>
            You may cancel an order free of charge at any time prior to courier dispatch. To request a cancellation, contact our concierge immediately via WhatsApp. Once an order is handed over to the courier and assigned a tracking consignment number, it cannot be canceled in transit.
          </p>
        </section>
      </div>

      {/* Support Box */}
      <div className="mt-10 bg-[#FFF9F5] border border-[#D4AF37]/40 p-6 rounded-[2px] text-center font-sans">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
          Need to report an issue with your parcel?
        </h3>
        <p className="text-xs text-[#666666] mb-4">
          Send your unboxing photo and order number directly to our WhatsApp support team.
        </p>
        <a
          href="https://wa.me/8801754502430"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors shadow-xs"
        >
          <MessageCircle size={15} />
          <span>Report Issue via WhatsApp (+880 1754-502430)</span>
        </a>
      </div>
    </main>
  );
}
