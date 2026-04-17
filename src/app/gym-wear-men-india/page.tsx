import { getProducts } from '@/lib/firebaseUtils';
import { serializeProduct } from '@/lib/serialize';
import GymWearClient from './GymWearClient';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Gym Wear For Men in India (2026) | Premium Activewear | DualDeer',
  description: 'Shop the finest high-performance gym wear for men in India. Discover elite compression, moisture-wicking shirts, and luxury athleisure by DualDeer.',
  alternates: {
    canonical: 'https://dualdeer.com/gym-wear-men-india',
  },
  openGraph: {
    title: 'Premium Gym Wear For Men in India – DualDeer',
    description: 'Elite workout clothing, compression gear, and activewear for men.',
    url: 'https://dualdeer.com/gym-wear-men-india',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-gym-wear.jpg',
        width: 1200,
        height: 630,
        alt: 'Gym Wear Men India'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function GymWearMenIndiaPage() {
  const allProducts = await getProducts();
  const gymWear = allProducts.filter(
    (p) =>
      p.category?.toLowerCase() === "tshirt" ||
      p.category?.toLowerCase() === "bottoms" ||
      p.category?.toLowerCase() === "speedsuit" ||
      ((p as any).tags || []).some((t: string) => t.toLowerCase().includes("gym"))
  ).slice(0, 12);

  return (
    <>
      <GymWearClient initialProducts={gymWear?.map(serializeProduct) ?? []} />
    </>
  );
}
