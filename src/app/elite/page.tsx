import { getProducts, getCategories, getEliteHeroSettings, getEliteSplashSettings } from '@/lib/firebaseUtils';
import { serializeProduct, serializeCategory, deepSerialize } from '@/lib/serialize';
import EliteClient from './EliteClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Elite Luxury Activewear | DualDeer',
  description: 'Shop the most premium and exclusive collection of DualDeer luxury activewear.',
  alternates: {
    canonical: 'https://dualdeer.com/elite',
  },
  openGraph: {
    title: 'DualDeer Elite Luxury Activewear',
    description: 'Shop the most premium and exclusive collection of DualDeer luxury activewear.',
    url: 'https://dualdeer.com/elite',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-elite.jpg',
        width: 1200,
        height: 630,
        alt: 'DualDeer Elite Collection'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function ElitePage() {
  const [products, categories, eliteHeroSettings, eliteSplashSettings] = await Promise.all([
    getProducts(),
    getCategories(),
    getEliteHeroSettings(),
    getEliteSplashSettings()
  ]);

  const liveCategories = categories.filter(c => c.status === 'active');
  
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Elite Luxury Activewear | DualDeer",
    "description": "Shop the most premium and exclusive collection of DualDeer luxury activewear.",
    "url": "https://dualdeer.com/elite",
    "isPartOf": {
      "@type": "WebSite",
      "name": "DualDeer",
      "url": "https://dualdeer.com/"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <EliteClient 
        initialProducts={products?.map(serializeProduct) ?? []} 
        initialCategories={liveCategories?.map(serializeCategory) ?? []} 
        initialHeroSettings={deepSerialize(eliteHeroSettings)}
        initialSplashSettings={deepSerialize(eliteSplashSettings)}
      />
    </>
  );
}
