import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Shield, Lock, Eye, Mail } from 'lucide-react';
import { PolicyDisclaimer } from '../../components/ui/PolicyDisclaimer';

export const metadata: Metadata = {
  title: 'Privacy Policy | Bee & Beauty Bangladesh',
  description:
    'Bee & Beauty customer privacy policy, personal data protection, order details handling, and courier data sharing.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-8 md:py-14">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8 font-sans">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Privacy Policy</span>
      </nav>

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Security &amp; Confidentiality
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
          Privacy Policy
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed font-sans">
          How Bee &amp; Beauty collects, protects, and handles your personal information with uncompromising integrity.
        </p>
      </div>

      {/* Staging disclaimer */}
      <PolicyDisclaimer
        title="Privacy Policy Status: Draft for Development (Pending Final Review)"
        message="This privacy declaration reflects currently proposed technical and operational practices for Bee & Beauty. Final legal wording is pending formal corporate counsel review in compliance with relevant data privacy provisions in Bangladesh."
      />

      {/* Main Content Sections */}
      <div className="space-y-8 text-xs text-[#2C2C2C] font-sans leading-relaxed my-10">
        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            1. Information We Collect
          </h2>
          <p className="mb-2">
            When you browse, register, or place an order on Bee &amp; Beauty, we collect the necessary information to complete fulfillment:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>
              <strong>Contact Details:</strong> Full name, phone number, and email address.
            </li>
            <li>
              <strong>Delivery Destination:</strong> Street address, apartment/floor, police station/thana, district, and postal code.
            </li>
            <li>
              <strong>Order History &amp; Preferences:</strong> Purchased shade varieties, order timestamps, and cart activity.
            </li>
            <li>
              <strong>Device &amp; Usage Telemetry:</strong> Anonymized browser version, IP address, and cookie identifiers for session management.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            2. How We Use Your Data
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>To process, pack, and deliver your cosmetics orders within our target delivery windows.</li>
            <li>To transmit automated SMS/WhatsApp dispatch tracking updates and delivery alerts.</li>
            <li>To provide personalized shade consultations and customer care through our concierge team.</li>
            <li>To detect and prevent fraudulent transactions or unauthorized order submissions.</li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            3. Sharing with Logistics &amp; Payment Providers
          </h2>
          <p className="mb-2">
            Bee &amp; Beauty never sells or leases your personal information to third-party marketing brokers. Data is shared strictly on a need-to-know basis with essential operational service partners:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-[#666666]">
            <li>
              <strong>Courier Partners:</strong> Name, delivery address, and phone number are shared with third-party courier services (e.g., Steadfast, Pathao, RedX) solely for parcel delivery.
            </li>
            <li>
              <strong>Payment Gateways:</strong> For bKash and Nagad transactions, payment details are processed through encrypted, compliant financial gateways. Bee &amp; Beauty does not store bank account passwords, bKash PINs, or debit/credit card CVVs on its servers.
            </li>
          </ul>
        </section>

        <section className="bg-white p-6 rounded-[2px] border border-[#F0E6DD]">
          <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-3">
            4. Data Retention &amp; Customer Rights
          </h2>
          <p className="mb-2">
            We retain order records for accounting, legal compliance, and warranty/return verification purposes. You may request to review, update, or permanently delete your contact profile from our newsletter database at any time by contacting us.
          </p>
          <p>
            For privacy inquiries or deletion requests, contact our Data Representative at{' '}
            <a href="mailto:beeandbeauty.bd@gmail.com" className="text-[#6A1B6D] font-bold underline">
              beeandbeauty.bd@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
