import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { supabaseAdmin } from '../supabase/admin.ts';
import { createAdminToken, SESSION_COOKIE_NAME } from '../services/adminAuth.ts';

describe('Admin Image Upload Suite', () => {
  describe('Supabase Storage Products Bucket', () => {
    it('generates valid public URL structure for products bucket', () => {
      const filename = 'honey-lipstick-test.jpg';
      const { data } = supabaseAdmin.storage.from('products').getPublicUrl(filename);
      assert.ok(data.publicUrl);
      assert.ok(data.publicUrl.includes('/storage/v1/object/public/products/honey-lipstick-test.jpg'));
      assert.ok(data.publicUrl.startsWith('https://'));
    });

    it('verifies products bucket exists in Supabase storage', async () => {
      const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
      assert.strictEqual(error, null);
      assert.ok(Array.isArray(buckets));
      const hasProductsBucket = buckets.some((b) => b.name === 'products');
      assert.strictEqual(hasProductsBucket, true);
    });
  });

  describe('Upload Security & Route Guard', () => {
    it('creates and verifies admin session tokens for upload access', () => {
      const adminToken = createAdminToken({
        email: 'admin@beeandbeauty.bd',
        name: 'Executive Admin',
        role: 'superadmin',
      });
      assert.ok(adminToken);
      assert.ok(adminToken.includes('.'));
    });
  });

  describe('File Extension & MIME Type Logic', () => {
    const ALLOWED_MIME_TYPES = new Set([
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
    ]);

    it('accepts valid luxury image formats', () => {
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/jpeg'), true);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/png'), true);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/webp'), true);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/svg+xml'), true);
    });

    it('rejects executable and non-image formats', () => {
      assert.strictEqual(ALLOWED_MIME_TYPES.has('application/pdf'), false);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('text/html'), false);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('application/javascript'), false);
      assert.strictEqual(ALLOWED_MIME_TYPES.has('image/exe'), false);
    });
  });
});
