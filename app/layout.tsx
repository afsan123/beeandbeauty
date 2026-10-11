import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '../store/cart.tsx';
import { WishlistProvider } from '../store/wishlist.tsx';
import { StorefrontWrapper } from '../components/layout/StorefrontWrapper.tsx';


export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#6A1B6D',
};

export const metadata: Metadata = {
  title: 'Bee & Beauty | Nature, refined. | Luxury Cosmetics & Skincare Bangladesh',
  description:
    'Bee & Beauty offers nature-refined luxury cosmetics, skincare-infused velvet formulas, and radiant beauty essentials in Bangladesh. Inside Dhaka 24h & outside Dhaka 48h delivery.',
  keywords: [
    'Bee & Beauty',
    'Bee and Beauty',
    'Nature refined',
    'cosmetics Bangladesh',
    'luxury makeup Dhaka',
    'velvet matte lipstick',
    'clean skincare Bangladesh',
    'bKash cosmetics',
    'Cash on delivery beauty',
  ],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  other: {
    'darkreader-lock': 'true',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="darkreader-lock" content="true" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Karla:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-screen flex flex-col bg-[#FFF9F5] text-[#2C2C2C] antialiased selection:bg-[#C2188B]/20 selection:text-[#6A1B6D] font-sans"
      >
        <CartProvider>
          <WishlistProvider>
            <StorefrontWrapper>{children}</StorefrontWrapper>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
