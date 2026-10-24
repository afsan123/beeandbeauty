export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface WindowEntry {
  timestamps: number[];
}

const windows = new Map<string, WindowEntry>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const entry = windows.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldest = entry.timestamps[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    windows.set(key, entry);
    return { ok: false, remaining: 0, retryAfterSeconds };
  }

  entry.timestamps.push(now);
  windows.set(key, entry);
  return {
    ok: true,
    remaining: Math.max(0, limit - entry.timestamps.length),
    retryAfterSeconds: 0,
  };
}

export function resetRateLimit(key?: string): void {
  if (key) {
    windows.delete(key);
    return;
  }
  windows.clear();
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return {
    error: 'Too many requests. Please try again shortly.',
    retryAfterSeconds,
  };
}
