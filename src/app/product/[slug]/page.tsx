import { getProductBySlug, getProduct, getReviews } from '@/lib/firebaseUtils';
import { serializeProduct, serializeReview } from '@/lib/serialize';
import { redirect, permanentRedirect } from 'next/navigation';
import ProductClient from '@/components/product/ProductClient';
import type { Metadata } from 'next';

export const revalidate = 60; // SSG with ISR revalidation

// Fallback generateStaticParams (Wait, firebase client sdk in build time might need configuration)
// If not using generateStaticParams, it will server side render on demand and then cache it because of the revalidate.

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { slug } = params;
  
  let product = await getProductBySlug(slug);
  if (!product) {
    product = await getProduct(slug); // fallback for ID
  }
  
  if (!product) {
    return {
      title: 'Product Not Found | DualDeer',
    };
  }

  return {
    title: `${product.name} | DualDeer High-Performance Activewear`,
    description: product.description || `Buy ${product.name} at DualDeer. Premium athletic and activewear tailored for elite performance.`,
    alternates: {
      canonical: `https://dualdeer.com/product/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | DualDeer`,
      description: product.description || `Buy ${product.name} at DualDeer. Premium athletic wear.`,
      url: `https://dualdeer.com/product/${product.slug}`,
      siteName: 'DualDeer',
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    robots: {
      index: true,
      follow: true
    }
  };
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  let product = await getProductBySlug(slug);
  let isRedirectingId = false;

  if (!product) {
    product = await getProduct(slug);
    if (product) {
      if (product.slug && product.slug !== slug) {
        permanentRedirect(`/product/${product.slug}`);
      }
      // If we found it by ID but it has no slug, we just render it with ID for backward compatibility until migrated.
    }
  }

  if (!product) {
    return (
      <div style={{ display: 'flex', minHeight: '60vh', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Product not found or has been removed.</h2>
      </div>
    );
  }

  // Fetch reviews SSR
  const reviews = await getReviews(product.id as string);
  const safeReviews = reviews?.map(serializeReview) ?? [];

  // Construct FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What makes the ${product.name} suitable for high-intensity training?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The ${product.name} is engineered with DualDeer's proprietary four-way kinetic stretch fabric, offering aerodynamic efficiency and advanced moisture-wicking capabilities designed specifically for high-intensity athletic performance.`
        }
      },
      {
        "@type": "Question",
        "name": `How do I wash the DualDeer ${product.name}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `To maintain the premium elasticity and hydrophobic properties of your ${product.name}, machine wash cold with similar colors. Do not use fabric softeners or bleach, and always tumble dry on low or air dry.`
        }
      },
      {
        "@type": "Question",
        "name": `Is the ${product.name} true to size?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Yes, our performance wear utilizes an ergonomic, body-mapped compression fit. If you prefer a more relaxed fit for casual gym wear, we recommend sizing up.`
        }
      }
    ]
  };

  // Construct Product Schema
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.images && product.images.length > 0 ? product.images : [product.image],
    "description": product.description || `Premium ${product.category} engineered for elite performance.`,
    "sku": `DUALDEER-${product.id?.substring(0,8).toUpperCase()}`,
    "brand": {
      "@type": "Brand",
      "name": "DualDeer"
    },
    "offers": {
      "@type": "Offer",
      "url": `https://dualdeer.com/product/${product.slug}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "DualDeer Activewear"
      }
    }
  };

  if (safeReviews && safeReviews.length > 0) {
    (productSchema as any).aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": Number((safeReviews.reduce((acc, r) => acc + r.rating, 0) / safeReviews.length).toFixed(1)),
      "reviewCount": safeReviews.length
    };
    (productSchema as any).review = safeReviews.slice(0, 5).map(rev => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": rev.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": rev.userName || "Verified Buyer"
      },
      "reviewBody": rev.text || `Excellent ${product.name}`,
    }));
  }

  // Construct Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://dualdeer.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Shop",
        "item": "https://dualdeer.com/shop"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.category || "Products",
        "item": `https://dualdeer.com/shop?category=${encodeURIComponent(product.category || '')}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": product.name,
        "item": `https://dualdeer.com/product/${product.slug}`
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <ProductClient initialProduct={serializeProduct(product)} initialReviews={safeReviews} />
    </>
  );
}
