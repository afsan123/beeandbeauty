import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server.js';
import { proxy } from '../../proxy.ts';
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

  it('redirects unauthenticated visitors from /admin to /admin/login', () => {
    const req = new NextRequest('http://localhost:3000/admin');
    const res = proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.includes('/admin/login'));
  });

  it('redirects unauthenticated visitors from nested /admin/orders to /admin/login', () => {
    const req = new NextRequest('http://localhost:3000/admin/orders');
    const res = proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.includes('/admin/login'));
  });

  it('allows authenticated admin users into /admin and sets security headers', () => {
    const req = new NextRequest('http://localhost:3000/admin', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
  });

  it('redirects authenticated admin from /admin/login to /admin dashboard', () => {
    const req = new NextRequest('http://localhost:3000/admin/login', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = proxy(req);

    assert.equal(res.status, 307);
    const location = res.headers.get('location');
    assert.ok(location?.endsWith('/admin'));
  });

  it('allows unauthenticated visitors to /admin/login', () => {
    const req = new NextRequest('http://localhost:3000/admin/login');
    const res = proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
  });

  it('blocks unauthenticated requests to protected /api/admin endpoints with 401', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders');
    const res = proxy(req);

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.ok(body.error?.includes('Unauthorized executive access'));
  });

  it('allows authenticated requests to protected /api/admin endpoints', () => {
    const req = new NextRequest('http://localhost:3000/api/admin/orders', {
      headers: {
        cookie: `${SESSION_COOKIE_NAME}=${validToken}`,
      },
    });
    const res = proxy(req);

    assert.equal(res.status, 200);
  });

  it('whitelists /api/admin/auth/login for unauthenticated callers', () => {
    const req = new NextRequest('http://localhost:3000/api/admin/auth/login');
    const res = proxy(req);

    assert.equal(res.status, 200);
  });

  it('applies security headers to public storefront routes', () => {
    const req = new NextRequest('http://localhost:3000/');
    const res = proxy(req);

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(res.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(res.headers.get('Referrer-Policy'), 'strict-origin-when-cross-origin');
    assert.equal(res.headers.get('X-DNS-Prefetch-Control'), 'on');
  });
});
