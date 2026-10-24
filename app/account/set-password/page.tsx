'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/account/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to set password.');
      router.push('/account/orders');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to set password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto px-4 py-16 font-sans">
      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D4AF37] mb-2">Customer account</p>
      <h1 className="text-3xl font-serif text-[#6A1B6D] mb-3">Set your password</h1>
      <p className="text-sm text-neutral-600 mb-8">
        Open this page from the email we send after checkout. We never claim an SMS was sent unless a message is actually dispatched.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-[#F0E6DD] rounded-2xl p-6">
        {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
          New password
          <input
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#F0E6DD] px-3 py-2.5 text-sm"
          />
        </label>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
          Confirm password
          <input
            type="password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-[#F0E6DD] px-3 py-2.5 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#6A1B6D] text-white py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save password'}
        </button>
      </form>
    </main>
  );
}
