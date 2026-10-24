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

describe('Admin session revocation', () => {
  it('embeds a session id and rejects tokens without one', async () => {
    const { verifyAdminSessionToken } = await import('../services/adminAuthToken.ts');
    const crypto = await import('node:crypto');
    const token = createAdminToken({ email: ADMIN_EMAIL, name: 'Executive Director', role: 'superadmin' });
    const session = verifyAdminSessionToken(token);
    assert.ok(session?.sessionId && session.sessionId.length >= 16);

    const legacyPayload = Buffer.from(
      JSON.stringify({ email: ADMIN_EMAIL, name: 'x', role: 'superadmin', issuedAt: Date.now(), expiresAt: Date.now() + 60000 })
    ).toString('base64url');
    const sig = crypto
      .createHmac('sha256', 'test-admin-session-secret-at-least-32-chars')
      .update(legacyPayload)
      .digest('base64url');
    assert.equal(verifyAdminSessionToken(`${legacyPayload}.${sig}`), null);
  });

  it('treats a logged-out session as revoked', async () => {
    const { verifyAdminSessionToken } = await import('../services/adminAuthToken.ts');
    const { isAdminSessionRevoked, revokeAdminSession } = await import('../services/adminSessionRevocation.ts');
    const session = verifyAdminSessionToken(
      createAdminToken({ email: ADMIN_EMAIL, name: 'Executive Director', role: 'superadmin' })
    )!;
    assert.equal(await isAdminSessionRevoked(session.sessionId), false);
    assert.equal(await revokeAdminSession(session.sessionId, session.expiresAt), true);
    assert.equal(await isAdminSessionRevoked(session.sessionId), true);
  });
});

describe('Post-auth redirect guard', () => {
  it('keeps same-site paths and rejects off-site tricks', async () => {
    const { safeNextPath } = await import('../security/safeRedirect.ts');
    assert.equal(safeNextPath('/account/orders?x=1'), '/account/orders?x=1');
    assert.equal(safeNextPath('/account/set-password'), '/account/set-password');
    for (const bad of ['//evil.com', '/\\evil.com', '/\t/evil.com', '/\n/evil.com', 'https://evil.com', 'evil.com', '']) {
      assert.equal(safeNextPath(bad), '/account');
    }
  });
});
