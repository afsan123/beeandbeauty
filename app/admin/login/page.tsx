'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation.js';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1C031F] via-[#2D0831] to-[#140216] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Emblem */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-[var(--bb-plum)] to-[var(--bb-magenta)] shadow-xl ring-2 ring-[var(--bb-gold)]/50">
            <span className="text-3xl font-serif">🐝</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-white">
            Bee & Beauty
          </h1>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--bb-gold)]">
            Executive Operations Control
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[var(--bb-gold)]/30 bg-[#25062A]/90 p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/50 bg-rose-900/30 p-3 text-xs font-semibold text-rose-200">
                ⚠ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5 tracking-wider">
                Executive Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@beeandbeauty.bd"
                className="w-full rounded-xl border border-stone-600 bg-[#1A031E] px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[var(--bb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--bb-gold)] transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-300 uppercase mb-1.5 tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full rounded-xl border border-stone-600 bg-[#1A031E] px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[var(--bb-gold)] focus:outline-none focus:ring-1 focus:ring-[var(--bb-gold)] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-[var(--bb-plum)] via-[#9D174D] to-[var(--bb-magenta)] py-3 px-4 text-sm font-bold text-white shadow-lg hover:shadow-xl hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Authenticating...</span>
                </span>
              ) : (
                'Sign In to Control Center'
              )}
            </button>
          </form>

          {/* Return link */}
          <div className="mt-6 pt-6 border-t border-[#6A1B6D]/40 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-stone-400 hover:text-white transition-colors"
            >
              &larr; Return to Bee & Beauty Public Storefront
            </Link>
          </div>
        </div>

        {/* Security watermark */}
        <p className="mt-8 text-center text-[11px] text-stone-500">
          Encrypted Session &bull; Supabase PostgreSQL Guarded &bull; 2026 Bee & Beauty
        </p>
      </div>
    </div>
  );
}
