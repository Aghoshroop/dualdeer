export interface TrustPage {
  slug: string;
  title: string;
  description: string;
  icon?: string;
  category: 'about' | 'manufacturing' | 'policies';
  lastUpdated: string;
}

export const trustPages: TrustPage[] = [
  {
    slug: 'mission-and-philosophy',
    title: 'Our Mission & Brand Philosophy',
    description: 'Why DualDeer exists and what we stand for in the athletic world.',
    category: 'about',
    lastUpdated: '2024-03-15'
  },
  {
    slug: 'fabric-development',
    title: 'Fabric Development & Technology',
    description: 'The science and engineering behind our proprietary performance fabrics.',
    category: 'manufacturing',
    lastUpdated: '2024-02-28'
  },
  {
    slug: 'manufacturing-standards',
    title: 'Manufacturing & Ethical Standards',
    description: 'How and where we build our products, ensuring quality and fairness.',
    category: 'manufacturing',
    lastUpdated: '2024-01-10'
  },
  {
    slug: 'quality-control',
    title: 'Quality Control & Testing',
    description: 'Our rigorous athlete-testing process and durability standards.',
    category: 'manufacturing',
    lastUpdated: '2024-03-01'
  },
  {
    slug: 'care-instructions',
    title: 'Apparel Care Instructions',
    description: 'How to wash and maintain your gear to maximize its lifespan.',
    category: 'policies',
    lastUpdated: '2023-11-20'
  },
  {
    slug: 'warranty-and-returns',
    title: 'Warranty & Return Policy',
    description: 'Our commitment to your satisfaction and our streamlined return process.',
    category: 'policies',
    lastUpdated: '2024-02-05'
  },
  {
    slug: 'shipping-process',
    title: 'Shipping & Delivery',
    description: 'How we get your gear to you safely and efficiently.',
    category: 'policies',
    lastUpdated: '2024-01-15'
  }
];

export const getTrustPage = (slug: string) => trustPages.find(p => p.slug === slug);
