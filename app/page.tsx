import React from 'react';
import { catalogRepository } from '../data/mock/mockRepository';
import { HeroCarousel } from '../components/home/HeroCarousel';
import { CategoryTiles } from '../components/home/CategoryTiles';
import { ProductRail } from '../components/home/ProductRail';
import { OfferBanner } from '../components/home/OfferBanner';
import { FounderNote } from '../components/home/FounderNote';
import { VideoBlock } from '../components/home/VideoBlock';

export default async function HomePage() {
  const [categories, bestsellers, newLaunches, under499] = await Promise.all([
    catalogRepository.getCategories(),
    catalogRepository.getFeaturedProducts('bestseller'),
    catalogRepository.getFeaturedProducts('new'),
    catalogRepository.getFeaturedProducts('under499'),
  ]);

  return (
    <main className="w-full">
      {/* 1. Hero Carousel */}
      <HeroCarousel />

      {/* 2. Category Navigation Tiles */}
      <CategoryTiles categories={categories} />

      {/* 3. Bestsellers Rail */}
      <ProductRail
        title="Cult Bestsellers"
        subtitle="Our most celebrated formulas loved by over 50,000 beauty enthusiasts."
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

      {/* 5. New Launches Rail */}
      <ProductRail
        title="Just Launched"
        subtitle="Fresh drops, breakthrough textures, and newly engineered seasonal shades."
        products={newLaunches}
        viewAllHref="/shop/all?badge=new"
        viewAllLabel="Shop New Arrivals"
        limit={4}
      />

      {/* 6. Signature Masterclass Video Tutorials */}
      <VideoBlock />

      {/* 7. Under ৳499 Value Rail */}
      <ProductRail
        title="Under ৳499 Essentials"
        subtitle="High-impact beauty that fits everyday vanity routines without compromise."
        products={under499}
        viewAllHref="/shop/under499"
        viewAllLabel="Shop Under ৳499"
        limit={4}
      />

      {/* 8. Founder's Note & Clean Formulation Ethos */}
      <FounderNote />
    </main>
  );
}
