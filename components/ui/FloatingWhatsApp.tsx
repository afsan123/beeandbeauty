'use client';

import React, { useState } from 'react';
import { MessageCircle, X, Sparkles, Truck, HelpCircle } from 'lucide-react';

const WHATSAPP_NUMBER =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, '')) ||
  '8801754502430';

interface PromptOption {
  icon: React.ReactNode;
  label: string;
  message: string;
}

const QUICK_PROMPTS: PromptOption[] = [
  {
    icon: <Sparkles size={14} className="text-[#D4AF37]" />,
    label: 'Shade Match Advice',
    message: 'Hello Bee & Beauty! I would love some expert advice on choosing the right shade for my skin tone.',
  },
  {
    icon: <Truck size={14} className="text-[#6A1B6D]" />,
    label: 'Track My Order',
    message: 'Hello Bee & Beauty! I would like to check the delivery status of my recent order.',
  },
  {
    icon: <HelpCircle size={14} className="text-[#C2188B]" />,
    label: 'Delivery & Payment Inquiry',
    message: 'Hello Bee & Beauty! I have a question about delivery timelines and bKash / COD payment options.',
  },
];

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);

  const openWhatsApp = (msg: string) => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <aside aria-label="Customer Support Concierge" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Pop-up dialog with quick prompts */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-lg shadow-2xl border border-[#F0E6DD] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#6A1B6D] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-[#D4AF37]">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                  Bee &amp; Beauty Concierge
                </h3>
                <p className="text-[10px] text-[#FCE4EC] mt-0.5">
                  Usually replies within minutes
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 transition-colors cursor-pointer"
              aria-label="Close WhatsApp Concierge"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-[#FFF9F5] space-y-2">
            <p className="text-xs text-[#2C2C2C] mb-3 leading-relaxed">
              Welcome to <strong>Bee &amp; Beauty</strong>! How can our beauty specialists help you today?
            </p>

            <div className="space-y-1.5">
              {QUICK_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => openWhatsApp(prompt.message)}
                  className="w-full text-left px-3 py-2.5 bg-white hover:bg-[#FCE4EC]/40 border border-[#F0E6DD] hover:border-[#C2188B]/40 rounded text-xs text-[#2C2C2C] font-medium transition-all flex items-center gap-2.5 shadow-2xs cursor-pointer group"
                >
                  <span className="shrink-0">{prompt.icon}</span>
                  <span className="group-hover:text-[#6A1B6D] transition-colors flex-1 text-[11px]">
                    {prompt.label}
                  </span>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => openWhatsApp('Hello Bee & Beauty, I would like to ask a question.')}
              className="w-full mt-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <MessageCircle size={15} />
              <span>Chat on WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* Main trigger pill / floating button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Chat on WhatsApp"
        className="w-11 h-11 sm:w-auto sm:h-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white sm:py-3 sm:px-4 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer group active:scale-95"
      >
        <MessageCircle size={22} className="group-hover:scale-110 transition-transform shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline-block">
          Need Help?
        </span>
      </button>
    </aside>
  );
}
