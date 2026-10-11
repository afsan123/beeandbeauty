/**
 * Shipping & Logistics Engine for Bee & Beauty Bangladesh
 *
 * Rules:
 * - Free shipping threshold: ৳2,500
 * - Inside Dhaka: ৳70 (Target SLA: 24 Hours)
 * - Outside Dhaka: ৳130 (Target SLA: 48 Hours via Steadfast / Pathao)
 */

export interface ShippingCalculationResult {
  zone: 'dhaka' | 'outside';
  shippingFee: number;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  amountNeededForFreeShipping: number;
  targetTimeline: string;
  courierPartners: string[];
}

export const FREE_SHIPPING_THRESHOLD = 2500;
export const DHAKA_SHIPPING_FEE = 70;
export const OUTSIDE_DHAKA_SHIPPING_FEE = 130;

export function isDhakaZone(district: string): boolean {
  if (!district) return true;
  const normalized = district.trim().toLowerCase();
  return (
    normalized.includes('dhaka') ||
    normalized.includes('ঢাকা') ||
    normalized.includes('gulshan') ||
    normalized.includes('banani') ||
    normalized.includes('dhanmondi') ||
    normalized.includes('uttara') ||
    normalized.includes('mirpur') ||
    normalized.includes('motijheel') ||
    normalized.includes('mohammadpur') ||
    normalized.includes('badda')
  );
}

export function calculateShipping(
  district: string,
  subtotal: number
): ShippingCalculationResult {
  const isDhaka = isDhakaZone(district);
  const zone: 'dhaka' | 'outside' = isDhaka ? 'dhaka' : 'outside';

  const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
  const baseFee = isDhaka ? DHAKA_SHIPPING_FEE : OUTSIDE_DHAKA_SHIPPING_FEE;
  const shippingFee = freeShippingEligible ? 0 : baseFee;
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const targetTimeline = isDhaka
    ? 'Inside Dhaka: Target within 24 Hours'
    : 'Outside Dhaka: Target within 48 Hours';

  return {
    zone,
    shippingFee,
    freeShippingEligible,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    amountNeededForFreeShipping,
    targetTimeline,
    courierPartners: isDhaka ? ['Bee&Beauty Direct Dispatch', 'Pathao'] : ['Steadfast Courier', 'Pathao Logistics'],
  };
}
