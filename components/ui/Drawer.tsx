'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: 'right' | 'left';
  width?: string;
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  side = 'right',
  width = 'max-w-md',
  className,
}: DrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] overflow-hidden" role="presentation">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel Container */}
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full z-[101]',
          side === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-screen bg-[#FFF9F5] shadow-2xl flex flex-col transition-transform duration-300',
            width,
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#F0E6DD] bg-white shrink-0">
            <div className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D]">
              {title}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 text-neutral-500 hover:text-[#6A1B6D] transition-colors cursor-pointer rounded-full hover:bg-[#FCE4EC]/50"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 overscroll-contain">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-[#F0E6DD] bg-white px-5 py-4 shrink-0">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
