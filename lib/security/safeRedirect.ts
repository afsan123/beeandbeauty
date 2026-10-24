/**
 * Only allow same-site relative paths for post-auth redirects
 * (blocks `//evil.com`, `/\evil.com`, absolute URLs, etc.).
 */
export function safeNextPath(raw: string | null | undefined, fallback = '/account'): string {
  if (!raw) return fallback;
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return fallback;
  if (/[\r\n]/.test(raw)) return fallback;
  return raw;
}
