import { NextResponse } from 'next/server.js';
import { getCurrentAdminUser } from '../../../../lib/services/adminAuth.ts';
import { getOrderMetrics, getAllOrders } from '../../../../lib/services/orderService.ts';
import { getAllInquiries } from '../../../../lib/services/inquiryService.ts';
import { getAllCoupons } from '../../../../lib/services/couponService.ts';
import { getAllReviews } from '../../../../lib/services/reviewService.ts';
import { getAllSubscribers } from '../../../../lib/services/newsletterService.ts';
import { getAllCustomers } from '../../../../lib/services/customerService.ts';
import { getAllCatalogProducts } from '../../../../lib/services/productService.ts';
import { getAllCategories } from '../../../../lib/services/categoryService.ts';
import { getAllBookings } from '../../../../lib/services/studioService.ts';
import { getAllBanners } from '../../../../lib/services/bannerService.ts';
import { getAllOffers } from '../../../../lib/services/limitedOfferService.ts';

export async function GET() {
  const user = await getCurrentAdminUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized executive access.' }, { status: 401 });
  }

  try {
    const [
      metrics,
      allOrders,
      allInquiries,
      allCoupons,
      allReviews,
      allSubscribers,
      allCustomers,
      allProducts,
      allCategories,
      allBookings,
      allBanners,
      allOffers,
    ] = await Promise.all([
      getOrderMetrics(),
      getAllOrders(),
      getAllInquiries(),
      getAllCoupons(),
      getAllReviews(),
      getAllSubscribers(),
      getAllCustomers(),
      getAllCatalogProducts(),
      getAllCategories(),
      getAllBookings(),
      getAllBanners(),
      getAllOffers(),
    ]);

    const recentOrders = allOrders.slice(0, 6);
    const recentInquiries = allInquiries.slice(0, 5);
    const activeCoupons = allCoupons.filter((c) => c.isActive);

    return NextResponse.json({
      metrics,
      recentOrders,
      recentInquiries,
      counts: {
        activeCoupons: activeCoupons.length,
        totalReviews: allReviews.length,
        totalSubscribers: allSubscribers.length,
        openInquiries: allInquiries.filter((i) => i.status !== 'resolved').length,
        totalCustomers: allCustomers.length,
        totalProducts: allProducts.length,
        totalCategories: allCategories.length,
        pendingBookings: allBookings.filter((b) => b.status === 'pending').length,
        activeBanners: allBanners.filter((b) => b.isActive).length,
        activeOffers: allOffers.filter((o) => o.isActive).length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error fetching dashboard analytics.' },
      { status: 500 }
    );
  }
}
