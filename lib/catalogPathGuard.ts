import { getSupabasePublishableKey, getSupabaseUrl } from './env.ts';

/**
 * Fast existence check for /product/[slug] and /shop/[category], run in
 * proxy.ts *before* the page renders.
 *
 * Why: with cacheComponents + partialPrefetching, the page streams its App
 * Shell immediately, so a notFound() inside the page's <Suspense> boundary
 * can only render the not-found UI with a 200 status. Next.js 16 docs
 * recommend checking the slug in Proxy to return a real 404.
 *
 * The check is a single indexed `select id … limit 1` against the public
 * (RLS: public read) products/categories tables, cached briefly per
 * instance. Any error or missing config fails open (the page still calls
 * notFound(), just with a streamed 200 + noindex).
 */
export type CatalogKind = 'product' | 'category';

const RESERVED_CATEGORIES = new Set(['all', 'under499']);
const POSITIVE_TTL_MS = 60_000;
const NEGATIVE_TTL_MS = 15_000;
const MAX_ENTRIES = 2_000;
const cache = new Map<string, { exists: boolean; until: number }>();

export function matchCatalogPath(pathname: string): { kind: CatalogKind; slug: string } | null {
  const match = /^\/(product|shop)\/([^/]+)\/?$/.exec(pathname);
  if (!match) return null;
  let slug: string;
  try {
    slug = decodeURIComponent(match[2]);
  } catch {
    return null;
  }
  const kind: CatalogKind = match[1] === 'product' ? 'product' : 'category';
  if (kind === 'category' && RESERVED_CATEGORIES.has(slug)) return null;
  return { kind, slug };
}

export async function catalogPathExists(
  kind: CatalogKind,
  slug: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  if (!url || !key) return true;

  const cacheKey = `${kind}:${slug}`;
  const now = Date.now();
  const hit = cache.get(cacheKey);
  if (hit && hit.until > now) return hit.exists;

  const table = kind === 'product' ? 'products' : 'categories';
  const endpoint = `${url}/rest/v1/${table}?select=id&slug=eq.${encodeURIComponent(slug)}&limit=1`;
  const headers: Record<string, string> = { apikey: key, Accept: 'application/json' };
  // Legacy anon keys are JWTs and go in Authorization; sb_publishable_ keys must not.
  if (!key.startsWith('sb_')) headers.Authorization = `Bearer ${key}`;

  try {
    const res = await fetchImpl(endpoint, { headers, signal: AbortSignal.timeout(2_000), cache: 'no-store' });
    if (!res.ok) return true;
    const rows = (await res.json()) as unknown[];
    const exists = Array.isArray(rows) && rows.length > 0;
    if (cache.size >= MAX_ENTRIES) cache.clear();
    cache.set(cacheKey, { exists, until: now + (exists ? POSITIVE_TTL_MS : NEGATIVE_TTL_MS) });
    return exists;
  } catch {
    return true;
  }
}

export function clearCatalogPathCache() {
  cache.clear();
}
