import { Metadata } from 'next';
import LearnHub from './LearnHub';

export const metadata: Metadata = {
  title: 'Knowledge Center & Guides | DualDeer',
  description: 'Explore comprehensive guides on athletic apparel, moisture-wicking fabrics, compression wear, and sizing from DualDeer.',
  alternates: {
    canonical: 'https://dualdeer.com/learn',
  },
  openGraph: {
    title: 'Knowledge Center & Guides | DualDeer',
    description: 'Explore comprehensive guides on athletic apparel, moisture-wicking fabrics, compression wear, and sizing from DualDeer.',
    url: 'https://dualdeer.com/learn',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true
  }
};

export default function LearnIndexPage() {
  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <LearnHub />
    </main>
  );
}
