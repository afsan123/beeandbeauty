import type { NextResponse } from 'next/server.js';

const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  "media-src 'self' https://*.supabase.co",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  'upgrade-insecure-requests',
].join('; ');

export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': CSP,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'Cross-Origin-Opener-Policy': 'same-origin',
  // Limits leftover platform wildcards on prerendered HTML (not set in this repo).
  'Cross-Origin-Resource-Policy': 'same-origin',
};

export function applySecurityHeaders(res: NextResponse): NextResponse {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(key, value);
  }
  // Never advertise a wildcard CORS policy on HTML or API responses.
  // Vercel prerenders of public HTML have been observed adding `*`; API routes
  // in this app do not set CORS. Deleting here covers proxy-owned responses.
  if (res.headers.get('Access-Control-Allow-Origin') === '*') {
    res.headers.delete('Access-Control-Allow-Origin');
  }
  return res;
}
