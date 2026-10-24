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
  return (
    cleanEnv(process.env.NEXT_PUBLIC_SITE_URL) ||
    cleanEnv(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    'http://localhost:3000'
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      (cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
        cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
        cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY))
  );
}

export function getSupabaseUrl(): string | null {
  return cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | null {
  return (
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnv(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
  );
}

export function getSupabaseServiceRoleKey(): string | null {
  return (
    cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    cleanEnv(process.env.SUPABASE_SECRET_KEY)
  );
}
