import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { catalogPathExists, clearCatalogPathCache, matchCatalogPath } from '../catalogPathGuard.ts';

describe('Catalog 404 guard', () => {
  beforeEach(() => clearCatalogPathCache());

  it('matches only single-segment product and category paths', () => {
    assert.deepEqual(matchCatalogPath('/product/velvet-lip'), { kind: 'product', slug: 'velvet-lip' });
    assert.deepEqual(matchCatalogPath('/shop/lips/'), { kind: 'category', slug: 'lips' });
    assert.equal(matchCatalogPath('/shop/all'), null);
    assert.equal(matchCatalogPath('/shop/under499'), null);
    assert.equal(matchCatalogPath('/product/a/b'), null);
    assert.equal(matchCatalogPath('/account'), null);
  });

  it('reports missing rows and fails open on errors', async () => {
    const prevUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const prevKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    try {
      const empty = (async () => new Response('[]', { status: 200 })) as typeof fetch;
      const found = (async () => new Response('[{"id":"p1"}]', { status: 200 })) as typeof fetch;
      const broken = (async () => {
        throw new Error('network');
      }) as typeof fetch;
      assert.equal(await catalogPathExists('product', 'missing', empty), false);
      assert.equal(await catalogPathExists('product', 'exists', found), true);
      assert.equal(await catalogPathExists('category', 'whatever', broken), true);
    } finally {
      process.env.NEXT_PUBLIC_SUPABASE_URL = prevUrl;
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = prevKey;
      if (prevUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (prevKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }
  });
});
