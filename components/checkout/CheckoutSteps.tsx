'use client';

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../lib/cn';

export interface CheckoutStepItem {
  number: number;
  label: string;
}

export interface CheckoutStepsProps {
  currentStep: number;
  steps?: CheckoutStepItem[];
  onStepClick?: (stepNumber: number) => void;
}

const DEFAULT_STEPS: CheckoutStepItem[] = [
  { number: 1, label: 'Customer Info' },
  { number: 2, label: 'Shipping' },
  { number: 3, label: 'Payment' },
  { number: 4, label: 'Confirmation' },
];

export function CheckoutSteps({
  currentStep,
  steps = DEFAULT_STEPS,
  onStepClick,
}: CheckoutStepsProps) {
  return (
    <div className="w-full py-4 border-b border-neutral-200 bg-white">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = isCompleted && onStepClick;

          return (
            <React.Fragment key={step.number}>
              {/* Step Pill */}
              <div
                onClick={() => isClickable && onStepClick(step.number)}
                className={cn(
                  'flex items-center gap-2 transition-colors',
                  isClickable ? 'cursor-pointer' : 'cursor-default'
                )}
              >
                <div
                  className={cn(
                    'w-6 h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                    isCompleted && 'bg-[#6A1B6D] text-white',
                    isCurrent && 'bg-[#D4AF37] text-white ring-2 ring-offset-2 ring-[#D4AF37]',
                    !isCompleted && !isCurrent && 'bg-neutral-200 text-neutral-500'
                  )}
                >
                  {isCompleted ? <Check size={14} /> : step.number}
                </div>

                <span
                  className={cn(
                    'text-[11px] md:text-xs font-semibold uppercase tracking-wider hidden sm:inline-block',
                    isCurrent && 'text-[#6A1B6D] font-bold',
                    isCompleted && 'text-neutral-700',
                    !isCompleted && !isCurrent && 'text-neutral-400'
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connecting line */}
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-[2px] mx-2 md:mx-4 transition-colors',
                    step.number < currentStep ? 'bg-[#6A1B6D]' : 'bg-neutral-200'
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
