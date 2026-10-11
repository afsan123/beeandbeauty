import type { CartItem } from '../data/types.ts';

export const FREE_SHIPPING_THRESHOLD = 1499; // BDT ৳1,499 for free shipping
export const STANDARD_SHIPPING_FEE = 80; // BDT ৳80 flat standard shipping

export interface FreeShippingStatus {
  current: number;
  threshold: number;
  percent: number;
  remaining: number;
  isUnlocked: boolean;
}

export interface CouponResult {
  code: string | null;
  discountAmount: number;
  isValid: boolean;
  message: string;
}

export interface CartTotals {
  subtotal: number;
  itemCount: number;
  discount: number;
  shippingFee: number;
  total: number;
  totalSavings: number;
  appliedCoupon: string | null;
}

export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function calculateOriginalTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => {
    const originalPrice = item.compareAtPrice && item.compareAtPrice > item.price ? item.compareAtPrice : item.price;
    return sum + originalPrice * item.quantity;
  }, 0);
}

export function calculateFreeShippingProgress(subtotal: number): FreeShippingStatus {
  const current = Math.max(0, subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - current);
  const percent = Math.min(100, Math.round((current / FREE_SHIPPING_THRESHOLD) * 100));
  const isUnlocked = current >= FREE_SHIPPING_THRESHOLD;

  return {
    current,
    threshold: FREE_SHIPPING_THRESHOLD,
    percent,
    remaining,
    isUnlocked,
  };
}

export function calculateShippingFee(subtotal: number): number {
  if (subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return STANDARD_SHIPPING_FEE;
}

export function applyCoupon(subtotal: number, couponCode?: string | null): CouponResult {
  if (!couponCode || subtotal <= 0) {
    return { code: null, discountAmount: 0, isValid: false, message: '' };
  }

  const normalized = couponCode.trim().toUpperCase();

  if (normalized === 'BEEFIRST') {
    // 10% off entire order
    const discount = Math.round(subtotal * 0.1);
    return {
      code: 'BEEFIRST',
      discountAmount: discount,
      isValid: true,
      message: '10% First Order Welcome Discount applied!',
    };
  }

  if (normalized === 'BEE700') {
    // Flat ৳700 off orders over ৳2,999
    if (subtotal >= 2999) {
      return {
        code: 'BEE700',
        discountAmount: 700,
        isValid: true,
        message: 'Flat ৳700 Festive Discount applied!',
      };
    }
    return {
      code: 'BEE700',
      discountAmount: 0,
      isValid: false,
      message: 'Code BEE700 requires minimum order of ৳2,999.',
    };
  }

  if (normalized === 'GLAM20') {
    // 20% off orders over ৳1,999
    if (subtotal >= 1999) {
      const discount = Math.round(subtotal * 0.2);
      return {
        code: 'GLAM20',
        discountAmount: discount,
        isValid: true,
        message: '20% Glamour Week discount applied!',
      };
    }
    return {
      code: 'GLAM20',
      discountAmount: 0,
      isValid: false,
      message: 'Code GLAM20 requires minimum order of ৳1,999.',
    };
  }

  return {
    code: normalized,
    discountAmount: 0,
    isValid: false,
    message: 'Invalid or expired promotional code.',
  };
}

export function calculateCartTotals(items: CartItem[], couponCode?: string | null): CartTotals {
  const subtotal = calculateSubtotal(items);
  const itemCount = calculateItemCount(items);
  const couponResult = applyCoupon(subtotal, couponCode);
  const shippingFee = calculateShippingFee(subtotal);
  const originalTotal = calculateOriginalTotal(items);
  const catalogSavings = Math.max(0, originalTotal - subtotal);
  const totalSavings = catalogSavings + couponResult.discountAmount;
  const total = Math.max(0, subtotal - couponResult.discountAmount + shippingFee);

  return {
    subtotal,
    itemCount,
    discount: couponResult.discountAmount,
    shippingFee,
    total,
    totalSavings,
    appliedCoupon: couponResult.isValid ? couponResult.code : null,
  };
}

export function addLineItem(
  items: CartItem[],
  newItem: Omit<CartItem, 'quantity'> & { quantity?: number }
): CartItem[] {
  const quantityToAdd = newItem.quantity && newItem.quantity > 0 ? newItem.quantity : 1;
  const existingIndex = items.findIndex((i) => i.id === newItem.id);

  if (existingIndex > -1) {
    return items.map((item, idx) =>
      idx === existingIndex
        ? { ...item, quantity: item.quantity + quantityToAdd }
        : item
    );
  }

  return [...items, { ...newItem, quantity: quantityToAdd }];
}

export function updateLineItemQuantity(
  items: CartItem[],
  cartItemId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return items.filter((item) => item.id !== cartItemId);
  }

  return items.map((item) =>
    item.id === cartItemId ? { ...item, quantity } : item
  );
}

export function removeLineItem(items: CartItem[], cartItemId: string): CartItem[] {
  return items.filter((item) => item.id !== cartItemId);
}
