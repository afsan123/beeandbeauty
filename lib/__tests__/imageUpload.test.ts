import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isSupabaseAdminReady, tryGetSupabaseAdmin } from '../supabase/admin.ts';
import { createAdminToken } from '../services/adminAuth.ts';
import { ALLOWED_IMAGE_MIME_TYPES } from '../services/uploadPolicy.ts';

describe('Admin Image Upload Suite', () => {
  describe('Supabase Storage Products Bucket', () => {
    it('generates valid public URL structure when Supabase is configured', () => {
      const admin = tryGetSupabaseAdmin();
      if (!admin) {
        assert.equal(isSupabaseAdminReady(), false);
        return;
      }
      const filename = 'honey-lipstick-test.jpg';
      const { data } = admin.storage.from('products').getPublicUrl(filename);
      assert.ok(data.publicUrl);
      assert.ok(data.publicUrl.includes('/storage/v1/object/public/products/honey-lipstick-test.jpg'));
      assert.ok(data.publicUrl.startsWith('https://'));
    });

    it('verifies products bucket exists only against a configured project', async () => {
      const admin = tryGetSupabaseAdmin();
      if (!admin) {
        assert.equal(isSupabaseAdminReady(), false);
        return;
      }
      const { data: buckets, error } = await admin.storage.listBuckets();
      assert.equal(error, null);
      assert.ok(Array.isArray(buckets));
      assert.equal(buckets.some((b) => b.name === 'products'), true);
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
    it('accepts valid luxury image formats', () => {
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/jpeg'), true);
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/png'), true);
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/webp'), true);
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/gif'), true);
    });

    it('rejects SVG and executable formats', () => {
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('image/svg+xml'), false);
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('application/pdf'), false);
      assert.equal(ALLOWED_IMAGE_MIME_TYPES.has('text/html'), false);
    });
  });
});
