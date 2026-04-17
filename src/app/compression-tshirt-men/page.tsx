import type { Metadata } from 'next';
import { getProducts } from '@/lib/firebaseUtils';
import { serializeProduct } from '@/lib/serialize';
import CompressionClient from './CompressionClient';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Best Compression T-Shirt for Men in India (2026) – Gym & Workout Wear | DualDeer',
  description: 'Looking for the best compression t-shirt for men in India? Shop breathable, sweat-wicking gym wear designed for performance, comfort, and faster recovery.',
  alternates: {
    canonical: 'https://dualdeer.com/compression-tshirt-men',
  },
  openGraph: {
    title: 'Best Compression T-Shirts for Men in India – DualDeer',
    description: 'Premium compression wear for gym performance and recovery.',
    url: 'https://dualdeer.com/compression-tshirt-men',
    siteName: 'DualDeer',
    images: [
      {
        url: 'https://dualdeer.com/og-compression.jpg',
        width: 1200,
        height: 630,
        alt: 'Compression T-Shirt Men India'
      }
    ],
    type: 'website'
  },
  robots: {
    index: true,
    follow: true
  }
};

export default async function CompressionTshirtMenPage() {
  const allProducts = await getProducts();
  const compressionWear = allProducts.filter(
    (p) =>
      p.category?.toLowerCase() === "tshirt" ||
      p.category?.toLowerCase() === "speedsuit" ||
      p.name.toLowerCase().includes("compression") ||
      ((p as any).tags || []).some((t: string) => t.toLowerCase().includes("compression"))
  ).slice(0, 12);

  return (
    <>
      <CompressionClient initialProducts={compressionWear?.map(serializeProduct) ?? []} />
    </>
  );
}