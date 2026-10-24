export function cleanEnv(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim().replace(/^['"]|['"]$/g, '').trim();
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') {
    return null;
  }
  return trimmed;
}

export function isTestRuntime(): boolean {
  return process.env.NODE_ENV === 'test' || Boolean(process.env.NODE_TEST_CONTEXT);
}

export function isProductionRuntime(): boolean {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production'
  );
}

export function getSiteUrl(): string {
  const raw =
    cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    'http://localhost:3000';
  // VERCEL_PROJECT_PRODUCTION_URL is a bare host; auth redirects need a scheme.
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, '');
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
        cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
        cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY))
  );
}

export function getSupabaseUrl(): string | null {
  return cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

/**
 * Public (browser-safe) Supabase key. Prefers the new `sb_publishable_...`
 * key and falls back to the legacy anon JWT so the legacy keys can be
 * disabled in Supabase once the publishable key is deployed.
 * Literal `process.env.NEXT_PUBLIC_*` references are required so Next.js
 * inlines them into client bundles.
 */
export function getSupabasePublishableKey(): string | null {
  return (
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

/** @deprecated Use getSupabasePublishableKey(). Kept for existing imports. */
export const getSupabaseAnonKey = getSupabasePublishableKey;

export function getSupabaseServiceRoleKey(): string | null {
  return (
    cleanEnv(process.env.SUPABASE_SECRET_KEY) ||
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}
