import { supabaseAdmin } from '../supabase/admin.ts';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountAmount: number;
  message: string;
  minSpend?: number;
}

interface CouponDefinition {
  code: string;
  discount_type: 'percentage' | 'fixed' | 'free_shipping';
  discount_value: number;
  min_spend: number;
  max_discount: number | null;
  is_active: boolean;
}

const CANONICAL_COUPONS: Record<string, CouponDefinition> = {
  BEE10: {
    code: 'BEE10',
    discount_type: 'percentage',
    discount_value: 10,
    min_spend: 1000,
    max_discount: 500,
    is_active: true,
  },
  GLAM20: {
    code: 'GLAM20',
    discount_type: 'percentage',
    discount_value: 20,
    min_spend: 2000,
    max_discount: 1000,
    is_active: true,
  },
  BEE700: {
    code: 'BEE700',
    discount_type: 'fixed',
    discount_value: 700,
    min_spend: 2999,
    max_discount: null,
    is_active: true,
  },
  BEEFREE: {
    code: 'BEEFREE',
    discount_type: 'free_shipping',
    discount_value: 0,
    min_spend: 0,
    max_discount: null,
    is_active: true,
  },
};

export async function validateCoupon(
  code: string,
  subtotal: number
): Promise<CouponValidationResult> {
  const upperCode = (code || '').trim().toUpperCase();

  if (!upperCode) {
    return {
      valid: false,
      code: '',
      discountType: 'percentage',
      discountAmount: 0,
      message: 'Please enter a coupon code.',
    };
  }

  let couponDef: CouponDefinition | null = null;

  // Try fetching coupon from Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .eq('code', upperCode)
      .eq('is_active', true)
      .maybeSingle();

    if (!error && data) {
      couponDef = {
        code: data.code,
        discount_type: data.discount_type,
        discount_value: Number(data.discount_value),
        min_spend: Number(data.min_spend || 0),
        max_discount: data.max_discount ? Number(data.max_discount) : null,
        is_active: data.is_active,
      };
    }
  } catch {
    // If Supabase table isn't migrated yet or network error, fallback to canonical
  }

  // Fallback to canonical coupon definitions
  if (!couponDef) {
    couponDef = CANONICAL_COUPONS[upperCode] || null;
  }

  if (!couponDef || !couponDef.is_active) {
    return {
      valid: false,
      code: upperCode,
      discountType: 'percentage',
      discountAmount: 0,
      message: `Coupon "${upperCode}" is invalid or expired.`,
    };
  }

  // Check minimum spend
  if (couponDef.min_spend > 0 && subtotal < couponDef.min_spend) {
    return {
      valid: false,
      code: upperCode,
      discountType: couponDef.discount_type,
      discountAmount: 0,
      minSpend: couponDef.min_spend,
      message: `Coupon "${upperCode}" requires a minimum order of ৳${couponDef.min_spend.toLocaleString()}. Add ৳${(
        couponDef.min_spend - subtotal
      ).toLocaleString()} more to qualify.`,
    };
  }

  let discountAmount = 0;
  if (couponDef.discount_type === 'percentage') {
    discountAmount = Math.round((subtotal * couponDef.discount_value) / 100);
    if (couponDef.max_discount && discountAmount > couponDef.max_discount) {
      discountAmount = couponDef.max_discount;
    }
  } else if (couponDef.discount_type === 'fixed') {
    discountAmount = Math.min(couponDef.discount_value, subtotal);
  } else if (couponDef.discount_type === 'free_shipping') {
    discountAmount = 0; // Shipping discount is handled by shipping fee waiver
  }

  return {
    valid: true,
    code: upperCode,
    discountType: couponDef.discount_type,
    discountAmount,
    minSpend: couponDef.min_spend,
    message:
      couponDef.discount_type === 'free_shipping'
        ? `Coupon "${upperCode}" applied! Free delivery unlocked.`
        : `Coupon "${upperCode}" applied! You saved ৳${discountAmount.toLocaleString()}.`,
  };
}

export interface StoredCoupon {
  id?: string;
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minSpend: number;
  maxDiscount: number | null;
  isActive: boolean;
  expiresAt?: string | null;
  createdAt?: string;
}

export async function getAllCoupons(): Promise<StoredCoupon[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.discount_type,
        discountValue: Number(c.discount_value),
        minSpend: Number(c.min_spend || 0),
        maxDiscount: c.max_discount ? Number(c.max_discount) : null,
        isActive: Boolean(c.is_active),
        expiresAt: c.expires_at,
        createdAt: c.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase getAllCoupons fallback:', err);
  }

  // Fallback to canonical coupons
  return Object.values(CANONICAL_COUPONS).map((c) => ({
    code: c.code,
    discountType: c.discount_type,
    discountValue: c.discount_value,
    minSpend: c.min_spend,
    maxDiscount: c.max_discount,
    isActive: c.is_active,
  }));
}

export async function createCoupon(payload: {
  code: string;
  discountType: 'percentage' | 'fixed' | 'free_shipping';
  discountValue: number;
  minSpend?: number;
  maxDiscount?: number | null;
  isActive?: boolean;
}): Promise<StoredCoupon> {
  const code = (payload.code || '').trim().toUpperCase();
  if (!code) {
    throw new Error('Coupon code is required.');
  }

  const newCoupon: StoredCoupon = {
    code,
    discountType: payload.discountType,
    discountValue: payload.discountValue,
    minSpend: payload.minSpend || 0,
    maxDiscount: payload.maxDiscount || null,
    isActive: payload.isActive !== false,
    createdAt: new Date().toISOString(),
  };

  // Add to in-memory canonical
  CANONICAL_COUPONS[code] = {
    code,
    discount_type: payload.discountType,
    discount_value: payload.discountValue,
    min_spend: payload.minSpend || 0,
    max_discount: payload.maxDiscount || null,
    is_active: payload.isActive !== false,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('coupons')
      .insert({
        code,
        discount_type: payload.discountType,
        discount_value: payload.discountValue,
        min_spend: payload.minSpend || 0,
        max_discount: payload.maxDiscount || null,
        is_active: payload.isActive !== false,
      })
      .select()
      .maybeSingle();

    if (!error && data) {
      newCoupon.id = data.id;
    }
  } catch (err) {
    console.warn('Supabase createCoupon fallback:', err);
  }

  return newCoupon;
}

export async function toggleCouponStatus(codeOrId: string, isActive: boolean): Promise<boolean> {
  const clean = codeOrId.trim();
  const upper = clean.toUpperCase();
  if (CANONICAL_COUPONS[upper]) {
    CANONICAL_COUPONS[upper].is_active = isActive;
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  try {
    let query = supabaseAdmin.from('coupons').update({ is_active: isActive });
    if (isUuid) {
      query = query.eq('id', clean);
    } else {
      query = query.eq('code', upper);
    }

    const { error } = await query;
    return !error;
  } catch {
    return true;
  }
}

export async function deleteCoupon(codeOrId: string): Promise<boolean> {
  const clean = codeOrId.trim();
  const upper = clean.toUpperCase();
  delete CANONICAL_COUPONS[upper];

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  try {
    let query = supabaseAdmin.from('coupons').delete();
    if (isUuid) {
      query = query.eq('id', clean);
    } else {
      query = query.eq('code', upper);
    }

    const { error } = await query;
    return !error;
  } catch {
    return true;
  }
}


