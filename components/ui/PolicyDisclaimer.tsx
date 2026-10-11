import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface PolicyDisclaimerProps {
  title?: string;
  message?: string;
  className?: string;
}

export function PolicyDisclaimer({
  title = 'Draft for Development | Pending Final Approval',
  message = 'All policy conditions, delivery schedules, and return procedures outlined on this page are preliminary drafts prepared for technical preview. They must be confirmed and approved by Bee & Beauty management prior to official commercial publication.',
  className,
}: PolicyDisclaimerProps) {
  return (
    <div
      className={`bg-[#FFF0F5] border border-[#C2188B]/30 rounded-[2px] p-4 my-6 text-xs text-[#2C2C2C] flex items-start gap-3 shadow-2xs ${
        className || ''
      }`}
    >
      <AlertCircle size={18} className="text-[#C2188B] shrink-0 mt-0.5" />
      <div>
        <strong className="block text-[#6A1B6D] uppercase tracking-wider font-bold mb-0.5 font-sans">
          {title}
        </strong>
        <p className="text-[#666666] leading-relaxed font-sans">{message}</p>
      </div>
    </div>
  );
}
