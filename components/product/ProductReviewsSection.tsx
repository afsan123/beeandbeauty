'use client';

import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, MessageSquarePlus, AlertCircle } from 'lucide-react';
import { Rating } from '../ui/Rating';

interface ReviewItem {
  id: string;
  authorName: string;
  rating: number;
  shadeUsed?: string;
  comment: string;
  isVerifiedBuyer: boolean;
  createdAt: string;
}

interface ProductReviewsSectionProps {
  productId: string;
  productTitle: string;
  shades?: Array<{ id: string; name: string }>;
}

export function ProductReviewsSection({
  productId,
  productTitle,
  shades,
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [rating, setRating] = useState(5);
  const [shadeUsed, setShadeUsed] = useState(shades?.[0]?.name || '');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function loadReviews() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reviews?productId=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.reviews || []);
          setAverageRating(Number(data.averageRating) || 0);
          setTotalCount(data.totalCount || 0);
        }
      } catch {
        // Fallback
      } finally {
        setIsLoading(false);
      }
    }
    loadReviews();
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          authorName,
          rating,
          shadeUsed: shadeUsed || undefined,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit review.');
      }

      setReviews((prev) => [data.review, ...prev]);
      setTotalCount((prev) => prev + 1);
      setSubmitSuccess(true);
      setComment('');
      setAuthorName('');
      setTimeout(() => {
        setIsFormOpen(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-12 pt-8 border-t border-[#F0E6DD] font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#D4AF37] block mb-1">
            Real Customer Impressions
          </span>
          <h3 className="text-xl font-bold uppercase tracking-wider text-[#6A1B6D] font-serif">
            Verified Reviews &amp; Ratings
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider bg-[#6A1B6D] hover:bg-[#521354] text-white py-2.5 px-5 rounded-[2px] transition-colors cursor-pointer shadow-xs"
        >
          <MessageSquarePlus size={14} />
          <span>{isFormOpen ? 'Close Form' : 'Write a Review'}</span>
        </button>
      </div>

      {/* Summary Score */}
      <div className="bg-[#FFF9F5] p-5 rounded-[2px] border border-[#F0E6DD] flex flex-wrap items-center justify-between gap-4 mb-8">
        {totalCount > 0 ? (
          <div className="flex items-center gap-3">
            <span className="text-3xl font-serif font-bold text-[#6A1B6D]">{averageRating.toFixed(1)}</span>
            <div>
              <Rating rating={averageRating} reviewCount={totalCount} size="md" />
              <span className="text-[11px] text-neutral-500 block mt-0.5">
                Based on {totalCount} {totalCount === 1 ? 'review' : 'reviews'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600">
            No reviews yet. Be the first to share your experience.
          </p>
        )}
      </div>

      {/* Write Review Form Collapsible */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mb-8 p-6 bg-white border border-[#F0E6DD] rounded-[2px] shadow-2xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6A1B6D]">
            Share Your Experience with {productTitle}
          </h4>

          {submitSuccess ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-[2px]">
              Thank you! Your verified review has been published.
            </div>
          ) : (
            <>
              {submitError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[2px] flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="e.g. Nusrat Jahan"
                    className="w-full text-xs px-3 py-2 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                    Rating *
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="w-full text-xs px-3 py-2 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
                  >
                    <option value={5}>★★★★★ (5 Stars - Exceptional)</option>
                    <option value={4}>★★★★☆ (4 Stars - Very Good)</option>
                    <option value={3}>★★★☆☆ (3 Stars - Average)</option>
                    <option value={2}>★★☆☆☆ (2 Stars - Below Average)</option>
                    <option value={1}>★☆☆☆☆ (1 Star - Disappointed)</option>
                  </select>
                </div>

                {shades && shades.length > 0 && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                      Shade Used
                    </label>
                    <select
                      value={shadeUsed}
                      onChange={(e) => setShadeUsed(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D]"
                    >
                      {shades.map((s) => (
                        <option key={s.id} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6A1B6D] mb-1">
                  Your Review &amp; Formula Feedback *
                </label>
                <textarea
                  rows={3}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="How did the texture, pigmentation, and wear feel on your skin?"
                  className="w-full text-xs px-3 py-2 bg-[#FFF9F5] border border-[#F0E6DD] rounded-[2px] outline-hidden focus:border-[#6A1B6D] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#6A1B6D] hover:bg-[#521354] disabled:bg-neutral-400 text-white text-xs font-bold uppercase tracking-wider py-2.5 px-6 rounded-[2px] transition-colors cursor-pointer"
              >
                {isSubmitting ? 'Publishing Review...' : 'Submit Verified Review'}
              </button>
            </>
          )}
        </form>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-8 text-center text-xs text-neutral-400">Loading reviews...</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 bg-white border border-[#F0E6DD] rounded-[2px] shadow-2xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-[#2C2C2C]">{rev.authorName}</span>
                  {rev.isVerifiedBuyer && (
                    <span className="text-[10px] text-[#2E7D32] font-semibold bg-[#E8F5E9] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle size={10} />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center text-[#D4AF37]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={i < rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-neutral-300'}
                    />
                  ))}
                </div>
              </div>

              {rev.shadeUsed && (
                <div className="text-[11px] text-[#6A1B6D] font-medium">
                  Formula shade: <strong>{rev.shadeUsed}</strong>
                </div>
              )}

              <p className="text-xs text-[#666666] leading-relaxed">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
