import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { catalogRepository } from '../../../data/mock/mockRepository';
import { ImageGallery } from '../../../components/product/ImageGallery';
import { ProductInfo } from '../../../components/product/ProductInfo';
import { OfferAccordion } from '../../../components/product/OfferAccordion';
import { RelatedProducts } from '../../../components/product/RelatedProducts';
import { ProductReviewsSection } from '../../../components/product/ProductReviewsSection';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const products = await catalogRepository.getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await catalogRepository.getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Bee&Beauty',
    };
  }

  return {
    title: `${product.title} - ${product.subtitle} | Bee&Beauty`,
    description: product.shortDescription,
    openGraph: {
      title: product.title,
      description: product.shortDescription,
    },
  };
}

async function ProductContent({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await catalogRepository.getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [offers, relatedProducts] = await Promise.all([
    catalogRepository.getOffers(),
    catalogRepository.getRelatedProducts(product.id, 4),
  ]);

  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* 2-Column PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        {/* Gallery column */}
        <div className="lg:col-span-6 lg:sticky lg:top-24">
          <ImageGallery
            images={[product.images.primary, ...product.images.gallery]}
            title={product.title}
            badges={product.badges}
          />
        </div>

        {/* Product Info & Offer Accordion column */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <ProductInfo product={product} />
          <OfferAccordion product={product} offers={offers} />
        </div>
      </div>

      {/* Related Products Recommendation Rail */}
      <RelatedProducts
        products={relatedProducts}
        title="Complete The Look"
        subtitle="Formulas paired by our beauty artists to complement this finish."
      />

      {/* Customer Reviews & Verified Buyer Ratings */}
      <ProductReviewsSection
        productId={product.id}
        productTitle={product.title}
        shades={product.shades}
      />
    </div>
  );
}

function ProductPageSkeleton() {
  return (
    <div className="max-w-[1360px] mx-auto px-4 md:px-8 py-8 md:py-12 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
        <div className="lg:col-span-6 aspect-square bg-[#F5ECE5] rounded-xl border border-[#F0E6DD]" />
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="h-4 w-24 bg-[#F0E6DD] rounded" />
          <div className="h-8 w-3/4 bg-[#F0E6DD] rounded" />
          <div className="h-6 w-1/3 bg-[#F0E6DD] rounded" />
          <div className="h-20 w-full bg-[#F5ECE5] rounded-lg mt-4" />
          <div className="h-12 w-full bg-[#F0E6DD] rounded-full mt-4" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <main>
      <Suspense fallback={<ProductPageSkeleton />}>
        <ProductContent params={params} />
      </Suspense>
    </main>
  );
}
