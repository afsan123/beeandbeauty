'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserSupabaseClient } from '../../../lib/supabase/client.ts';

export default function SetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkError, setLinkError] = useState('');

  // Supabase's built-in invite / admin reset emails use the implicit flow and
  // deliver tokens in the URL fragment. Turn them into a cookie session.
  useEffect(() => {
    const hash = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : '';
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const clearHash = () =>
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

    if (params.get('error') || params.get('error_code')) {
      setLinkError('This link is invalid or has expired. Request a new one from the sign-in page.');
      clearHash();
      return;
    }

    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (!accessToken || !refreshToken) return;

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(({ error: sessionError }) => {
        if (sessionError) {
          setLinkError('This link is invalid or has expired. Request a new one from the sign-in page.');
        }
      })
      .finally(clearHash);
  }, []);

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
        {linkError && (
          <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
            {linkError}{' '}
            <Link href="/account/login" className="underline">
              Go to sign in
            </Link>
          </p>
        )}
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
