import { NextRequest, NextResponse } from 'next/server';
import { getReviews, createReview, CreateReviewPayload } from '../../../lib/services/reviewService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Query parameter "productId" is required.',
        },
        { status: 400 }
      );
    }

    const data = await getReviews(productId);
    return NextResponse.json({
      success: true,
      ...data,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch reviews.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { checkRateLimit, getClientIp, rateLimitResponse } = await import('../../../lib/security/rateLimit.ts');
  const limit = checkRateLimit(`reviews:${getClientIp(req)}`, 8, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(rateLimitResponse(limit.retryAfterSeconds), {
      status: 429,
      headers: { 'Retry-After': String(limit.retryAfterSeconds) },
    });
  }

  try {
    const body: CreateReviewPayload = await req.json();

    if (!body.productId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Field "productId" is required.',
        },
        { status: 400 }
      );
    }

    const review = await createReview(body);
    return NextResponse.json(
      {
        success: true,
        review,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to submit review.';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
