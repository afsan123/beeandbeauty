'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 pt-8 select-none">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 border border-neutral-300 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
        const isActive = pageNum === currentPage;
        return (
          <button
            key={pageNum}
            type="button"
            onClick={() => onPageChange(pageNum)}
            className={`w-9 h-9 text-xs font-semibold rounded-xs border transition-colors cursor-pointer ${
              isActive
                ? 'bg-[#111111] text-white border-[#111111]'
                : 'bg-white text-neutral-800 border-neutral-300 hover:border-black'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 border border-neutral-300 rounded-xs disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors cursor-pointer"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
