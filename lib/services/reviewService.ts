import { isSupabaseAdminReady, supabaseAdmin } from '../supabase/admin.ts';
import { normalizeBdPhone, phonesMatch } from '../security/phone.ts';

export interface CreateReviewPayload {
  productId: string;
  authorName: string;
  rating: number;
  shadeUsed?: string;
  comment: string;
  authorEmail?: string;
  authorPhone?: string;
}

export interface StoredReview {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  shadeUsed?: string;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

// Local-only store used when Supabase is NOT configured (tests / local dev).
// When Supabase is configured the database is the only source of truth, so
// reviews are never invented or silently kept in memory.
const fallbackReviews = new Map<string, StoredReview[]>();

function mapReviewRow(r: Record<string, any>): StoredReview {
  return {
    id: r.id,
    productId: r.product_id,
    authorName: r.author_name,
    rating: Number(r.rating),
    shadeUsed: r.shade_used || undefined,
    comment: r.comment,
    isVerifiedBuyer: Boolean(r.is_verified_buyer),
    createdAt: r.created_at,
  };
}

async function hasPurchasedProduct(
  productId: string,
  email?: string,
  phone?: string
): Promise<boolean> {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = normalizeBdPhone(phone);
  if (!cleanEmail && !cleanPhone) return false;

  try {
    let query = supabaseAdmin
      .from('orders')
      .select('id, customer_email, customer_phone, order_items!inner(product_id)')
      .eq('order_items.product_id', productId)
      .neq('order_status', 'cancelled');

    if (cleanEmail) {
      query = query.eq('customer_email', cleanEmail);
    }

    const { data, error } = await query.limit(20);
    if (error || !data) return false;

    return data.some((row) => {
      const emailMatch = cleanEmail ? row.customer_email?.toLowerCase() === cleanEmail : false;
      const phoneMatch = cleanPhone ? phonesMatch(row.customer_phone, cleanPhone) : false;
      return emailMatch || phoneMatch;
    });
  } catch {
    return false;
  }
}

export async function getReviews(productId: string): Promise<{
  reviews: StoredReview[];
  averageRating: number;
  totalCount: number;
}> {
  let reviews: StoredReview[] = [];

  if (isSupabaseAdminReady()) {
    const { data, error } = await supabaseAdmin
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[reviews] Failed to load reviews:', error.message);
      throw new Error('Could not load reviews right now.');
    }
    reviews = (data || []).map(mapReviewRow);
  } else {
    reviews = fallbackReviews.get(productId) || [];
  }

  const totalCount = reviews.length;
  const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
  // No reviews means no rating — never default to a fake 5 stars.
  const averageRating = totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : 0;

  return { reviews, averageRating, totalCount };
}

export async function createReview(payload: CreateReviewPayload): Promise<StoredReview> {
  if (!payload.authorName?.trim()) {
    throw new Error('Name is required.');
  }
  if (!payload.comment?.trim() || payload.comment.trim().length < 5) {
    throw new Error('Review must be at least 5 characters.');
  }
  const rating = Math.min(5, Math.max(1, Math.round(payload.rating || 5)));

  const isVerifiedBuyer = await hasPurchasedProduct(
    payload.productId,
    payload.authorEmail,
    payload.authorPhone
  );

  const review: StoredReview = {
    id: crypto.randomUUID(),
    productId: payload.productId,
    authorName: payload.authorName.trim(),
    rating,
    shadeUsed: payload.shadeUsed?.trim(),
    comment: payload.comment.trim(),
    isVerifiedBuyer,
    createdAt: new Date().toISOString(),
  };

  if (!isSupabaseAdminReady()) {
    const existing = fallbackReviews.get(payload.productId) || [];
    fallbackReviews.set(payload.productId, [review, ...existing]);
    return review;
  }

  const { error } = await supabaseAdmin.from('product_reviews').insert({
    id: review.id,
    product_id: review.productId,
    author_name: review.authorName,
    rating: review.rating,
    shade_used: review.shadeUsed,
    comment: review.comment,
    is_verified_buyer: review.isVerifiedBuyer,
    author_email: payload.authorEmail?.trim().toLowerCase() || null,
    author_phone: normalizeBdPhone(payload.authorPhone) || null,
    created_at: review.createdAt,
  });

  if (error) {
    console.error('[reviews] Review insert failed:', error.code, error.message);
    if (error.code === '23503') {
      throw new Error('This product no longer exists.');
    }
    throw new Error('We could not save your review. Please try again.');
  }

  return review;
}

export async function getAllReviews(): Promise<StoredReview[]> {
  if (!isSupabaseAdminReady()) {
    return Array.from(fallbackReviews.values()).flat();
  }

  const { data, error } = await supabaseAdmin
    .from('product_reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[reviews] getAllReviews failed:', error.message);
    throw new Error('Could not load reviews.');
  }
  return (data || []).map(mapReviewRow);
}

export async function toggleReviewVerified(id: string, isVerified: boolean): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('product_reviews')
      .update({ is_verified_buyer: isVerified })
      .eq('id', id);

    if (error) console.error('[reviews] update/delete failed:', error.message);
    return !error;
  } catch (err) {
    console.error('[reviews] update/delete failed:', err);
    return false;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('product_reviews')
      .delete()
      .eq('id', id);

    if (error) console.error('[reviews] update/delete failed:', error.message);
    return !error;
  } catch (err) {
    console.error('[reviews] update/delete failed:', err);
    return false;
  }
}

export async function clearTestReviews(): Promise<{ success: boolean; deletedCount: number }> {
  fallbackReviews.clear();
  let count = 0;

  try {
    const { data } = await supabaseAdmin
      .from('product_reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select('id');
    if (data) {
      count = data.length;
    }
  } catch (err) {
    console.warn('Supabase clearTestReviews fallback:', err);
  }

  return { success: true, deletedCount: count };
}

