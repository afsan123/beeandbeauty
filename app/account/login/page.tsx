'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to sign in.');
      router.push('/account/orders');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 font-sans">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">Customer account</p>
      <h1 className="text-3xl font-serif text-[#6A1B6D] mb-3">Sign in</h1>
      <p className="text-sm text-neutral-600 mb-8">
        After checkout we email a password link when mail is configured. You can also track any order with your
        reference number and mobile number.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-[#F0E6DD] rounded-2xl p-6">
        {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#F0E6DD] px-3 py-2.5 text-sm text-[#2C2C2C]"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#F0E6DD] px-3 py-2.5 text-sm text-[#2C2C2C]"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#6A1B6D] text-white py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="text-xs text-neutral-500 mt-6">
        Guest checkout? <Link href="/track-order" className="text-[#6A1B6D] underline">Track an order</Link>
      </p>
    </main>
  );
}
