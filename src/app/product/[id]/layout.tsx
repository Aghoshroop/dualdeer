import { Metadata, ResolvingMetadata } from 'next';
import { getProduct } from '@/lib/firebaseUtils';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const p = await params;
  const product = await getProduct(p.id);

  if (!product) {
    return {
      title: 'Product Not Found | DualDeer',
      description: 'The requested luxury activewear item could not be found.',
    };
  }

  return {
    title: `${product.name} SpeedSuit | Buy Online in India | DualDeer`,
    description: product.description || `Buy the highly-acclaimed ${product.name} SpeedSuit exclusively from DualDeer. Premium athletic apparel.`,
    keywords: [product.name, 'SpeedSuit', 'buy activewear online', 'DualDeer', product.category, product.subcategory].filter(Boolean) as string[],
    openGraph: {
      title: `${product.name} SpeedSuit | DualDeer`,
      description: product.description || `Explore the ${product.name} from DualDeer's highly acclaimed activewear collection.`,
      url: `https://dualdeer.com/product/${p.id}`,
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
      title: `${product.name} SpeedSuit | DualDeer Activewear`,
      description: product.description,
      images: [product.image],
    },
    alternates: {
      canonical: `/product/${p.id}`,
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
