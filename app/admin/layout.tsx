import React from 'react';
import type { Metadata } from 'next';
import { AdminLayoutClient } from './AdminLayoutClient.tsx';

export const instant = false;

export const metadata: Metadata = {
  title: 'Executive Admin Control | Bee & Beauty Bangladesh',
  description: 'Operations, inventory, orders, and fulfillment control center for Bee & Beauty.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
