import { OFFERS } from '../../data/mock/catalogData.ts';
import type { Offer } from '../../data/types.ts';
import { supabaseAdmin } from '../supabase/admin.ts';

export interface LimitedOffer extends Offer {
  isActive: boolean;
  bannerImage?: string;
  createdAt?: string;
}

const DEFAULT_LIMITED_OFFERS: LimitedOffer[] = OFFERS.map((o) => ({
  ...o,
  isActive: true,
}));

let inMemoryOffers: LimitedOffer[] = [...DEFAULT_LIMITED_OFFERS];
let isOffersLoaded = false;

export async function fetchRemoteOffers(): Promise<void> {
  try {
    const { data, error } = await supabaseAdmin.from('limited_offers').select('*');

    if (!error && data && data.length > 0) {
      inMemoryOffers = data.map((row) => ({
        id: row.id,
        code: row.code,
        title: row.title,
        description: row.description || '',
        discountType: row.discount_type,
        discountValue: Number(row.discount_value),
        minSpend: row.min_spend ? Number(row.min_spend) : undefined,
        freeItemName: row.free_item_name || undefined,
        expiryNote: row.expiry_note || 'Limited Time Offer',
        badge: row.badge || 'Flash Deal',
        isActive: row.is_active !== false,
      }));
      isOffersLoaded = true;
    }
  } catch {
    // Fallback to in-memory
  }
}

export async function getAllOffers(): Promise<LimitedOffer[]> {
  if (!isOffersLoaded) {
    await fetchRemoteOffers();
  }
  return [...inMemoryOffers];
}

export async function getActiveOffers(): Promise<LimitedOffer[]> {
  const all = await getAllOffers();
  return all.filter((o) => o.isActive);
}

export async function createOffer(input: Omit<LimitedOffer, 'id'> & { id?: string }): Promise<LimitedOffer> {
  const id = input.id || `offer-${Date.now()}`;
  const newOffer: LimitedOffer = {
    ...input,
    id,
    isActive: input.isActive !== false,
  };

  const existingIdx = inMemoryOffers.findIndex(
    (o) => o.id === newOffer.id || (o.code && o.code.toUpperCase() === newOffer.code?.toUpperCase())
  );
  if (existingIdx !== -1) {
    inMemoryOffers[existingIdx] = newOffer;
  } else {
    inMemoryOffers.push(newOffer);
  }

  try {
    await supabaseAdmin.from('limited_offers').insert({
      id: newOffer.id,
      code: newOffer.code,
      title: newOffer.title,
      description: newOffer.description,
      discount_type: newOffer.discountType,
      discount_value: newOffer.discountValue,
      min_spend: newOffer.minSpend,
      free_item_name: newOffer.freeItemName,
      expiry_note: newOffer.expiryNote,
      badge: newOffer.badge,
      is_active: newOffer.isActive,
    });
  } catch (err) {
    console.error('Remote offer insert fallback to memory:', err);
  }

  return newOffer;
}

export async function updateOffer(
  id: string,
  updates: Partial<LimitedOffer>
): Promise<LimitedOffer | null> {
  const index = inMemoryOffers.findIndex((o) => o.id === id);
  if (index === -1) return null;

  const updated: LimitedOffer = {
    ...inMemoryOffers[index],
    ...updates,
  };
  inMemoryOffers[index] = updated;

  try {
    await supabaseAdmin
      .from('limited_offers')
      .update({
        code: updated.code,
        title: updated.title,
        description: updated.description,
        discount_type: updated.discountType,
        discount_value: updated.discountValue,
        min_spend: updated.minSpend,
        free_item_name: updated.freeItemName,
        expiry_note: updated.expiryNote,
        badge: updated.badge,
        is_active: updated.isActive,
      })
      .eq('id', id);
  } catch (err) {
    console.error('Remote offer update fallback to memory:', err);
  }

  return updated;
}

export async function deleteOffer(id: string): Promise<boolean> {
  const index = inMemoryOffers.findIndex((o) => o.id === id);
  if (index === -1) return false;

  inMemoryOffers.splice(index, 1);

  try {
    await supabaseAdmin.from('limited_offers').delete().eq('id', id);
  } catch (err) {
    console.error('Remote offer delete fallback to memory:', err);
  }

  return true;
}
