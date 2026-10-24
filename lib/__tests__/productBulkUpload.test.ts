import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  parseCsv,
  parseShadesString,
  normalizeProductRow,
  parseProductCsv,
  parseProductJson,
  getSampleCsvTemplate,
} from '../productBulkParser.ts';
import { bulkCreateCatalogProducts, deleteCatalogProduct } from '../services/productService.ts';
import type { Category } from '../../data/types.ts';

const mockCategories: Category[] = [
  {
    id: 'cat-lips',
    slug: 'lips',
    name: 'Lips',
    shortTitle: 'LIPS',
    description: '',
    tileImage: '',
    productCount: 1,
    subcategories: [],
  },
  {
    id: 'cat-skincare',
    slug: 'skincare',
    name: 'Skincare',
    shortTitle: 'SKIN',
    description: '',
    tileImage: '',
    productCount: 1,
    subcategories: [],
  },
];

describe('Product Bulk Upload Engine', () => {
  describe('CSV Tokenizer & Delimiter Handling', () => {
    it('parses standard comma-separated lines', () => {
      const csv = 'title,price,category\nLipstick,1200,lips';
      const rows = parseCsv(csv);
      assert.strictEqual(rows.length, 2);
      assert.deepStrictEqual(rows[0], ['title', 'price', 'category']);
      assert.deepStrictEqual(rows[1], ['Lipstick', '1200', 'lips']);
    });

    it('correctly handles quoted fields containing commas', () => {
      const csv = 'title,description,price\n"Honey Glow, 24K Primer","Infused with propolis, peptides, and gold",1450';
      const rows = parseCsv(csv);
      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[1][0], 'Honey Glow, 24K Primer');
      assert.strictEqual(rows[1][1], 'Infused with propolis, peptides, and gold');
      assert.strictEqual(rows[1][2], '1450');
    });

    it('handles escaped quotes within fields', () => {
      const csv = 'title,subtitle\n"Lipstick ""Velvet"" Edition","Special release"';
      const rows = parseCsv(csv);
      assert.strictEqual(rows.length, 2);
      assert.strictEqual(rows[1][0], 'Lipstick "Velvet" Edition');
    });
  });

  describe('Shade String Parser', () => {
    it('parses pipe-delimited shade tokens with name, hex, code, and family', () => {
      const raw = 'Ruby Red|#B22222|01|red; Berry Plum|#6A1B6D|02|berry';
      const shades = parseShadesString(raw);
      assert.strictEqual(shades.length, 2);
      assert.strictEqual(shades[0].name, 'Ruby Red');
      assert.strictEqual(shades[0].hexColor, '#B22222');
      assert.strictEqual(shades[0].code, '01');
      assert.strictEqual(shades[0].family, 'red');

      assert.strictEqual(shades[1].name, 'Berry Plum');
      assert.strictEqual(shades[1].family, 'berry');
    });

    it('parses JSON stringified shade array', () => {
      const json = JSON.stringify([
        { name: 'Nude Honey', hexColor: '#C48B71', code: '03', family: 'nude' },
      ]);
      const shades = parseShadesString(json);
      assert.strictEqual(shades.length, 1);
      assert.strictEqual(shades[0].name, 'Nude Honey');
      assert.strictEqual(shades[0].hexColor, '#C48B71');
    });

    it('falls back gracefully to plain comma-separated names', () => {
      const raw = 'Rose Gold, Sunset Coral';
      const shades = parseShadesString(raw);
      assert.strictEqual(shades.length, 2);
      assert.strictEqual(shades[0].name, 'Rose Gold');
      assert.strictEqual(shades[1].name, 'Sunset Coral');
    });
  });

  describe('Product Normalization & Auto-Slug in Bulk Engine', () => {
    it('auto-generates URL slug and normalizes pricing in BDT', () => {
      const raw = {
        title: 'Sundarban 24K Royal Gold Elixir',
        price: '৳ 2,450',
        compare_at_price: '৳ 2,950',
        category: 'Skincare',
        origin: 'Bangladesh',
      };

      const result = normalizeProductRow(raw, 1, mockCategories);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.errors.length, 0);
      assert.strictEqual(result.product?.title, 'Sundarban 24K Royal Gold Elixir');
      assert.strictEqual(result.product?.slug, 'sundarban-24k-royal-gold-elixir');
      assert.strictEqual(result.product?.price, 2450);
      assert.strictEqual(result.product?.compareAtPrice, 2950);
      assert.strictEqual(result.product?.categorySlug, 'skincare');
      assert.strictEqual(result.product?.categoryName, 'Skincare');
    });

    it('flags validation errors for missing title or invalid price', () => {
      const invalidRow = {
        title: '',
        price: 'invalid-price',
        category: 'lips',
      };

      const result = normalizeProductRow(invalidRow, 2, mockCategories);
      assert.strictEqual(result.isValid, false);
      assert.ok(result.errors.some((e) => e.includes('title is required')));
      assert.ok(result.errors.some((e) => e.includes('Price is required')));
    });

    it('automatically marks products as isUnder499 when price <= ৳499', () => {
      const budgetRow = {
        title: 'Mini Honey Lip Scrub',
        price: '399',
        category: 'lips',
      };

      const result = normalizeProductRow(budgetRow, 3, mockCategories);
      assert.strictEqual(result.isValid, true);
      assert.strictEqual(result.product?.isUnder499, true);
    });
  });

  describe('CSV & JSON Batch Parsing', () => {
    it('parses full sample CSV template without validation errors', () => {
      const templateCsv = getSampleCsvTemplate();
      const parseResult = parseProductCsv(templateCsv, mockCategories);
      assert.strictEqual(parseResult.totalRows, 3);
      assert.strictEqual(parseResult.validCount, 3);
      assert.strictEqual(parseResult.errorCount, 0);
    });

    it('parses JSON product array correctly', () => {
      const jsonText = JSON.stringify([
        {
          title: 'Botanical Clay Cleanser',
          price: 950,
          category: 'skincare',
          tags: ['clay', 'cleanser'],
        },
      ]);

      const parseResult = parseProductJson(jsonText, mockCategories);
      assert.strictEqual(parseResult.totalRows, 1);
      assert.strictEqual(parseResult.validCount, 1);
      assert.strictEqual(parseResult.rows[0].product?.title, 'Botanical Clay Cleanser');
      assert.strictEqual(parseResult.rows[0].product?.slug, 'botanical-clay-cleanser');
    });
  });

  describe('Bulk Service Ingestion', () => {
    it('successfully processes batch upload of products with auto-generated slugs', async () => {
      const batchItems = [
        {
          title: 'Bulk Batch Radiant Foundation',
          price: 1650,
          categorySlug: 'face',
          categoryName: 'Face',
        },
        {
          title: 'Bulk Batch Silk Kohl Eyeliner',
          price: 650,
          categorySlug: 'eyes',
          categoryName: 'Eyes',
        },
      ];

      const res = await bulkCreateCatalogProducts(batchItems);
      assert.strictEqual(res.success, true);
      assert.strictEqual(res.count, 2);
      assert.strictEqual(res.products.length, 2);
      assert.strictEqual(res.products[0].slug, 'bulk-batch-radiant-foundation');
      assert.strictEqual(res.products[1].slug, 'bulk-batch-silk-kohl-eyeliner');

      // Teardown test items to maintain zero dummy products in production database
      for (const p of res.products) {
        await deleteCatalogProduct(p.id);
      }
    });
  });
});
