import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Truck, Clock, ShieldCheck, MapPin, AlertCircle, Phone } from 'lucide-react';
import { PolicyDisclaimer } from '../../components/ui/PolicyDisclaimer';

export const metadata: Metadata = {
  title: 'Delivery Policy | Bee & Beauty Bangladesh',
  description:
    'Bee & Beauty delivery timelines, target 24h inside Dhaka and 48h outside Dhaka, courier tracking, and delivery terms in Bangladesh.',
};

export default function DeliveryPolicyPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8 font-sans">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Delivery Policy</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Nationwide Dispatch
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
          Delivery Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed font-sans">
          Swift, temperature-conscious, and tracked doorstep delivery across all 64 districts of Bangladesh.
        </p>
      </div>

      {/* Staging disclaimer notice */}
      <PolicyDisclaimer
        title="Delivery Policy Status: Draft for Development (Pending Business Approval)"
        message="The delivery timelines and fee structures below are target proposals under operational review. Guaranteed service levels, holiday schedules, and final shipping rates will be published following written owner approval."
      />

      {/* Target Timelines Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-10 font-sans">
        <div className="bg-white border border-[#F0E6DD] p-6 rounded-[2px] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#6A1B6D] mb-4">
            <Clock size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
            Metropolitan Express
          </span>
          <h2 className="text-xl font-bold text-[#6A1B6D] font-serif mt-1 mb-2">
            Inside Dhaka City
          </h2>
          <div className="text-2xl font-bold text-[#2C2C2C] mb-3 font-serif">
            Target 24 Hours
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Orders confirmed before 2:00 PM are dispatched same-day for targeted next-day arrival across all Dhaka metropolitan zones including Banani, Gulshan, Dhanmondi, Uttara, Mirpur, and Old Dhaka.
          </p>
          <div className="mt-4 pt-3 border-t border-[#F0E6DD] text-[11px] text-[#6A1B6D] font-semibold">
            Standard Fee: ৳80 &bull; Complimentary on orders above ৳1,499
          </div>
        </div>

        <div className="bg-white border border-[#F0E6DD] p-6 rounded-[2px] shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-[#FFF9F5] border border-[#D4AF37]/40 flex items-center justify-center text-[#C2188B] mb-4">
            <Truck size={22} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#C2188B]">
            All 64 Districts
          </span>
          <h2 className="text-xl font-bold text-[#6A1B6D] font-serif mt-1 mb-2">
            Outside Dhaka
          </h2>
          <div className="text-2xl font-bold text-[#2C2C2C] mb-3 font-serif">
            Target 48 Hours
          </div>
          <p className="text-xs text-[#666666] leading-relaxed">
            Targeted delivery within 48 to 72 business hours to Chittagong, Sylhet, Rajshahi, Khulna, Barisal, Rangpur, Mymensingh, and all surrounding upazilas via vetted express couriers.
          </p>
          <div className="mt-4 pt-3 border-t border-[#F0E6DD] text-[11px] text-[#C2188B] font-semibold">
            Standard Fee: ৳130 &bull; Complimentary on orders above ৳1,499
          </div>
        </div>
      </div>

      {/* Detailed Policy Sections */}
      <div className="space-y-8 text-xs text-[#2C2C2C] font-sans leading-relaxed">
        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            1. Order Confirmation &amp; Processing Workflow
          </h2>
          <p className="mb-2">
            Once you complete checkout on Bee &amp; Beauty, your order status is set to &ldquo;Processing.&rdquo; For first-time Cash on Delivery orders, our concierge team may place a brief verification call or WhatsApp message to verify the street address and mobile contact number.
          </p>
          <p>
            Delivery timelines commence from the moment official order verification is confirmed by the merchant, rather than the raw cart checkout timestamp.
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            2. Courier Partners &amp; Real-Time Tracking
          </h2>
          <p className="mb-2">
            Bee &amp; Beauty collaborates with premier logistics partners in Bangladesh (including Steadfast, Pathao Courier, RedX, and Paperfly). When your parcel is handed over to the courier, an automated SMS notification containing a direct tracking consignment link is sent to your registered mobile number.
          </p>
          <p>
            You may also check real-time tracking anytime by reaching out to our WhatsApp concierge at{' '}
            <a
              href="https://wa.me/8801754502430"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#6A1B6D] font-bold underline"
            >
              +880 1754-502430
            </a>
            .
          </p>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            3. Delivery Charges Structure (Draft)
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>
              <strong>Inside Dhaka:</strong> Proposed ৳80 flat delivery fee.
            </li>
            <li>
              <strong>Outside Dhaka:</strong> Proposed ৳130 flat delivery fee.
            </li>
            <li>
              <strong>Free Shipping Threshold:</strong> All retail orders with subtotal exceeding ৳1,499 qualify for 100% complimentary standard delivery across Bangladesh.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            4. Unforeseen Delays &amp; Holiday Exceptions
          </h2>
          <p>
            While our target turnaround is 24 hours inside Dhaka and 48 hours nationwide, unforeseen logistics factors (such as extreme weather events, hartals, or peak festival rushes around Eid or Puja) may temporarily cause delivery delays. In any such situation, customers will receive prompt proactive notifications via SMS or WhatsApp.
          </p>
        </section>
      </div>

      {/* Support Box */}
      <div className="mt-10 bg-[#FFF9F5] border border-[#D4AF37]/40 p-6 rounded-[2px] text-center font-sans">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
          Have an urgent delivery inquiry?
        </h3>
        <p className="text-xs text-[#666666] mb-4">
          Speak directly with our Dhaka dispatch concierge team on WhatsApp.
        </p>
        <a
          href="https://wa.me/8801754502430"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded transition-colors shadow-xs"
        >
          <Phone size={14} />
          <span>WhatsApp +880 1754-502430</span>
        </a>
      </div>
    </main>
  );
}
