import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { TrackOrderClient } from '../../components/orders/TrackOrderClient';

export const metadata: Metadata = {
  title: 'Track Your Order | Bee & Beauty Bangladesh',
  description:
    'Track your Bee & Beauty order delivery status, dispatch timeline, and courier transit across Dhaka and nationwide Bangladesh.',
};

function TrackOrderSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse font-sans">
      <div className="h-4 w-32 bg-[#F0E6DD] rounded mx-auto mb-3" />
      <div className="h-8 w-64 bg-[#F0E6DD] rounded mx-auto mb-6" />
      <div className="bg-white p-6 rounded-[2px] border border-[#F0E6DD] space-y-4">
        <div className="h-10 bg-[#F5ECE5] rounded" />
        <div className="h-10 bg-[#F5ECE5] rounded" />
        <div className="h-12 bg-[#F0E6DD] rounded" />
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-[#FFF9F5] py-10 md:py-16">
      <Suspense fallback={<TrackOrderSkeleton />}>
        <TrackOrderClient />
      </Suspense>
    </main>
  );
}
