import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { SearchClient } from '../../components/search/SearchClient';

export const metadata: Metadata = {
  title: 'Search Cosmetics | Bee&Beauty',
  description: 'Search for luxury lipsticks, serum foundations, and clean beauty formulas by Bee&Beauty.',
};

export default function SearchPage() {
  return (
    <main>
      <Suspense
        fallback={
          <div className="max-w-[1360px] mx-auto px-4 py-16 text-center text-xs text-neutral-500">
            Loading search...
          </div>
        }
      >
        <SearchClient />
      </Suspense>
    </main>
  );
}
