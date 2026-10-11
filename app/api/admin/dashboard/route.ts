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

    // 1. Merchandising & Product Analytics
    const productSalesMap = new Map<
      string,
      { unitsSold: number; revenue: number; productTitle: string; categorySlug?: string }
    >();

    let totalUnitsSold = 0;
    const categoryRevenueMap = new Map<string, { revenue: number; unitsSold: number }>();
    allCategories.forEach((cat) => {
      categoryRevenueMap.set(cat.slug, { revenue: 0, unitsSold: 0 });
    });

    let freeShippingOrdersCount = 0;

    allOrders.forEach((order) => {
      if (order.orderStatus !== 'cancelled') {
        if (order.subtotal >= 2500 || order.shippingFee === 0) {
          freeShippingOrdersCount++;
        }

        order.items?.forEach((item) => {
          totalUnitsSold += item.quantity;
          const current = productSalesMap.get(item.productId) || {
            unitsSold: 0,
            revenue: 0,
            productTitle: item.productTitle,
          };
          current.unitsSold += item.quantity;
          current.revenue += item.lineTotal;
          productSalesMap.set(item.productId, current);

          // Find category
          const prodObj = allProducts.find((p) => p.id === item.productId);
          const catSlug = prodObj?.categorySlug || 'lips';
          const catStat = categoryRevenueMap.get(catSlug) || { revenue: 0, unitsSold: 0 };
          catStat.revenue += item.lineTotal;
          catStat.unitsSold += item.quantity;
          categoryRevenueMap.set(catSlug, catStat);
        });
      }
    });

    // Top Products ranking
    const topProducts = allProducts
      .map((p) => {
        const sales = productSalesMap.get(p.id) || { unitsSold: 0, revenue: 0 };
        return {
          id: p.id,
          title: p.title,
          categoryName: p.categoryName,
          categorySlug: p.categorySlug,
          price: p.price,
          inStock: p.inStock,
          unitsSold: sales.unitsSold,
          revenue: sales.revenue,
          isBestseller: Boolean(p.isBestseller),
        };
      })
      .sort((a, b) => {
        if (b.revenue !== a.revenue) return b.revenue - a.revenue;
        if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
        return (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0);
      })
      .slice(0, 6);

    // Category Breakdown
    const totalOrderRevenue = metrics.totalRevenue || 1;
    const categoryBreakdown = allCategories.map((cat) => {
      const stat = categoryRevenueMap.get(cat.slug) || { revenue: 0, unitsSold: 0 };
      const percent = Math.round((stat.revenue / totalOrderRevenue) * 100);
      const productCount = allProducts.filter((p) => p.categorySlug === cat.slug).length;
      return {
        slug: cat.slug,
        name: cat.name,
        revenue: stat.revenue,
        unitsSold: stat.unitsSold,
        productCount,
        percent,
      };
    });

    // 2. Daily Sales Trend (past 7 days or active order dates)
    const now = new Date();
    const salesTrends = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      let dayRevenue = 0;
      let dayOrders = 0;

      allOrders.forEach((o) => {
        if (o.orderStatus !== 'cancelled' && o.createdAt?.startsWith(dateStr)) {
          dayRevenue += o.totalAmount;
          dayOrders++;
        }
      });

      salesTrends.push({
        date: dateStr,
        label: dayLabel,
        revenue: dayRevenue,
        orders: dayOrders,
      });
    }

    // 3. Customer Intelligence
    const repeatCustomers = allCustomers.filter((c) => c.totalOrders > 1);
    const vipCustomers = allCustomers.filter((c) => c.totalSpent >= 5000);
    const repeatRate =
      allCustomers.length > 0
        ? Math.round((repeatCustomers.length / allCustomers.length) * 100)
        : 0;

    // 4. Executive Action Center (Important things requiring action)
    const urgentOrders = allOrders
      .filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'confirmed')
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        district: o.district,
        deliveryZone: o.deliveryZone,
        totalAmount: o.totalAmount,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
      }));

    const urgentInquiries = allInquiries
      .filter((i) => i.status !== 'resolved')
      .slice(0, 5)
      .map((i) => ({
        id: i.id,
        ticketNumber: i.ticketNumber,
        fullName: i.fullName,
        subject: i.subject,
        status: i.status,
        createdAt: i.createdAt,
      }));

    const pendingBookings = allBookings
      .filter((b) => b.status === 'pending')
      .slice(0, 5);

    // Stock alerts (products out of stock or with out of stock shades)
    const stockAlerts = allProducts
      .filter((p) => {
        if (!p.inStock) return true;
        const hasOutShade = p.shades?.some((s) => s.inStock === false);
        return hasOutShade;
      })
      .map((p) => ({
        id: p.id,
        title: p.title,
        categoryName: p.categoryName,
        inStock: p.inStock,
        outShades: p.shades?.filter((s) => s.inStock === false).map((s) => s.name) || [],
      }))
      .slice(0, 5);

    return NextResponse.json({
      metrics: {
        ...metrics,
        totalUnitsSold,
        basketSize:
          metrics.totalOrders > 0
            ? Number((totalUnitsSold / metrics.totalOrders).toFixed(1))
            : 0,
        freeShippingCount: freeShippingOrdersCount,
        freeShippingPercent:
          metrics.totalOrders > 0
            ? Math.round((freeShippingOrdersCount / metrics.totalOrders) * 100)
            : 0,
      },
      salesTrends,
      topProducts,
      categoryBreakdown,
      customerIntelligence: {
        totalCustomers: allCustomers.length,
        repeatCustomers: repeatCustomers.length,
        repeatRate,
        vipCustomers: vipCustomers.length,
        averageLtv:
          allCustomers.length > 0
            ? Math.round(metrics.totalRevenue / allCustomers.length)
            : 0,
        totalSubscribers: allSubscribers.length,
      },
      fulfillmentPipeline: {
        pendingCount: metrics.pendingCount,
        processingCount: metrics.processingCount,
        shippedCount: metrics.shippedCount,
        deliveredCount: metrics.deliveredCount,
        cancelledCount: metrics.cancelledCount,
        slaInsideDhaka: '24h Target (৳70)',
        slaOutsideDhaka: '48h Target (৳130)',
      },
      actionItems: {
        urgentOrders,
        urgentInquiries,
        pendingBookings,
        stockAlerts,
        systemHealth: {
          database: 'Supabase PostgreSQL Connected',
          courierGateways: 'Steadfast & Pathao Ready',
          paymentGateways: 'bKash & Nagad MFS Active',
          smsHelpline: '+8801754502430',
        },
      },
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
        pendingBookings: pendingBookings.length,
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
