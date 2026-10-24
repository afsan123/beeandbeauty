/**
 * Only allow same-site relative paths for post-auth redirects
 * (blocks `//evil.com`, `/\evil.com`, `/\t/evil.com`, absolute URLs, etc.).
 *
 * The WHATWG URL parser strips tabs/newlines and treats `\` like `/`, so we
 * reject any control character or backslash outright and then confirm the
 * resolved URL stays on the same origin.
 */
export function safeNextPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;
  if (/[\u0000-\u001F\u007F\\]/.test(raw)) return fallback;
  try {
    const base = 'https://same-origin.invalid';
    const resolved = new URL(raw, base);
    if (resolved.origin !== base) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
