'use client';

import React from 'react';
import { cn } from '../../lib/cn';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 border-b border-neutral-200 overflow-x-auto no-scrollbar', className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'relative py-3 px-4 text-xs font-medium uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer select-none',
              isActive
                ? 'text-[#111111] font-semibold'
                : 'text-neutral-500 hover:text-neutral-900'
            )}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span className="ml-1.5 text-[10px] text-neutral-400">
                ({tab.count})
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#111111]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
