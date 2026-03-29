import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'High-Performance SpeedSuits in India | DualDeer',
  description: 'Shop luxury, high-performance compression SpeedSuits engineered for elite athletes in India. Discover unmatched aerodynamics, comfort, and premium design at DualDeer.',
  keywords: ['SpeedSuits India', 'DualDeer SpeedSuits', 'premium compression suit', 'luxury activewear', 'performance suit'],
  openGraph: {
    title: 'High-Performance SpeedSuits in India | DualDeer',
    description: 'Shop luxury, high-performance compression SpeedSuits engineered for elite athletes in India.',
    images: ['https://images.unsplash.com/photo-1549476464-37392f717541?q=80&w=1200'],
  }
};

export default function SpeedsuitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
