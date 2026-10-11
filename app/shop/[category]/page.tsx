import React from 'react';
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

export default async function ShopCategoryPage({ params }: ShopPageProps) {
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
    <main>
      <ShopClient
        initialCategory={currentCategory}
        allCategories={categories}
        allProducts={allProducts}
        categorySlug={categorySlug}
      />
    </main>
  );
}
