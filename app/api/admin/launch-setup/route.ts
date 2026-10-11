import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import {
  LAUNCH_CATEGORIES,
  LAUNCH_PRODUCTS,
  LAUNCH_BANNERS,
  LAUNCH_OFFERS,
  LAUNCH_STUDIO_TUTORIALS,
} from '../../../../lib/data/launchCatalog.ts';
import { bulkCreateCatalogProducts } from '../../../../lib/services/productService.ts';
import { createCategory } from '../../../../lib/services/categoryService.ts';
import { createBanner } from '../../../../lib/services/bannerService.ts';
import { createOffer } from '../../../../lib/services/limitedOfferService.ts';
import { createTutorial, clearTestBookings } from '../../../../lib/services/studioService.ts';
import { clearTestOrders } from '../../../../lib/services/orderService.ts';
import { clearTestInquiries } from '../../../../lib/services/inquiryService.ts';
import { clearTestReviews } from '../../../../lib/services/reviewService.ts';

import { getAllCategories } from '../../../../lib/services/categoryService.ts';
import { getAllCatalogProducts } from '../../../../lib/services/productService.ts';
import { getAllBanners } from '../../../../lib/services/bannerService.ts';
import { getAllOffers } from '../../../../lib/services/limitedOfferService.ts';
import { getAllTutorials } from '../../../../lib/services/studioService.ts';
import { getAllInquiries } from '../../../../lib/services/inquiryService.ts';
import { getAllOrders } from '../../../../lib/services/orderService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const [categories, products, banners, offers, tutorials, inquiries, orders] =
      await Promise.all([
        getAllCategories(),
        getAllCatalogProducts(),
        getAllBanners(),
        getAllOffers(),
        getAllTutorials(),
        getAllInquiries(),
        getAllOrders(),
      ]);

    const isLaunchReady =
      orders.length === 0 && products.length >= 24 && categories.length >= 7;

    return NextResponse.json({
      isLaunchReady,
      stats: {
        categoriesCount: categories.length,
        productsCount: products.length,
        bannersCount: banners.length,
        offersCount: offers.length,
        tutorialsCount: tutorials.length,
        ordersCount: orders.length,
        inquiriesCount: inquiries.length,
      },
      targets: {
        categories: 7,
        products: 24,
        banners: 3,
        offers: 3,
        tutorials: 3,
        maxOrders: 0,
      },
      market: {
        currency: 'BDT (৳)',
        freeShippingThreshold: 2500,
        dhakaFee: 70,
        outsideDhakaFee: 130,
        helpline: '+8801754502430',
        officialEmail: 'beeandbeauty.bd@gmail.com',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to inspect launch readiness' },
      { status: 500 }
    );
  }
}

export async function POST() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    // 1. Purge dummy/mock operational records (orders, inquiries, reviews, bookings)
    const [ordersResult, inquiriesResult, reviewsResult, bookingsResult] = await Promise.all([
      clearTestOrders(),
      clearTestInquiries(),
      clearTestReviews(),
      clearTestBookings(),
    ]);

    // 2. Populate 7 Launch Categories
    const categoriesCreated = [];
    for (const cat of LAUNCH_CATEGORIES) {
      const created = await createCategory(cat);
      categoriesCreated.push(created);
    }

    // 3. Bulk Ingest 24 Launch Products via bulk service
    const productBatchResult = await bulkCreateCatalogProducts(LAUNCH_PRODUCTS);

    // 4. Populate Launch Banners
    const bannersCreated = [];
    for (const banner of LAUNCH_BANNERS) {
      const created = await createBanner(banner);
      bannersCreated.push(created);
    }

    // 5. Populate Launch Limited Offers
    const offersCreated = [];
    for (const offer of LAUNCH_OFFERS) {
      const created = await createOffer({ ...offer, isActive: true });
      offersCreated.push(created);
    }

    // 6. Populate Pro Beauty Studio Masterclasses
    const tutorialsCreated = [];
    for (const tut of LAUNCH_STUDIO_TUTORIALS) {
      const created = await createTutorial(tut);
      tutorialsCreated.push(created);
    }

    return NextResponse.json({
      success: true,
      message: 'Official Bee & Beauty pre-launch catalog populated and dummy records purged successfully.',
      summary: {
        categoriesCount: categoriesCreated.length,
        productsCount: productBatchResult.count,
        bannersCount: bannersCreated.length,
        offersCount: offersCreated.length,
        tutorialsCount: tutorialsCreated.length,
        purgedOrdersCount: ordersResult.deletedCount,
        purgedInquiriesCount: inquiriesResult.deletedCount,
        purgedReviewsCount: reviewsResult.deletedCount,
      },
    });
  } catch (error: any) {
    console.error('Error during launch setup:', error);
    return NextResponse.json(
      { error: error?.message || 'Error occurred during launch setup execution.' },
      { status: 500 }
    );
  }
}
