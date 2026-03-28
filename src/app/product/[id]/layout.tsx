import { Metadata, ResolvingMetadata } from 'next';
import { getProduct } from '@/lib/firebaseUtils';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  props: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const params = await props.params;
  const product = await getProduct(params.id);

  if (!product) {
    return {
      title: 'Product Not Found | DualDeer',
      description: 'The requested luxury activewear item could not be found.',
    };
  }

  // Optimize title length and description for Google SERP
  const rawDescription = product.description || '';
  const metaDescription = rawDescription.length > 155 
    ? rawDescription.substring(0, 155) + '...' 
    : (rawDescription || `Explore the ${product.name} from DualDeer's highly acclaimed activewear collection.`);

  return {
    title: `${product.name} | DualDeer luxury activewear`,
    description: metaDescription,
    keywords: [
      product.name,
      product.category,
      product.subcategory || '',
      'luxury activewear',
      'DualDeer',
      'aesthetic gym wear',
      'mens premium sports clothing',
      'buy activewear online'
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} - Premium Performance Gear | DualDeer`,
      description: metaDescription,
      url: `https://dualdeer.com/product/${params.id}`,
      type: 'article',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: `${product.name} by DualDeer`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | DualDeer Activewear`,
      description: metaDescription,
      images: [product.image],
    },
    alternates: {
      canonical: `/product/${params.id}`,
    }
  };
}

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
