export type GuideCategory = 'SpeedSuits' | 'Compression Wear' | 'Performance Fabrics' | 'Recovery' | 'Buying Guides' | 'Athlete Education' | 'Product Care';

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: GuideCategory;
  author: string;
  reviewer?: string;
  readingTime: string;
  lastUpdated: string;
  heroImage: string;
  relatedSlugs: string[];
}

export const guides: Guide[] = [
  {
    slug: 'compression-shirt-guide',
    title: 'Compression Shirt Guide',
    description: 'Learn how compression shirts work, their benefits, and how to choose the right fit for your training.',
    category: 'Compression Wear',
    author: 'Deer',
    reviewer: 'Aritra Sharma',
    readingTime: '4 min read',
    lastUpdated: '2026-06-15',
    heroImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200',
    relatedSlugs: ['compression-vs-regular-gym-wear', 'recovery-clothing-guide']
  },
  {
    slug: 'compression-vs-regular-gym-wear',
    title: 'Compression vs Regular Gym Wear',
    description: 'Understand the key differences between compression gear and standard gym clothing.',
    category: 'Compression Wear',
    author: 'Deer',
    reviewer: 'Ayushman Haldar',
    readingTime: '5 min read',
    lastUpdated: '2026-06-10',
    heroImage: 'https://images.unsplash.com/photo-1522898467493-49726bf28798?q=80&w=1200',
    relatedSlugs: ['compression-shirt-guide', 'how-to-choose-gym-clothing']
  },
  {
    slug: 'how-to-choose-gym-clothing',
    title: 'How to Choose Gym Clothing',
    description: 'A comprehensive guide on selecting the right activewear based on your workout type and environment.',
    category: 'Buying Guides',
    author: 'Abir Dey',
    readingTime: '6 min read',
    lastUpdated: '2026-05-20',
    heroImage: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1200',
    relatedSlugs: ['gym-clothing-buying-guide', 'workout-clothing-guide']
  },
  {
    slug: 'moisture-wicking-fabric-explained',
    title: 'Moisture-Wicking Fabric Explained',
    description: 'Discover the science behind hydrophobic fabrics and how they keep you cool during intense workouts.',
    category: 'Performance Fabrics',
    author: 'Aritra Sharma',
    readingTime: '5 min read',
    lastUpdated: '2026-06-05',
    heroImage: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1200',
    relatedSlugs: ['athletic-apparel-materials', 'heat-management-activewear']
  },
  {
    slug: 'best-clothing-for-running',
    title: 'Best Clothing for Running',
    description: 'Optimize your running performance with the right aerodynamic and breathable apparel.',
    category: 'Athlete Education',
    author: 'Deer',
    readingTime: '4 min read',
    lastUpdated: '2026-06-12',
    heroImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1200',
    relatedSlugs: ['how-to-layer-gym-clothes']
  },
  {
    slug: 'workout-clothing-guide',
    title: 'Workout Clothing Guide',
    description: 'An essential overview of the best clothing choices for various fitness regimens.',
    category: 'Buying Guides',
    author: 'Abir Dey',
    readingTime: '5 min read',
    lastUpdated: '2026-05-18',
    heroImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200',
    relatedSlugs: ['gym-clothing-buying-guide', 'how-to-choose-gym-clothing']
  },
  {
    slug: 'recovery-clothing-guide',
    title: 'Recovery Clothing Guide',
    description: 'How specialized clothing can aid in muscle recovery post-workout.',
    category: 'Recovery',
    author: 'Deer',
    readingTime: '4 min read',
    lastUpdated: '2026-04-22',
    heroImage: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1200',
    relatedSlugs: ['compression-shirt-guide']
  },
  {
    slug: 'athletic-apparel-materials',
    title: 'Athletic Apparel Materials',
    description: 'A deep dive into the specific fabrics and blends that make up premium sportswear.',
    category: 'Performance Fabrics',
    author: 'Aritra Sharma',
    readingTime: '7 min read',
    lastUpdated: '2026-05-30',
    heroImage: 'https://images.unsplash.com/photo-1618220179428-22790b46a0eb?q=80&w=1200',
    relatedSlugs: ['moisture-wicking-fabric-explained', 'athletic-clothing-science']
  },
  {
    slug: 'size-guide',
    title: 'Size Guide',
    description: 'Ensure the perfect tailored fit with our detailed measurement and sizing instructions.',
    category: 'Buying Guides',
    author: 'Ayushman Haldar',
    readingTime: '3 min read',
    lastUpdated: '2026-07-01',
    heroImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200',
    relatedSlugs: ['how-to-choose-gym-clothing']
  },
  {
    slug: 'care-guide',
    title: 'Care Guide',
    description: 'Keep your activewear looking and performing like new with these essential washing and care tips.',
    category: 'Product Care',
    author: 'Ayushman Haldar',
    readingTime: '4 min read',
    lastUpdated: '2026-07-05',
    heroImage: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=1200',
    relatedSlugs: ['athletic-apparel-materials']
  },
  {
    slug: 'sweat-management-guide',
    title: 'Sweat Management Guide',
    description: 'Learn advanced techniques and apparel choices to manage heavy sweating during intense workouts.',
    category: 'Performance Fabrics',
    author: 'Deer',
    readingTime: '5 min read',
    lastUpdated: '2026-06-25',
    heroImage: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200',
    relatedSlugs: ['moisture-wicking-fabric-explained', 'heat-management-activewear']
  },
  {
    slug: 'gym-clothing-buying-guide',
    title: 'Gym Clothing Buying Guide',
    description: 'The ultimate checklist and buying guide for building a high-performance activewear wardrobe.',
    category: 'Buying Guides',
    author: 'Abir Dey',
    readingTime: '8 min read',
    lastUpdated: '2026-06-01',
    heroImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200',
    relatedSlugs: ['workout-clothing-guide']
  },
  {
    slug: 'heat-management-activewear',
    title: 'Heat Management in Activewear',
    description: 'How specialized cooling fabrics and micro-ventilation systems prevent overheating in hot climates.',
    category: 'Performance Fabrics',
    author: 'Aritra Sharma',
    readingTime: '6 min read',
    lastUpdated: '2026-05-15',
    heroImage: 'https://images.unsplash.com/photo-1507398941214-572c25f4b1dc?q=80&w=1200',
    relatedSlugs: ['sweat-management-guide', 'moisture-wicking-fabric-explained']
  },
  {
    slug: 'athletic-clothing-science',
    title: 'Athletic Clothing Science',
    description: 'Explore the biomechanics and material engineering behind modern luxury sportswear.',
    category: 'Athlete Education',
    author: 'Deer',
    readingTime: '7 min read',
    lastUpdated: '2026-04-10',
    heroImage: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1200',
    relatedSlugs: ['athletic-apparel-materials']
  },
  {
    slug: 'how-to-layer-gym-clothes',
    title: 'How to Layer Gym Clothes',
    description: 'Master the art of layering activewear for optimal temperature regulation across all seasons.',
    category: 'Buying Guides',
    author: 'Abir Dey',
    readingTime: '5 min read',
    lastUpdated: '2026-03-20',
    heroImage: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=1200',
    relatedSlugs: ['best-clothing-for-running']
  }
];
