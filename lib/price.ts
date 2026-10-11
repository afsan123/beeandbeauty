/**
 * Pure price formatting and discount calculation functions for Bee&Beauty
 */

export function formatPrice(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '৳0';
  }
  const rounded = Math.round(amount);
  return `৳${rounded.toLocaleString('en-US')}`;
}

export function calculateDiscountPercentage(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }
  const discount = ((compareAtPrice - price) / compareAtPrice) * 100;
  return Math.round(discount);
}

export function calculateSavings(price: number, compareAtPrice?: number): number {
  if (!compareAtPrice || compareAtPrice <= price) {
    return 0;
  }
  return compareAtPrice - price;
}

export function hasDiscount(price: number, compareAtPrice?: number): boolean {
  return typeof compareAtPrice === 'number' && compareAtPrice > price;
}
