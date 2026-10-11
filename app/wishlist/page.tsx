import React from 'react';
import { Metadata } from 'next';
import { WishlistClient } from '../../components/wishlist/WishlistClient';

export const metadata: Metadata = {
  title: 'My Wishlist | Bee&Beauty',
  description: 'View and manage your saved Bee&Beauty luxury cosmetics.',
};

export default function WishlistPage() {
  return (
    <main>
      <WishlistClient />
    </main>
  );
}
