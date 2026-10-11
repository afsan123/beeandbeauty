import type { Product, Category, Shade, ProductBadge } from '../data/types.ts';
import { generateSlug } from './slug.ts';

export interface ParsedProductRow {
  rowNumber: number;
  raw: Record<string, string>;
  product?: Partial<Product>;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParseResult {
  totalRows: number;
  validCount: number;
  errorCount: number;
  rows: ParsedProductRow[];
}

/**
 * Robust RFC-compliant CSV line/field tokenizer that handles quotes, escaped quotes, and newlines.
 */
export function parseCsv(csvText: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;
  let i = 0;

  // Normalize line breaks
  const text = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  while (i < text.length) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote: ""
        currentField += '"';
        i += 2;
        continue;
      } else {
        // Toggle quotes
        insideQuotes = !insideQuotes;
        i++;
        continue;
      }
    }

    if (char === ',' && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
      i++;
      continue;
    }

    if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField.trim());
      // Skip empty lines
      if (currentRow.some((f) => f.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      i++;
      continue;
    }

    currentField += char;
    i++;
  }

  // Push final field/row if any
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * Parses shades from pipe-delimited notation or JSON string.
 * Example 1: "Velvet Crimson|#9E2A2B|01|red; Berry Plum|#6A1B6D|02|berry"
 * Example 2: '[{"name":"Ruby Honey","hexColor":"#B22222","code":"01","family":"red"}]'
 * Example 3: "Ruby Honey, Berry Plum"
 */
export function parseShadesString(val: string): Shade[] {
  if (!val || !val.trim()) return [];
  const trimmed = val.trim();

  // Attempt JSON parse
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((item, idx) => ({
          id: item.id || `shade-${idx + 1}`,
          name: String(item.name || `Shade ${idx + 1}`),
          code: String(item.code || String(idx + 1).padStart(2, '0')),
          hexColor: item.hexColor || '#B22222',
          description: item.description,
          family: (item.family && ['nude', 'red', 'pink', 'berry', 'brown', 'neutral', 'all'].includes(item.family))
            ? item.family
            : 'neutral',
          inStock: item.inStock !== false,
          swatchImage: item.swatchImage,
        }));
      }
    } catch {
      // Continue to string parsing
    }
  }

  // Split by semicolon
  const shadeTokens = trimmed.split(';').map((s) => s.trim()).filter(Boolean);
  const shades: Shade[] = [];

  shadeTokens.forEach((token, idx) => {
    // Pipe delimited: Name | Hex | Code | Family
    if (token.includes('|')) {
      const parts = token.split('|').map((p) => p.trim());
      const name = parts[0] || `Shade ${idx + 1}`;
      const hexColor = parts[1] && parts[1].startsWith('#') ? parts[1] : '#B22222';
      const code = parts[2] || String(idx + 1).padStart(2, '0');
      const rawFamily = parts[3]?.toLowerCase();
      const family: Shade['family'] = ['nude', 'red', 'pink', 'berry', 'brown', 'neutral', 'all'].includes(rawFamily as any)
        ? (rawFamily as Shade['family'])
        : 'neutral';

      shades.push({
        id: `shade-${idx + 1}`,
        name,
        code,
        hexColor,
        family,
        inStock: true,
      });
    } else {
      // Plain comma-separated or single name
      const subTokens = token.split(',').map((s) => s.trim()).filter(Boolean);
      subTokens.forEach((subName, subIdx) => {
        shades.push({
          id: `shade-${shades.length + 1}`,
          name: subName,
          code: String(shades.length + 1).padStart(2, '0'),
          hexColor: '#B22222',
          family: 'neutral',
          inStock: true,
        });
      });
    }
  });

  return shades;
}

/**
 * Normalizes boolean values from strings (true/false, yes/no, 1/0).
 */
function parseBoolean(val: any, defaultVal = false): boolean {
  if (typeof val === 'boolean') return val;
  if (!val) return defaultVal;
  const s = String(val).trim().toLowerCase();
  if (['true', '1', 'yes', 'y'].includes(s)) return true;
  if (['false', '0', 'no', 'n'].includes(s)) return false;
  return defaultVal;
}

/**
 * Normalizes price from string, stripping currency symbols like ৳, $, commas.
 */
function parsePrice(val: any): number | null {
  if (typeof val === 'number') return isNaN(val) ? null : val;
  if (!val) return null;
  const cleaned = String(val).replace(/[৳$,\s]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Standardizes raw input fields into a normalized product record with validations.
 */
export function normalizeProductRow(
  raw: Record<string, string>,
  rowNumber: number,
  availableCategories: Category[] = []
): ParsedProductRow {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Key normalization map
  const getField = (...candidates: string[]): string => {
    for (const c of candidates) {
      const direct = raw[c];
      if (direct !== undefined && direct !== '') return String(direct).trim();
      // Case-insensitive / snake-case search
      const key = Object.keys(raw).find((k) => k.toLowerCase().replace(/[_\s-]/g, '') === c.toLowerCase().replace(/[_\s-]/g, ''));
      if (key && raw[key] !== undefined && raw[key] !== '') return String(raw[key]).trim();
    }
    return '';
  };

  const title = getField('title', 'name', 'product_title', 'product_name');
  if (!title) {
    errors.push('Product title is required.');
  }

  const rawSlug = getField('slug', 'url_slug', 'handle');
  const slug = rawSlug ? generateSlug(rawSlug) : (title ? generateSlug(title) : '');

  const rawPrice = getField('price', 'price_bdt', 'regular_price', 'bdt_price');
  const price = parsePrice(rawPrice);
  if (price === null) {
    errors.push('Price is required and must be a valid number.');
  } else if (price <= 0) {
    errors.push('Price must be greater than ৳0.');
  }

  const rawCompareAtPrice = getField('compare_at_price', 'compareatprice', 'original_price', 'old_price', 'mrp');
  const compareAtPrice = rawCompareAtPrice ? parsePrice(rawCompareAtPrice) || undefined : undefined;

  // Category detection & resolution
  const rawCategory = getField('category_slug', 'category', 'category_name', 'categoryslug');
  let categorySlug = 'lips';
  let categoryName = 'Lips';

  if (rawCategory) {
    const matchedCategory = availableCategories.find(
      (c) =>
        c.slug.toLowerCase() === rawCategory.toLowerCase() ||
        c.name.toLowerCase() === rawCategory.toLowerCase()
    );

    if (matchedCategory) {
      categorySlug = matchedCategory.slug;
      categoryName = matchedCategory.name;
    } else {
      categorySlug = generateSlug(rawCategory) || 'lips';
      categoryName = rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
      warnings.push(`Category "${rawCategory}" is new or not in the default directory. Will be created as "${categoryName}".`);
    }
  } else {
    errors.push('Category is required (e.g. lips, face, eyes, skincare).');
  }

  const subtitle = getField('subtitle', 'tagline', 'sub_title');
  const shortDescription = getField('short_description', 'shortdescription', 'summary');
  const description = getField('description', 'full_description', 'body');
  const howToUse = getField('how_to_use', 'howtouse', 'usage', 'application');
  const ingredients = getField('ingredients', 'key_ingredients');

  const primaryImage = getField('primary_image', 'image', 'primaryimage', 'image_url') || '/images/products/placeholder.jpg';
  const hoverImage = getField('hover_image', 'hoverimage', 'secondary_image') || primaryImage;
  const rawGallery = getField('gallery', 'gallery_images', 'additional_images');
  const gallery = rawGallery
    ? rawGallery.split(',').map((u) => u.trim()).filter((u) => u.startsWith('http') || u.startsWith('/'))
    : [];

  const rawTags = getField('tags', 'keywords');
  const tags = rawTags
    ? rawTags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
    : [];

  const inStock = parseBoolean(getField('in_stock', 'instock', 'available', 'stock_status'), true);
  const isBestseller = parseBoolean(getField('is_bestseller', 'bestseller'));
  const isNewLaunch = parseBoolean(getField('is_new_launch', 'new_launch', 'is_new'));
  const isFeatured = parseBoolean(getField('is_featured', 'featured'));
  const isKit = parseBoolean(getField('is_kit', 'bundle'));
  const isUnder499 = price !== null && price <= 499;

  // Specifications / Details
  const netWeight = getField('net_weight', 'netweight', 'weight') || '50g';
  const shelfLife = getField('shelf_life', 'shelflife', 'expiry') || '24 Months';
  const origin = getField('origin', 'country_of_origin') || 'Bangladesh';
  const finish = getField('finish', 'texture_finish') || 'Velvet Matte';
  const formulation = getField('formulation') || 'Botanical Infused';

  // Shades
  const rawShades = getField('shades', 'shade_list', 'colors');
  const shades = parseShadesString(rawShades);

  // Badges
  const badges: ProductBadge[] = [];
  if (isBestseller) badges.push({ type: 'bestseller', label: 'Bestseller' });
  if (isNewLaunch) badges.push({ type: 'new', label: 'New Launch' });
  if (compareAtPrice && price && compareAtPrice > price) {
    badges.push({ type: 'sale', label: 'Special Offer' });
  }

  const product: Partial<Product> = {
    title,
    slug,
    categorySlug,
    categoryName,
    subtitle,
    shortDescription,
    description,
    howToUse,
    ingredients,
    price: price || 0,
    compareAtPrice,
    inStock,
    isBestseller,
    isNewLaunch,
    isFeatured,
    isKit,
    isUnder499,
    rating: 5.0,
    reviewCount: 0,
    badges,
    shades,
    tags,
    images: {
      primary: primaryImage,
      hover: hoverImage,
      gallery,
    },
    details: {
      netWeight,
      shelfLife,
      origin,
      finish,
      formulation,
    },
  };

  return {
    rowNumber,
    raw,
    product,
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parses raw CSV string into normalized product rows.
 */
export function parseProductCsv(
  csvContent: string,
  availableCategories: Category[] = []
): ParseResult {
  const table = parseCsv(csvContent);
  if (table.length < 2) {
    return {
      totalRows: 0,
      validCount: 0,
      errorCount: 0,
      rows: [],
    };
  }

  const headers = table[0].map((h) => h.trim());
  const rows: ParsedProductRow[] = [];

  for (let i = 1; i < table.length; i++) {
    const rowValues = table[i];
    const raw: Record<string, string> = {};
    headers.forEach((header, idx) => {
      raw[header] = rowValues[idx] || '';
    });

    const parsedRow = normalizeProductRow(raw, i, availableCategories);
    rows.push(parsedRow);
  }

  return {
    totalRows: rows.length,
    validCount: rows.filter((r) => r.isValid).length,
    errorCount: rows.filter((r) => !r.isValid).length,
    rows,
  };
}

/**
 * Parses raw JSON string or object array into normalized product rows.
 */
export function parseProductJson(
  jsonContent: string | any[],
  availableCategories: Category[] = []
): ParseResult {
  let parsedArray: any[] = [];

  if (typeof jsonContent === 'string') {
    try {
      const parsed = JSON.parse(jsonContent);
      parsedArray = Array.isArray(parsed) ? parsed : (parsed.products || [parsed]);
    } catch {
      return {
        totalRows: 0,
        validCount: 0,
        errorCount: 1,
        rows: [
          {
            rowNumber: 1,
            raw: {},
            isValid: false,
            errors: ['Invalid JSON syntax. Please verify JSON brackets and quotes.'],
            warnings: [],
          },
        ],
      };
    }
  } else if (Array.isArray(jsonContent)) {
    parsedArray = jsonContent;
  }

  const rows: ParsedProductRow[] = parsedArray.map((item, idx) => {
    // Flatten any nested details or images for normalizeProductRow
    const raw: Record<string, string> = {};
    Object.keys(item).forEach((k) => {
      if (typeof item[k] === 'object' && item[k] !== null && !Array.isArray(item[k])) {
        Object.keys(item[k]).forEach((subK) => {
          raw[`${k}_${subK}`] = String(item[k][subK] || '');
        });
      } else if (Array.isArray(item[k])) {
        if (k === 'shades') {
          raw[k] = JSON.stringify(item[k]);
        } else {
          raw[k] = item[k].join(', ');
        }
      } else {
        raw[k] = String(item[k] ?? '');
      }
    });

    return normalizeProductRow(raw, idx + 1, availableCategories);
  });

  return {
    totalRows: rows.length,
    validCount: rows.filter((r) => r.isValid).length,
    errorCount: rows.filter((r) => !r.isValid).length,
    rows,
  };
}

/**
 * Generates the canonical sample CSV template for Bee & Beauty catalog.
 */
export function getSampleCsvTemplate(): string {
  const headers = [
    'title',
    'slug',
    'category',
    'price',
    'compare_at_price',
    'subtitle',
    'short_description',
    'description',
    'how_to_use',
    'ingredients',
    'shades',
    'tags',
    'in_stock',
    'is_bestseller',
    'is_new_launch',
    'is_featured',
    'net_weight',
    'shelf_life',
    'origin',
    'finish',
    'formulation',
    'primary_image',
    'hover_image',
  ];

  const sampleRows = [
    [
      'Royal 24K Honey Velvet Matte Lipstick',
      'royal-24k-honey-velvet-matte-lipstick',
      'lips',
      '1250',
      '1450',
      'Infused with raw Sundarban honey & botanical peptides',
      'Velvety 16-hour matte lipstick that locks in deep moisture without cracking.',
      'A royal, weightless lipstick crafted for warm undertones. Rich pigments blended with organic bee propolis create a cushion-soft satin matte feel.',
      'Glide over bare lips starting from the cupid bow outwards. Blot lightly with tissue for a diffused blurred lip effect.',
      'Sundarban Bee Honey, Propolis Cera, Vitamin E, Jojoba Seed Oil, Shea Butter, Mica, CI 77491.',
      'Ruby Velvet|#9E2A2B|01|red; Royal Plum|#6A1B6D|02|berry; Honey Nude|#C48B71|03|nude',
      'lipstick, matte, propolis, long-lasting, lips',
      'true',
      'true',
      'false',
      'true',
      '3.8g',
      '36 Months',
      'Bangladesh',
      'Velvet Matte',
      'Propolis Infused',
      '/images/products/placeholder.jpg',
      '/images/products/placeholder.jpg',
    ],
    [
      'Propolis Barrier Glow Rescue Serum',
      'propolis-barrier-glow-rescue-serum',
      'skincare',
      '1850',
      '2200',
      '83% Pure Propolis & 2% Niacinamide Ampoule',
      'Deep barrier restorative serum for radiant, glass-like morning glow in Dhaka humidity.',
      'Formulated specifically for tropical and humid climates, this featherlight essence strengthens compromised skin barriers while calming redness and acne blemishes.',
      'Apply 3-4 drops morning and evening onto cleansed, toned skin before your moisturizer.',
      'Propolis Extract (83%), Niacinamide (2%), Centella Asiatica, Sodium Hyaluronate, Panthenol, Glycerin.',
      '',
      'serum, barrier care, propolis, glass skin, skincare',
      'true',
      'true',
      'true',
      'true',
      '50ml',
      '24 Months',
      'Korea / Bangladesh',
      'Dewy Glow',
      'Concentrated Ampoule',
      '/images/products/placeholder.jpg',
      '/images/products/placeholder.jpg',
    ],
    [
      'Honey Nectar Hydrating Lip Jelly Mask',
      'honey-nectar-hydrating-lip-jelly-mask',
      'under499',
      '399',
      '499',
      'Overnight intensive hydration therapy',
      'Pocket-friendly nourishing lip jelly under ৳499.',
      'Melt-on-contact lip jelly packed with organic honey nectar and mango butter to eliminate dry flaking lips overnight.',
      'Slather generous layer before sleep, or apply a thin film throughout the day as an ultra-glossy balm.',
      'Organic Honey, Mango Seed Butter, Beeswax, Ricinus Communis Seed Oil, Tocopherol.',
      '',
      'lip care, overnight mask, honey, under499, budget beauty',
      'true',
      'false',
      'true',
      'false',
      '15g',
      '24 Months',
      'Bangladesh',
      'Glass Shine',
      'Nourishing Jelly',
      '/images/products/placeholder.jpg',
      '/images/products/placeholder.jpg',
    ],
  ];

  const escapeField = (val: string) => {
    if (val.includes(',') || val.includes('"') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const csvLines = [
    headers.join(','),
    ...sampleRows.map((row) => row.map(escapeField).join(',')),
  ];

  return csvLines.join('\n');
}

/**
 * Generates the canonical sample JSON template.
 */
export function getSampleJsonTemplate(): string {
  const sampleItems = [
    {
      title: 'Royal 24K Honey Velvet Matte Lipstick',
      slug: 'royal-24k-honey-velvet-matte-lipstick',
      category: 'lips',
      price: 1250,
      compare_at_price: 1450,
      subtitle: 'Infused with raw Sundarban honey & botanical peptides',
      short_description: 'Velvety 16-hour matte lipstick that locks in deep moisture.',
      description: 'A royal, weightless lipstick crafted for warm undertones.',
      how_to_use: 'Glide over bare lips starting from the cupid bow outwards.',
      ingredients: 'Sundarban Bee Honey, Propolis Cera, Vitamin E, Jojoba Seed Oil.',
      shades: [
        { name: 'Ruby Velvet', hexColor: '#9E2A2B', code: '01', family: 'red' },
        { name: 'Royal Plum', hexColor: '#6A1B6D', code: '02', family: 'berry' },
        { name: 'Honey Nude', hexColor: '#C48B71', code: '03', family: 'nude' },
      ],
      tags: ['lipstick', 'matte', 'propolis', 'long-lasting'],
      in_stock: true,
      is_bestseller: true,
      is_new_launch: false,
      is_featured: true,
      net_weight: '3.8g',
      shelf_life: '36 Months',
      origin: 'Bangladesh',
      finish: 'Velvet Matte',
      formulation: 'Propolis Infused',
      primary_image: '/images/products/placeholder.jpg',
      hover_image: '/images/products/placeholder.jpg',
    },
    {
      title: 'Propolis Barrier Glow Rescue Serum',
      slug: 'propolis-barrier-glow-rescue-serum',
      category: 'skincare',
      price: 1850,
      compare_at_price: 2200,
      subtitle: '83% Pure Propolis & 2% Niacinamide Ampoule',
      short_description: 'Deep barrier restorative serum for glass skin.',
      description: 'Strengthens compromised skin barriers while calming redness.',
      how_to_use: 'Apply 3-4 drops morning and evening onto cleansed skin.',
      ingredients: 'Propolis Extract (83%), Niacinamide (2%), Centella Asiatica.',
      shades: [],
      tags: ['serum', 'barrier care', 'propolis', 'glass skin'],
      in_stock: true,
      is_bestseller: true,
      is_new_launch: true,
      is_featured: true,
      net_weight: '50ml',
      shelf_life: '24 Months',
      origin: 'Korea / Bangladesh',
      finish: 'Dewy Glow',
      formulation: 'Concentrated Ampoule',
      primary_image: '/images/products/placeholder.jpg',
      hover_image: '/images/products/placeholder.jpg',
    },
  ];

  return JSON.stringify(sampleItems, null, 2);
}
