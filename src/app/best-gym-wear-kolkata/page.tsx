import type { Metadata } from 'next';
import { getProducts } from '@/lib/firebaseUtils';
import { serializeProduct } from '@/lib/serialize';
import BestGymKolkataClient from './BestGymKolkataClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Best Gym Wear in Kolkata (2026) – Elite Activewear | DualDeer',
  description: 'Looking for the best gym wear in Kolkata? Discover DualDeer\'s Elite Collection featuring the world\'s best fabrics, compression wear, and luxury athletic gear.',
  alternates: {
    canonical: 'https://dualdeer.com/best-gym-wear-kolkata',
  },
  openGraph: {
    title: 'Best Gym Wear in Kolkata – DualDeer Elite',
    description: 'Premium elite gym wear in Kolkata. Built with the best fabrics for peak performance.',
    url: 'https://dualdeer.com/best-gym-wear-kolkata',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-gym-clothes.jpg',
        width: 1200,
        height: 630,
        alt: 'Best Gym Wear Kolkata'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function BestGymWearKolkataPage() {
  const allProducts = await getProducts();
  const topWear = allProducts.sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 12);

  return (
    <>
      <BestGymKolkataClient initialProducts={topWear?.map(serializeProduct) ?? []} />
    </>
  );
}
