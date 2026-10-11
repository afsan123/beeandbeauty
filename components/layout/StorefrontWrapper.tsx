'use client';

import React from 'react';
import { usePathname } from 'next/navigation.js';
import { Header } from './Header.tsx';
import { Footer } from './Footer.tsx';
import { CartDrawer } from '../cart/CartDrawer.tsx';
import { BackToTop } from './BackToTop.tsx';
import { FloatingWhatsApp } from '../ui/FloatingWhatsApp.tsx';

export function StorefrontWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  if (isAdmin) {
    return <div className="flex-1 w-full min-h-screen">{children}</div>;
  }

  return (
    <>
      <Header />
      <CartDrawer />
      <div className="flex-1 w-full">{children}</div>
      <Footer />
      <BackToTop />
      <FloatingWhatsApp />
    </>
  );
}
