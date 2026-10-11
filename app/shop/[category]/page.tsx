import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { catalogRepository } from '../../../data/mock/mockRepository';
import { ShopClient } from '../../../components/catalog/ShopClient';

interface ShopPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  const categories = await catalogRepository.getCategories();
  return [
    { category: 'all' },
    { category: 'under499' },
    ...categories.map((c) => ({ category: c.slug })),
  ];
}

export async function generateMetadata({ params }: ShopPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  if (categorySlug === 'all') {
    return {
      title: 'All Cosmetics | Bee&Beauty',
      description: 'Explore the full Bee&Beauty luxury cosmetics collection.',
    };
  }
  if (categorySlug === 'under499') {
    return {
      title: 'Under ৳499 Value Store | Bee&Beauty',
      description: 'Affordable everyday makeup staples under ৳499 by Bee&Beauty.',
    };
  }
  const category = await catalogRepository.getCategoryBySlug(categorySlug);
  if (!category) {
    return {
      title: 'Collection | Bee&Beauty',
    };
  }
  return {
    title: `${category.name} | Bee&Beauty Cosmetics`,
    description: category.description,
  };
}

async function ShopCategoryContent({ params }: ShopPageProps) {
  const { category: categorySlug } = await params;

  const [categories, allProducts] = await Promise.all([
    catalogRepository.getCategories(),
    catalogRepository.getProducts(),
  ]);

  let currentCategory = null;
  if (categorySlug !== 'all' && categorySlug !== 'under499') {
    currentCategory = await catalogRepository.getCategoryBySlug(categorySlug);
    if (!currentCategory) {
      notFound();
    }
  }

  return (
    <ShopClient
      initialCategory={currentCategory}
      allCategories={categories}
      allProducts={allProducts}
      categorySlug={categorySlug}
    />
  );
}

function ShopCategorySkeleton() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-4 w-32 bg-[#F0E6DD] rounded mb-3" />
        <div className="h-8 w-64 bg-[#F0E6DD] rounded mb-2" />
        <div className="h-4 w-96 max-w-full bg-[#F0E6DD] rounded" />
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-[#F0E6DD]/60">
            <div className="aspect-square bg-[#F5ECE5] rounded-md mb-3" />
            <div className="h-3 w-16 bg-[#F0E6DD] rounded mb-2" />
            <div className="h-4 w-3/4 bg-[#F0E6DD] rounded mb-2" />
            <div className="h-4 w-1/3 bg-[#F0E6DD] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ShopCategoryPage({ params }: ShopPageProps) {
  return (
    <main>
      <Suspense fallback={<ShopCategorySkeleton />}>
        <ShopCategoryContent params={params} />
      </Suspense>
    </main>
  );
}
