'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, CheckCircle2, Send, MessageCircle } from 'lucide-react';

interface ContactFormData {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Order Status & Tracking',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketNumber, setTicketNumber] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please provide details (minimum 10 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit inquiry.');
      }

      setTicketNumber(data.ticketNumber);
      setIsSubmitted(true);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Error submitting message.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ContactFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleReset = () => {
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      subject: 'Order Status & Tracking',
      message: '',
    });
    setTicketNumber(null);
    setSubmitError(null);
    setIsSubmitted(false);
  };

  return (
    <main className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-14 font-sans">
      {/* Breadcrumbs */}
      <nav className="text-[11px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-8">
        <Link href="/" className="hover:text-[#6A1B6D]">
          Home
        </Link>
        <span>/</span>
        <span className="text-[#6A1B6D] font-medium">Customer Support</span>
      </nav>

      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] block mb-2 font-sans">
          Concierge Support
        </span>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-[0.12em] text-[#6A1B6D] font-serif">
          How Can We Help You?
        </h1>
        <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed">
          Whether you need shade-matching advice, have questions about your delivery, or need order support, our beauty advisors are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start max-w-5xl mx-auto">
        {/* Left Column: Direct Contact Info */}
        <div className="lg:col-span-5 bg-white border border-[#F0E6DD] p-6 sm:p-8 rounded-[2px] shadow-2xs space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D] font-serif pb-3 border-b border-[#F0E6DD]">
            Contact Channels
          </h2>

          <div className="space-y-5 text-xs text-[#2C2C2C]">
            <div className="flex items-start gap-3">
              <Phone size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-0.5">
                  Mobile &amp; Hotline
                </strong>
                <a href="tel:+8801754502430" className="hover:text-[#C2188B] font-medium">
                  +880 1754-502430
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MessageCircle size={18} className="text-[#25D366] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-0.5">
                  WhatsApp Support
                </strong>
                <a
                  href="https://wa.me/8801754502430"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#25D366] font-bold hover:underline"
                >
                  +880 1754-502430 (Direct Chat)
                </a>
                <p className="text-[#666666] text-[11px] mt-0.5">
                  Instant shade consultations &amp; order tracking
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-0.5">
                  Email Support
                </strong>
                <a href="mailto:beeandbeauty.bd@gmail.com" className="hover:text-[#C2188B] font-medium">
                  beeandbeauty.bd@gmail.com
                </a>
                <p className="text-[#666666] text-[11px] mt-0.5">Response within 24 business hours</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={18} className="text-[#D4AF37] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-0.5">
                  Advisory Hours
                </strong>
                <p>Saturday – Thursday: 10:00 AM – 8:00 PM</p>
                <p className="text-[#666666] text-[11px] mt-0.5">Friday closed for restock &amp; formulations</p>
              </div>
            </div>

            {/* Social Channels */}
            <div className="pt-2 border-t border-[#F0E6DD]">
              <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-2 text-[11px]">
                Social Media
              </strong>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <a
                  href="https://www.facebook.com/BeeandBeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#666666] hover:text-[#6A1B6D]"
                >
                  &bull; Facebook
                </a>
                <a
                  href="https://www.instagram.com/beeyoubebeauty/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#666666] hover:text-[#C2188B]"
                >
                  &bull; Instagram (@beeyoubebeauty)
                </a>
                <a
                  href="https://www.tiktok.com/@beeandbeauty.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#666666] hover:text-[#2C2C2C]"
                >
                  &bull; TikTok (@beeandbeauty.online)
                </a>
                <a
                  href="https://www.threads.net/@beeyoubebeauty"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#666666] hover:text-[#6A1B6D]"
                >
                  &bull; Threads (@beeyoubebeauty)
                </a>
              </div>
            </div>
          </div>

          <a
            href="https://wa.me/8801754502430"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded transition-colors shadow-xs"
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="lg:col-span-7 bg-white border border-[#F0E6DD] p-6 sm:p-8 rounded-[2px] shadow-2xs">
          {isSubmitted ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto border border-[#C8E6C9]">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
                Inquiry Received
              </h3>
              {ticketNumber && (
                <div className="inline-block px-3 py-1 bg-[#FFF9F5] border border-[#F0E6DD] rounded text-xs font-mono font-bold text-[#6A1B6D]">
                  Ticket: #{ticketNumber}
                </div>
              )}
              <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed">
                Thank you, <strong>{formData.fullName}</strong>. Your inquiry regarding &ldquo;{formData.subject}&rdquo; has been saved to our customer support desk. We will get back to you at <strong>{formData.email}</strong> within 4-6 business hours.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#6A1B6D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-[2px] hover:bg-[#521354] transition-colors cursor-pointer"
                >
                  Send Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Samira Rahman"
                    className={`w-full px-3 py-2.5 text-xs bg-white border ${
                      errors.fullName ? 'border-[#C53030]' : 'border-[#F0E6DD]'
                    } rounded-[2px] outline-hidden focus:border-[#6A1B6D]`}
                  />
                  {errors.fullName && (
                    <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="samira@example.com"
                    className={`w-full px-3 py-2.5 text-xs bg-white border ${
                      errors.email ? 'border-[#C53030]' : 'border-[#F0E6DD]'
                    } rounded-[2px] outline-hidden focus:border-[#6A1B6D]`}
                  />
                  {errors.email && (
                    <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1712-345678"
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Inquiry Topic
                  </label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
                  >
                    <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                    <option value="Shade Consultation & Advice">Shade Consultation &amp; Advice</option>
                    <option value="Product Feedback or Issue">Product Feedback or Issue</option>
                    <option value="Wholesale & Press Inquiries">Wholesale &amp; Press Inquiries</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                  How can we assist you? *
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us what shade you're looking for or your order reference number..."
                  className={`w-full px-3 py-2.5 text-xs bg-white border ${
                    errors.message ? 'border-[#C53030]' : 'border-[#F0E6DD]'
                  } rounded-[2px] outline-hidden focus:border-[#6A1B6D] resize-none`}
                />
                {errors.message && (
                  <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.message}</p>
                )}
              </div>

                {submitError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px]">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#6A1B6D] hover:bg-[#521354] disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider py-3 px-8 rounded-[2px] transition-colors cursor-pointer disabled:cursor-not-allowed shadow-xs"
                  >
                    <Send size={14} />
                    <span>{isSubmitting ? 'Sending to Support Desk...' : 'Send Message'}</span>
                  </button>
                </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
