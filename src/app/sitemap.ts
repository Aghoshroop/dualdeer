import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/firebaseUtils';
import { guides } from './learn/guidesData';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Sitemap generation error fetching products:", error);
  }
  
  const productUrls: MetadataRoute.Sitemap = products
    .filter(product => product.slug)
    .map((product) => {
      let lastMod = new Date();
      if ((product as any).updatedAt) {
        lastMod = new Date(((product as any).updatedAt).toMillis ? ((product as any).updatedAt).toMillis() : (product as any).updatedAt);
      } else if (product.createdAt) {
        lastMod = new Date((product.createdAt as any).toMillis ? (product.createdAt as any).toMillis() : product.createdAt);
      }

      return {
        url: `https://dualdeer.com/product/${product.slug}`,
        lastModified: lastMod,
        changeFrequency: 'weekly',
        priority: 0.9,
      };
    });

  return [
    {
      url: 'https://dualdeer.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: 'https://dualdeer.com/shop',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: 'https://dualdeer.com/gym-wear-men-india',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://dualdeer.com/compression-tshirt-men',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://dualdeer.com/best-gym-clothes-india',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://dualdeer.com/speedsuits-india',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: 'https://dualdeer.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://dualdeer.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://dualdeer.com/learn',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    ...guides.map(guide => ({
      url: `https://dualdeer.com/learn/${guide.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    })),
    // Policies
    {
      url: 'https://dualdeer.com/policies/shipping',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://dualdeer.com/policies/returns',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://dualdeer.com/policies/privacy',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: 'https://dualdeer.com/policies/terms',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    ...productUrls,
  ];
}
