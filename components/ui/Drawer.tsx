'use client';

import React, { useEffect } from 'react';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        className={cn(
          'fixed inset-y-0 flex max-w-full',
          side === 'right' ? 'right-0' : 'left-0'
        )}
      >
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            'w-screen bg-white shadow-2xl flex flex-col transition-transform duration-300 animate-in',
            side === 'right' ? 'slide-in-from-right' : 'slide-in-from-left',
            width,
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4.5 border-b border-neutral-100 bg-white">
            <div className="text-sm font-bold uppercase tracking-wider text-[#111111]">
              {title}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 -mr-1.5 text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="border-t border-neutral-100 bg-[#FBFBFA] px-6 py-4">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
