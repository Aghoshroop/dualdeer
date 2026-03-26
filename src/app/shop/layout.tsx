import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop All | DualDeer Activewear',
  description: 'Browse the complete collection of DualDeer premium activewear, luxury athleisure, and performance menswear. Discover exclusive drops, best sellers, and aesthetic gym apparel.',
  // Using extensive keywords to dominate activewear search
  keywords: [
    'mens activewear shop', 'luxury gym clothes online', 'buy premium athleisure',
    'high end workout gear', 'aesthetic bodybuilding clothes', 'streetwear gym wear',
    'DualDeer collection', 'mens performance apparel', 'luxury sportswear catalogue'
  ],
  openGraph: {
    title: 'Shop DualDeer | Luxury Activewear & Athleisure',
    description: 'Explore the latest in high-performance luxury menswear. Elevate your training with DualDeer.',
    url: 'https://dualdeer.com/shop',
    type: 'website',
  },
  alternates: {
    canonical: '/shop',
  }
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  // Pass-through wrapper, purely injecting server-side SEO into the <head>
  return <>{children}</>;
}
