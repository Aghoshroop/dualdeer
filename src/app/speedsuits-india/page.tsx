import { getProducts } from '@/lib/firebaseUtils';
import { serializeProduct } from '@/lib/serialize';
import SpeedSuitsIndiaClient from './SpeedsuitsClient';
import type { Metadata } from 'next';

export const revalidate = 3600; // SSG revalidate every hour

export const metadata: Metadata = {
  title: 'Premium Speedsuits in India (2026) | Elite Aerodynamic Gear | DualDeer',
  description: 'Shop the most elite, high-performance speedsuits in India. DualDeer compression wear engineered for aerodynamics and luxury aesthetics.',
  openGraph: {
    title: 'Premium Speedsuits in India | DualDeer',
    description: 'Shop elite high-performance speedsuits engineered for luxury and performance.',
    images: [
      {
        url: 'https://dualdeer.com/speedsuitgang.jpeg',
        width: 1200,
        height: 630,
        alt: 'SpeedSuits India'
      }
    ],
    url: 'https://dualdeer.com/speedsuits-india',
    siteName: 'DualDeer',
    type: 'website'
  },
  alternates: {
    canonical: 'https://dualdeer.com/speedsuits-india',
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function SpeedSuitsIndiaPage() {
  const allProducts = await getProducts();
  const speedsuits = allProducts.filter(
    (p) =>
      p.category?.toLowerCase() === "speedsuit" ||
      p.category?.toLowerCase() === "speedsuits" ||
      ((p as any).tags || []).some((t: string) => t.toLowerCase().includes("speedsuit"))
  );

  return (
    <>
      <SpeedSuitsIndiaClient initialProducts={speedsuits?.map(serializeProduct) ?? []} />
    </>
  );
}
