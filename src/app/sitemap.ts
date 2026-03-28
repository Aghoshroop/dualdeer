import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/firebaseUtils'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  try {
    products = await getProducts();
  } catch (error) {
    console.error("Sitemap generation error fetching products:", error);
  }
  
  const productUrls: MetadataRoute.Sitemap = products.map((product) => ({
    url: `https://dualdeer.com/product/${product.id}`,
    lastModified: product.createdAt ? new Date(product.createdAt.toMillis()) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

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
      priority: 0.9,
    },
    {
      url: 'https://dualdeer.com/collections',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://dualdeer.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: 'https://dualdeer.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...productUrls,
  ];
}
