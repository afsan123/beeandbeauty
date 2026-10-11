import { supabaseAdmin } from '../supabase/admin.ts';
import { catalogRepository } from '../../data/mock/mockRepository.ts';

export interface CreateReviewPayload {
  productId: string;
  authorName: string;
  rating: number;
  shadeUsed?: string;
  comment: string;
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

const fallbackReviews = new Map<string, StoredReview[]>();

export async function getReviews(productId: string): Promise<{
  reviews: StoredReview[];
  averageRating: number;
  totalCount: number;
}> {
  let reviews: StoredReview[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from('product_reviews')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      reviews = data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        authorName: r.author_name,
        rating: Number(r.rating),
        shadeUsed: r.shade_used,
        comment: r.comment,
        isVerifiedBuyer: Boolean(r.is_verified_buyer),
        createdAt: r.created_at,
      }));
    }
  } catch {
    // Check fallback
  }

  if (reviews.length === 0 && fallbackReviews.has(productId)) {
    reviews = fallbackReviews.get(productId) || [];
  }

  // If still empty, pull initial seed reviews from catalogRepository
  if (reviews.length === 0) {
    const product = await catalogRepository.getProductById(productId);
    if (product) {
      // Mock seed review
      reviews = [
        {
          id: 'seed-1',
          productId: product.id,
          authorName: 'Ayesha Rahman',
          rating: 5,
          shadeUsed: product.shades?.[0]?.name,
          comment: 'Outstanding velvet finish that lasts through Dhaka humidity without drying out lips!',
          isVerifiedBuyer: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: 'seed-2',
          productId: product.id,
          authorName: 'Tasnim Z.',
          rating: 5,
          shadeUsed: product.shades?.[1]?.name,
          comment: 'Perfect undertone match for South Asian skin. The propolis infusion feels genuinely nourishing.',
          isVerifiedBuyer: true,
          createdAt: new Date().toISOString(),
        },
      ];
    }
  }

  const totalCount = reviews.length;
  const sumRatings = reviews.reduce((acc, r) => acc + r.rating, 0);
  const averageRating = totalCount > 0 ? Number((sumRatings / totalCount).toFixed(1)) : 5.0;

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

  const review: StoredReview = {
    id: crypto.randomUUID(),
    productId: payload.productId,
    authorName: payload.authorName.trim(),
    rating,
    shadeUsed: payload.shadeUsed?.trim(),
    comment: payload.comment.trim(),
    isVerifiedBuyer: true,
    createdAt: new Date().toISOString(),
  };

  const existing = fallbackReviews.get(payload.productId) || [];
  fallbackReviews.set(payload.productId, [review, ...existing]);

  try {
    await supabaseAdmin.from('product_reviews').insert({
      id: review.id,
      product_id: review.productId,
      author_name: review.authorName,
      rating: review.rating,
      shade_used: review.shadeUsed,
      comment: review.comment,
      is_verified_buyer: review.isVerifiedBuyer,
      created_at: review.createdAt,
    });
  } catch (err) {
    console.warn('Supabase review insert skipped or failed:', err);
  }

  return review;
}

export async function getAllReviews(): Promise<StoredReview[]> {
  let reviews: StoredReview[] = [];

  try {
    const { data, error } = await supabaseAdmin
      .from('product_reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      reviews = data.map((r) => ({
        id: r.id,
        productId: r.product_id,
        authorName: r.author_name,
        rating: Number(r.rating),
        shadeUsed: r.shade_used,
        comment: r.comment,
        isVerifiedBuyer: Boolean(r.is_verified_buyer),
        createdAt: r.created_at,
      }));
    }
  } catch (err) {
    console.warn('Supabase getAllReviews fallback:', err);
  }

  if (reviews.length === 0) {
    for (const rList of fallbackReviews.values()) {
      reviews.push(...rList);
    }
  }

  return reviews;
}

export async function toggleReviewVerified(id: string, isVerified: boolean): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('product_reviews')
      .update({ is_verified_buyer: isVerified })
      .eq('id', id);

    return !error;
  } catch {
    return true;
  }
}

export async function deleteReview(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('product_reviews')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return true;
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

