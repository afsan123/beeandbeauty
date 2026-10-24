'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AccountLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'link') {
      setError('That email link is invalid or has expired. Request a new one below.');
      setMode('forgot');
    }
  }, []);

  const handleForgot = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const res = await fetch('/api/account/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to send a reset link.');
      setNotice(data.message || 'If an account exists for that email, we have sent a reset link.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send a reset link.');
    } finally {
      setLoading(false);
    }
  };

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
      {mode === 'forgot' ? (
        <form onSubmit={handleForgot} className="space-y-4 bg-white border border-[#F0E6DD] rounded-2xl p-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#6A1B6D]">Reset your password</h2>
          {error && <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">{error}</p>}
          {notice && (
            <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{notice}</p>
          )}
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
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#6A1B6D] text-white py-3 text-xs font-bold uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Email me a reset link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError('');
              setNotice('');
            }}
            className="w-full text-xs text-[#6A1B6D] underline"
          >
            Back to sign in
          </button>
        </form>
      ) : (
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
        <button
          type="button"
          onClick={() => {
            setMode('forgot');
            setError('');
          }}
          className="w-full text-xs text-[#6A1B6D] underline"
        >
          Forgot password?
        </button>
      </form>
      )}
      <p className="text-xs text-neutral-500 mt-6">
        Guest checkout? <Link href="/track-order" className="text-[#6A1B6D] underline">Track an order</Link>
      </p>
    </main>
  );
}
