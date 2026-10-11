import React, { Suspense } from 'react';
import { catalogRepository } from '../data/mock/mockRepository';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryTiles } from '../components/home/CategoryTiles';
import { ProductRail } from '../components/home/ProductRail';
import { OfferBanner } from '../components/home/OfferBanner';
import { FounderNote } from '../components/home/FounderNote';
import { VideoBlock } from '../components/home/VideoBlock';

export const instant = false;

async function HomePageContent() {
  const [categories, bestsellers, newLaunches, skincare, under499] = await Promise.all([
    catalogRepository.getCategories(),
    catalogRepository.getFeaturedProducts('bestseller'),
    catalogRepository.getFeaturedProducts('new'),
    catalogRepository.getProducts({ category: 'skin' }),
    catalogRepository.getFeaturedProducts('under499'),
  ]);

  return (
    <>
      {/* 2. Category Navigation Tiles */}
      <CategoryTiles categories={categories} />

      {/* 3. Bestsellers Rail */}
      <ProductRail
        title="Cult Bestsellers"
        subtitle="Our most celebrated makeup and skincare formulas loved across Bangladesh."
        products={bestsellers}
        viewAllHref="/shop/all?sort=bestselling"
        viewAllLabel="View All Bestsellers"
        limit={4}
      />

      {/* 4. Highlight Offer Banner */}
      <OfferBanner
        code="BEE700"
        headline="Festive Glamour Celebration: Flat ৳700 Off"
        description="Enjoy an instant ৳700 discount on cart value over ৳2,999. Plus, complimentary tracked doorstep delivery nationwide."
        badge="Limited Time Offer"
        ctaHref="/offers"
        ctaText="View All Deals"
      />

      {/* 5. Clean Skincare & Barrier Rituals Rail */}
      <ProductRail
        title="Clean Skincare Rituals"
        subtitle="Raw propolis, barrier-repairing ceramides, and SPF 50 sun defense formulated for humid tropical climates."
        products={skincare}
        viewAllHref="/shop/skin"
        viewAllLabel="Explore All Skincare"
        limit={4}
      />

      {/* 6. New Launches Rail */}
      <ProductRail
        title="Just Launched"
        subtitle="Fresh drops, breakthrough textures, and newly engineered seasonal shades."
        products={newLaunches}
        viewAllHref="/shop/all?badge=new"
        viewAllLabel="Shop New Arrivals"
        limit={4}
      />

      {/* 7. Signature Masterclass Video Tutorials */}
      <VideoBlock />

      {/* 8. Under ৳499 Value Rail */}
      <ProductRail
        title="Under ৳499 Essentials"
        subtitle="High-impact beauty that fits everyday vanity routines without compromise."
        products={under499}
        viewAllHref="/shop/under499"
        viewAllLabel="Shop Under ৳499"
        limit={4}
      />

      {/* 9. Founder's Note & Clean Formulation Ethos */}
      <FounderNote />
    </>
  );
}

function HomePageSkeleton() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-10 space-y-12 animate-pulse">
      <div className="h-28 bg-[#F0E6DD]/60 rounded-xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="aspect-square bg-[#F0E6DD]/40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main className="w-full">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageContent />
      </Suspense>
    </main>
  );
}
