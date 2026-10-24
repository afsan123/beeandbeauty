import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isTestRuntime,
} from '../env.ts';

let cachedAdmin: SupabaseClient | null = null;

export function isSupabaseAdminReady(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

function isBuildTime(): boolean {
  const phase = process.env.NEXT_PHASE || '';
  return phase === 'phase-production-build' || phase === 'phase-export';
}

/**
 * Lazy server-only admin client. Never created at module scope so
 * `next build` can prerender without Vercel env vars.
 * Throws a clear error at runtime when secrets are missing.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin;

  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey();

  if (url && key) {
    cachedAdmin = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cachedAdmin;
  }

  if (isBuildTime() || isTestRuntime()) {
    cachedAdmin = createClient('https://unconfigured.supabase.invalid', 'unconfigured-build-placeholder', {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return cachedAdmin;
  }

  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add both in Vercel → Project Settings → Environment Variables (Production, Preview, and Development), then redeploy.'
  );
}

export function tryGetSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseAdminReady()) return null;
  return getSupabaseAdmin();
}

export function assertSupabaseAdminConfigured(): void {
  if (!isSupabaseAdminReady()) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add both in Vercel → Project Settings → Environment Variables, then redeploy.'
    );
  }
}

/**
 * Compatible accessor used by existing services. First property access is
 * lazy. Queries fail closed when secrets are missing at runtime.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (!isSupabaseAdminReady()) {
      throw new Error(
        'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Add both in Vercel → Project Settings → Environment Variables, then redeploy.'
      );
    }
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
