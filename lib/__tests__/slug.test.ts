import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateSlug } from '../slug.ts';
import { createCatalogProduct } from '../services/productService.ts';

describe('Auto-Generated URL Slug Suite', () => {
  it('converts product titles to clean lowercase hyphenated slugs', () => {
    assert.equal(
      generateSlug('Royal Velvet Matte Lipstick'),
      'royal-velvet-matte-lipstick'
    );
  });

  it('handles special characters, punctuation, and multiple spaces', () => {
    assert.equal(
      generateSlug('24K Honey Radiance Oil & Glow Drops! (Special Eid Edition)'),
      '24k-honey-radiance-oil-glow-drops-special-eid-edition'
    );
  });

  it('handles diacritics and accented characters', () => {
    assert.equal(
      generateSlug('Crème de Rose Hydrating Lip Balm'),
      'creme-de-rose-hydrating-lip-balm'
    );
  });

  it('strips leading and trailing hyphens', () => {
    assert.equal(
      generateSlug('--- Ultra-HD Serum Foundation ---'),
      'ultra-hd-serum-foundation'
    );
  });

  it('handles empty strings gracefully', () => {
    assert.equal(generateSlug(''), '');
  });

  it('automatically populates slug in createCatalogProduct if omitted', async () => {
    const prod = await createCatalogProduct({
      title: 'Botanical Propolis Lash Sculpting Mascara',
      categorySlug: 'eyes',
      categoryName: 'Eye & Brow Artistry',
      price: 650,
    });

    assert.equal(prod.slug, 'botanical-propolis-lash-sculpting-mascara');
    assert.equal(prod.title, 'Botanical Propolis Lash Sculpting Mascara');
  });
});
