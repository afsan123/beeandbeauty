import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAnonKey, getSupabaseUrl } from '../env.ts';

let browserClient: SupabaseClient | null = null;

/**
 * Public browser client. Uses only the anon/publishable key.
 * Returns null when env vars are absent so prerender and local builds succeed.
 */
export function createBrowserSupabaseClient(): SupabaseClient | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const url = getSupabaseUrl();
  const key = getSupabaseAnonKey();
  if (!url || !key) {
    return null;
  }

  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}

export function getBrowserSupabaseOrThrow(): SupabaseClient {
  const client = createBrowserSupabaseClient();
  if (!client) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add the public keys in Vercel environment variables.'
    );
  }
  return client;
}
