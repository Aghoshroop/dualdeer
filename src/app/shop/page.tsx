import { getProducts, getCategories, getContentBlock } from '@/lib/firebaseUtils';
import { serializeProduct, serializeCategory } from '@/lib/serialize';
import ShopClient from './ShopClient';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Luxury Activewear Store (2026) | Premium Collections | DualDeer',
  description: 'Shop the complete collection of DualDeer luxury activewear. Find premium speedsuits, compression t-shirts, and elite athletic wear for peak performance.',
  alternates: {
    canonical: 'https://dualdeer.com/shop',
  },
  openGraph: {
    title: 'DualDeer Luxury Activewear Store',
    description: 'Shop the complete collection of DualDeer luxury activewear for peak athletic performance.',
    url: 'https://dualdeer.com/shop',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-shop.jpg',
        width: 1200,
        height: 630,
        alt: 'DualDeer Shop Collection'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function ShopPage() {
  const [products, categories, backdropContent, heroContent] = await Promise.all([
    getProducts(),
    getCategories(),
    getContentBlock('shop-backdrop'),
    getContentBlock('shop-hero')
  ]);

  const liveCategories = categories.filter(c => c.status === 'active');
  
  return (
    <ShopClient 
      initialProducts={products?.map(serializeProduct) ?? []} 
      initialCategories={liveCategories?.map(serializeCategory) ?? []} 
      initialBackdrop={backdropContent?.imageUrl || ''}
      initialHeroUrl={heroContent?.imageUrl || ''}
      initialHeroText={heroContent?.title || ''}
    />
  );
}
