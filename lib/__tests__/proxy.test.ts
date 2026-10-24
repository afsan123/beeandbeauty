import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { proxy } from '../../proxy.ts';
import { applySecurityHeaders } from '../security/headers.ts';
import {
  createAdminToken,
  SESSION_COOKIE_NAME,
  ADMIN_EMAIL,
} from '../services/adminAuthToken.ts';

describe('Next.js 16 Request Proxy & Security Guards Suite', () => {
  const validToken = createAdminToken({
    email: ADMIN_EMAIL,
    name: 'Executive Director',
    role: 'superadmin',
  });

  it('redirects unauthenticated visitors from /admin to /admin/login', async () => {
    const req = new NextRequest('http://localhost:3000/admin');
    const res = await proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.includes('/admin/login'));
  });

  it('redirects unauthenticated visitors from nested /admin/orders to /admin/login', async () => {
    const req = new NextRequest('http://localhost:3000/admin/orders');
    const res = await proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.includes('/admin/login'));
  });

  it('allows authenticated admin users into /admin and sets security headers', async () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = await proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
  });

  it('redirects authenticated admin from /admin/login to /admin dashboard', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = await proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.endsWith('/admin'));
  });

  it('allows unauthenticated visitors to /admin/login', async () => {
    const req = new NextRequest('http://localhost:3000/admin/login');
    const res = await proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  });

  it('blocks unauthenticated requests to protected /api/admin endpoints with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders');
    const res = await proxy(req);

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.ok(body.error?.includes('Unauthorized executive access'));
  });

  it('allows authenticated requests to protected /api/admin endpoints', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = await proxy(req);

    assert.equal(res.status, 200);
  });

  it('whitelists /api/admin/auth/login for unauthenticated callers', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/auth/login');
    const res = await proxy(req);

    assert.equal(res.status, 200);
  });

  it('applies security headers to public storefront routes', async () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = await proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(res.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
    assert.equal(res.headers.get('X-DNS-Prefetch-Control'), 'on');
    assert.ok(res.headers.get('Content-Security-Policy')?.includes("default-src 'self'"));
    assert.equal(res.headers.get('Cross-Origin-Resource-Policy'), 'same-origin');
    assert.equal(res.headers.get('Access-Control-Allow-Origin'), null);
  });

  it('strips a wildcard CORS header from proxy-owned responses', async () => {
    const req = new NextRequest('http://localhost:3000/api/products');
    const res = await proxy(req);
    res.headers.set('Access-Control-Allow-Origin', '*');
    const hardened = applySecurityHeaders(res);
    assert.equal(hardened.headers.get('Access-Control-Allow-Origin'), null);
    assert.equal(hardened.headers.get('Cross-Origin-Resource-Policy'), 'same-origin');
  });
});
