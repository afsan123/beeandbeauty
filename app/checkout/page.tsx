'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ShieldCheck,
  Truck,
  CreditCard,
  ArrowLeft,
  ArrowRight,
  ShoppingBag,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { useCart } from '../../store/cart';
import { CheckoutSteps } from '../../components/checkout/CheckoutSteps';
import { AddressForm, ShippingFormData } from '../../components/checkout/AddressForm';
import { OrderSummary } from '../../components/checkout/OrderSummary';
import { formatPrice } from '../../lib/price';
import { Logo } from '../../components/ui/Logo';

type PaymentMethod = 'cod' | 'bkash' | 'nagad';

export default function CheckoutPage() {
  const { items, totals, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState(1);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [shippingZone, setShippingZone] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  // Handle address submit from Step 1
  const handleAddressSubmit = (data: ShippingFormData) => {
    setShippingData(data);
    // Auto-detect Dhaka district
    if (data.district.toLowerCase().includes('dhaka')) {
      setShippingZone('dhaka');
    } else {
      setShippingZone('outside');
    }
    setCurrentStep(2);
  };

  // Handle shipping method submit from Step 2
  const handleShippingSubmit = () => {
    setCurrentStep(3);
  };

  // Handle place order from Step 3
  const handlePlaceOrder = () => {
    const randomOrderId = `BB-${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(randomOrderId);
    setCurrentStep(4);
    clearCart();
  };

  // Step 4: Order Confirmation
  if (currentStep === 4 && orderNumber) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center font-sans">
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-4 border border-[#C8E6C9]">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">
          Thank you for choosing Bee &amp; Beauty
        </span>
        <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
          Order Confirmed!
        </h1>

        <p className="text-xs md:text-sm text-[#666666] max-w-md mx-auto leading-relaxed mb-6">
          Your order <strong>#{orderNumber}</strong> has been successfully placed. We have sent a dispatch confirmation to{' '}
          <strong>{shippingData?.email || 'your email'}</strong> and SMS to <strong>{shippingData?.phone || 'your mobile'}</strong>.
        </p>

        <div className="bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] p-6 text-left text-xs space-y-3 mb-8 max-w-lg mx-auto shadow-2xs">
          <div className="flex justify-between border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500">Order Reference:</span>
            <span className="font-mono font-bold text-[#6A1B6D]">{orderNumber}</span>
          </div>
          <div className="flex justify-between border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500">Delivery Address:</span>
            <span className="font-medium text-[#2C2C2C] text-right">
              {shippingData?.streetAddress}, {shippingData?.district}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500">Payment Option:</span>
            <span className="font-bold text-[#6A1B6D] uppercase">
              {paymentMethod === 'cod'
                ? 'Cash on Delivery (COD)'
                : paymentMethod === 'bkash'
                ? 'bKash Mobile Payment'
                : 'Nagad Mobile Payment'}
            </span>
          </div>
          <div className="flex justify-between border-b border-[#F0E6DD] pb-2">
            <span className="text-neutral-500">Target Delivery Timeline:</span>
            <span className="font-semibold text-[#2E7D32]">
              {shippingZone === 'dhaka'
                ? 'Inside Dhaka: Target within 24 Hours'
                : 'Outside Dhaka: Target within 48 Hours'}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-[11px] text-neutral-500">
            <span>Direct Concierge Assistance:</span>
            <span className="font-semibold text-[#6A1B6D]">+880 1754-502430</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={`https://wa.me/8801754502430?text=${encodeURIComponent(
              `Hello Bee & Beauty, I just placed order #${orderNumber} and wanted to confirm dispatch details.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-[2px] transition-colors shadow-xs"
          >
            <MessageCircle size={15} />
            <span>Track on WhatsApp</span>
          </a>

          <Link
            href="/"
            className="w-full sm:w-auto inline-block bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-8 rounded-[2px] transition-colors shadow-xs"
          >
            Return to Storefront
          </Link>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="max-w-xl mx-auto px-4 py-20 text-center font-sans">
        <div className="w-14 h-14 rounded-full bg-[#FFF9F5] border border-[#F0E6DD] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag size={24} className="text-[#D4AF37]" />
        </div>
        <h1 className="text-xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif mb-2">
          Your Shopping Bag is Empty
        </h1>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto mb-6 leading-relaxed">
          Select your favorite lipsticks, foundations, or eye makeup essentials before proceeding to checkout.
        </p>
        <Link
          href="/shop/all"
          className="inline-block bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-wider py-3 px-6 rounded-[2px] transition-colors"
        >
          Explore Collection
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FFF9F5] pb-16 font-sans">
      {/* Checkout Header */}
      <div className="bg-white border-b border-[#F0E6DD] py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Logo variant="header" />
          <div className="flex items-center gap-2 text-xs text-[#2E7D32] font-semibold">
            <ShieldCheck size={16} />
            <span className="hidden sm:inline">256-Bit SSL Encrypted Checkout</span>
          </div>
        </div>
      </div>

      {/* Progressive Stepper */}
      <CheckoutSteps
        currentStep={currentStep}
        onStepClick={(step) => {
          if (step < currentStep) setCurrentStep(step);
        }}
      />

      {/* Main Form & Summary 2-Column Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Multi-Step Forms */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2px] border border-[#F0E6DD] shadow-2xs">
            {/* Step 1: Customer Contact & Shipping Address */}
            {currentStep === 1 && (
              <div>
                <div className="pb-3 mb-6 border-b border-[#F0E6DD]">
                  <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
                    Step 1: Contact &amp; Shipping Address
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Enter your name and doorstep delivery destination in Bangladesh.
                  </p>
                </div>
                <AddressForm
                  initialValues={shippingData || undefined}
                  onSubmit={handleAddressSubmit}
                />
              </div>
            )}

            {/* Step 2: Choose Delivery Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-[#F0E6DD]">
                  <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
                    Step 2: Choose Delivery Zone
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Delivering to: <strong>{shippingData?.fullName}</strong> ({shippingData?.district})
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Dhaka Zone */}
                  <label
                    className={`flex items-start gap-3 p-4 border rounded-[2px] cursor-pointer transition-all ${
                      shippingZone === 'dhaka'
                        ? 'border-[#6A1B6D] bg-[#FFF9F5]'
                        : 'border-[#F0E6DD] bg-white hover:border-[#6A1B6D]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingZone"
                      checked={shippingZone === 'dhaka'}
                      onChange={() => setShippingZone('dhaka')}
                      className="mt-1 accent-[#6A1B6D]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
                          Inside Dhaka City (Target within 24 Hours)
                        </span>
                        <span className="text-xs font-bold text-[#6A1B6D]">
                          {totals.shippingFee === 0 ? 'FREE' : '৳80'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Fast delivery across Banani, Gulshan, Dhanmondi, Uttara, Mirpur, and all Dhaka metropolitan zones.
                      </p>
                    </div>
                  </label>

                  {/* Outside Dhaka Zone */}
                  <label
                    className={`flex items-start gap-3 p-4 border rounded-[2px] cursor-pointer transition-all ${
                      shippingZone === 'outside'
                        ? 'border-[#6A1B6D] bg-[#FFF9F5]'
                        : 'border-[#F0E6DD] bg-white hover:border-[#6A1B6D]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shippingZone"
                      checked={shippingZone === 'outside'}
                      onChange={() => setShippingZone('outside')}
                      className="mt-1 accent-[#6A1B6D]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
                          Outside Dhaka (Target within 48 Hours)
                        </span>
                        <span className="text-xs font-bold text-[#6A1B6D]">
                          {totals.shippingFee === 0 ? 'FREE' : '৳130'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Nationwide delivery to all 64 districts including Chittagong, Sylhet, Rajshahi, Khulna, etc.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0E6DD]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#6A1B6D] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Address</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShippingSubmit}
                    className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3 px-6 rounded-[2px] transition-colors cursor-pointer shadow-xs"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment Options (COD, bKash, Nagad) */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="pb-3 border-b border-[#F0E6DD]">
                  <h2 className="text-base font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
                    Step 3: Payment &amp; Review
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Select your preferred payment method in Bangladesh.
                  </p>
                </div>

                <div className="space-y-3">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    className={`flex items-start gap-3 p-4 border rounded-[2px] cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#6A1B6D] bg-[#FFF9F5]'
                        : 'border-[#F0E6DD] bg-white hover:border-[#6A1B6D]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="mt-1 accent-[#6A1B6D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
                          Cash on Delivery (COD)
                        </span>
                        <Truck size={16} className="text-[#D4AF37]" />
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Pay in cash upon physical package delivery and inspection at your doorstep. Available nationwide.
                      </p>
                    </div>
                  </label>

                  {/* Option 2: bKash Mobile Payment */}
                  <label
                    className={`flex items-start gap-3 p-4 border rounded-[2px] cursor-pointer transition-all ${
                      paymentMethod === 'bkash'
                        ? 'border-[#6A1B6D] bg-[#FFF9F5]'
                        : 'border-[#F0E6DD] bg-white hover:border-[#6A1B6D]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="mt-1 accent-[#6A1B6D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#E2136E]">
                          bKash Online / Mobile Payment
                        </span>
                        <span className="text-[10px] font-bold bg-[#E2136E] text-white px-2 py-0.5 rounded-xs">
                          bKash
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Convenient mobile payment via bKash digital wallet (Merchant integration flow).
                      </p>
                    </div>
                  </label>

                  {/* Option 3: Nagad Mobile Payment */}
                  <label
                    className={`flex items-start gap-3 p-4 border rounded-[2px] cursor-pointer transition-all ${
                      paymentMethod === 'nagad'
                        ? 'border-[#6A1B6D] bg-[#FFF9F5]'
                        : 'border-[#F0E6DD] bg-white hover:border-[#6A1B6D]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'nagad'}
                      onChange={() => setPaymentMethod('nagad')}
                      className="mt-1 accent-[#6A1B6D]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#F7941D]">
                          Nagad Online / Mobile Payment
                        </span>
                        <span className="text-[10px] font-bold bg-[#F7941D] text-white px-2 py-0.5 rounded-xs">
                          Nagad
                        </span>
                      </div>
                      <p className="text-[11px] text-[#666666] mt-1">
                        Direct digital payment via Nagad mobile financial service.
                      </p>
                    </div>
                  </label>
                </div>

                <div className="p-3 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] text-[11px] text-[#666666] space-y-1">
                  <div className="flex items-center gap-2 font-semibold text-[#6A1B6D]">
                    <ShieldCheck size={14} className="text-[#D4AF37]" />
                    <span>Safe &amp; Protected Purchase Guarantee</span>
                  </div>
                  <p>
                    By clicking &ldquo;Complete Purchase&rdquo;, you confirm that your delivery details and order selections are correct. Payment settlement workflows are subject to official merchant verification.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#F0E6DD]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-[#6A1B6D] cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Shipping</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePlaceOrder}
                    className="bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-8 rounded-[2px] transition-all transform hover:-translate-y-0.5 cursor-pointer shadow-md"
                  >
                    Complete Purchase ({formatPrice(totals.total)})
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <OrderSummary items={items} totals={totals} />
          </div>
        </div>
      </div>
    </main>
  );
}
