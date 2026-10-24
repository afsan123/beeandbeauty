'use client';

import React, { useState, useEffect } from 'react';
import { AdminHeader } from '../../../components/admin/AdminHeader.tsx';
import type { StoredReview } from '../../../lib/services/reviewService.ts';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<StoredReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchReviews = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin/reviews');
      if (!res.ok) throw new Error('Failed to load reviews');
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading product reviews.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleVerified = async (review: StoredReview) => {
    const newVerified = !review.isVerifiedBuyer;
    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: review.id, isVerified: newVerified }),
      });
      if (res.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === review.id ? { ...r, isVerifiedBuyer: newVerified } : r
          )
        );
      }
    } catch (err) {
      console.error('Error toggling verified buyer status:', err);
    }
  };

  const handleDeleteReview = async (review: StoredReview) => {
    if (!confirm('Are you sure you want to remove this review?')) return;
    try {
      const res = await fetch(`/api/admin/reviews?id=${review.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to delete review');
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== review.id));
    } catch (err) {
      console.error('Error deleting review:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <AdminHeader
        onToggleSidebar={() => {}}
        title="Customer Reviews Moderation"
        subtitle="Audit, verify, and moderate verified buyer cosmetic feedback across the catalog."
        actionButton={{
          label: 'Refresh Reviews',
          onClick: fetchReviews,
          icon: <span className="text-base">⭐</span>,
        }}
      />

      {errorMsg && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700">
          ⚠ {errorMsg}
        </div>
      )}

      {/* Reviews Table */}
      <div className="rounded-2xl border border-stone-200/80 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-stone-200 bg-[var(--bb-ivory)] px-6 py-4">
          <div>
            <h3 className="text-base font-bold font-serif text-stone-900">
              Customer Testimonials & Ratings
            </h3>
            <p className="text-xs text-stone-500">
              Reviews left by customers are published immediately on product pages
            </p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-700">
            {reviews.length} Total Reviews
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500">
              <tr>
                <th className="py-3 px-4 font-bold uppercase">Product / Shade</th>
                <th className="py-3 px-4 font-bold uppercase">Customer</th>
                <th className="py-3 px-4 font-bold uppercase">Rating</th>
                <th className="py-3 px-4 font-bold uppercase">Feedback & Comment</th>
                <th className="py-3 px-4 font-bold uppercase text-center">Verified Badge</th>
                <th className="py-3 px-4 font-bold uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-500 font-medium">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[var(--bb-plum)] border-t-transparent mr-2 align-middle" />
                    Loading reviews...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    No reviews in database.
                  </td>
                </tr>
              ) : (
                reviews.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-stone-900 font-mono">{r.productId}</p>
                      {r.shadeUsed && (
                        <span className="text-[10px] text-stone-500">
                          Shade: {r.shadeUsed}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-stone-800">
                      {r.authorName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-amber-500 font-bold text-sm">
                        {'★'.repeat(r.rating)}
                        {'☆'.repeat(5 - r.rating)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md text-stone-700 leading-relaxed font-sans">
                      &ldquo;{r.comment}&rdquo;
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleToggleVerified(r)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase transition-all ${
                          r.isVerifiedBuyer
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}
                      >
                        {r.isVerifiedBuyer ? '✓ Verified Buyer' : 'Unverified'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteReview(r)}
                        className="rounded-lg p-1.5 text-stone-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                        title="Delete review"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
