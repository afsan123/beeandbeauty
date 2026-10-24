'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountHomePage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/account/orders')
      .then(async (res) => {
        if (res.status === 401) {
          router.replace('/account/login');
          return;
        }
        if (res.ok) setEmail('signed-in');
      })
      .catch(() => router.replace('/account/login'));
  }, [router]);

  return (
    <main className="max-w-2xl mx-auto px-4 py-16 font-sans">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">Bee & Beauty</p>
      <h1 className="text-3xl font-serif text-[#6A1B6D] mb-4">Your account</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Review past orders, set a password from your confirmation email, or reach concierge on WhatsApp at +8801754502430.
      </p>
      <div className="grid gap-3">
        <Link href="/account/orders" className="rounded-2xl border border-[#F0E6DD] bg-white p-5 text-sm font-semibold text-[#6A1B6D]">
          View order history
        </Link>
        <Link href="/account/set-password" className="rounded-2xl border border-[#F0E6DD] bg-white p-5 text-sm font-semibold text-[#6A1B6D]">
          Set or update password
        </Link>
        <Link href="/track-order" className="rounded-2xl border border-[#F0E6DD] bg-white p-5 text-sm font-semibold text-[#6A1B6D]">
          Track a guest order
        </Link>
      </div>
      {email && (
        <button
          type="button"
          onClick={async () => {
            await fetch('/api/account/logout', { method: 'POST' });
            router.push('/account/login');
          }}
          className="mt-8 text-xs uppercase tracking-wider text-neutral-500 underline"
        >
          Sign out
        </button>
      )}
    </main>
  );
}
