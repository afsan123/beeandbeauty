import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createAdminToken,
  verifyAdminToken,
  resolveAdminUser,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
} from '../services/adminAuthToken.ts';
import { phonesMatch, normalizeBdPhone } from '../security/phone.ts';
import { checkRateLimit, resetRateLimit } from '../security/rateLimit.ts';
import { ALLOWED_IMAGE_MIME_TYPES } from '../services/uploadPolicy.ts';

describe('Hardened admin tokens', () => {
  it('issues HMAC tokens and rejects legacy and tampered signatures', () => {
    const token = createAdminToken({
      email: ADMIN_EMAIL,
      name: 'Executive Director',
      role: 'superadmin',
    });
    assert.ok(verifyAdminToken(token));

    const [payload] = token.split('.');
    const legacy = Buffer.from(`${payload}:bb_secret_session_key_2026_luxury`).toString('base64url').slice(0, 32);
    assert.equal(verifyAdminToken(`${payload}.${legacy}`), null);
    assert.equal(verifyAdminToken(`${token}evil`), null);
    assert.equal(verifyAdminToken(undefined), null);
  });

  it('validates configured admin credentials without hardcoded production fallbacks', () => {
    assert.equal(resolveAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD)?.role, 'superadmin');
    assert.equal(resolveAdminUser(ADMIN_EMAIL, 'beeAdmin2026!'), null);
  });
});

describe('Phone matching and rate limits', () => {
  it('matches Bangladesh numbers exactly after normalization', () => {
    assert.equal(normalizeBdPhone('+8801712345678'), '01712345678');
    assert.equal(phonesMatch('+8801712345678', '01712345678'), true);
    assert.equal(phonesMatch('01712345678', '01700000000'), false);
    assert.equal(phonesMatch('01712', '01712345678'), false);
  });

  it('rate-limits repeated identifiers', () => {
    resetRateLimit();
    assert.equal(checkRateLimit('unit-test', 2, 60_000).ok, true);
    assert.equal(checkRateLimit('unit-test', 2, 60_000).ok, true);
    assert.equal(checkRateLimit('unit-test', 2, 60_000).ok, false);
  });
});

describe('Upload policy', () => {
  it('allows raster images and rejects SVG', () => {
    assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/jpeg'), true);
    assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/svg+xml'), false);
  });
});
