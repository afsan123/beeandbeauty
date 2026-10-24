import crypto from 'node:crypto';

export function sha256Buffer(value: string): Buffer {
  return crypto.createHash('sha256').update(value).digest();
}

export function timingSafeEqualString(a: string, b: string): boolean {
  const left = sha256Buffer(a ?? '');
  const right = sha256Buffer(b ?? '');
  return crypto.timingSafeEqual(left, right);
}

export function timingSafeEqualEncoded(expected: string, actual: string): boolean {
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export function randomToken(bytes = 24): string {
  return crypto.randomBytes(bytes).toString('base64url');
}

export function generateOrderNumber(): string {
  const serial = Math.floor(10000 + Math.random() * 90000);
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `BB-2026-${serial}-${suffix}`;
}
