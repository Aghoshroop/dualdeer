import type { Metadata } from 'next';
import { getProducts } from '@/lib/firebaseUtils';
import { serializeProduct } from '@/lib/serialize';
import BestGymClient from './BestGymClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Best Gym Clothes in India (2026) – Premium Workout Wear for Men | DualDeer',
  description: 'Looking for the best gym clothes in India? Discover premium compression wear, workout t-shirts, and high-performance activewear built for Indian athletes.',
  alternates: {
    canonical: 'https://dualdeer.com/best-gym-clothes-india',
  },
  openGraph: {
    title: 'Best Gym Clothes in India – DualDeer',
    description: 'Premium gym wear for men in India. Built for performance and comfort.',
    url: 'https://dualdeer.com/best-gym-clothes-india',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-gym-clothes.jpg',
        width: 1200,
        height: 630,
        alt: 'Best Gym Clothes India'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function BestGymClothesIndiaPage() {
  const allProducts = await getProducts();
  const topWear = allProducts.sort((a, b) => (b.rating || 5) - (a.rating || 5)).slice(0, 12);

  return (
    <>
      <BestGymClient initialProducts={topWear?.map(serializeProduct) ?? []} />
    </>
  );
}