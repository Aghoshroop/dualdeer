import HeroSection from "@/components/sections/HeroSection";
import EditorialSplit from "@/components/sections/EditorialSplit";
import ProductGrid from "@/components/sections/ProductGrid";
import BrandStory from "@/components/sections/BrandStory";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import FeaturedProducts from "@/components/sections/FeaturedProducts";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DualDeer | Premium Activewear & Luxury Athleisure",
  description: "Shop DualDeer for exclusive luxury activewear, premium gym apparel, and high-performance streetwear designed specifically for the relentless and the elite.",
  keywords: [
    "DualDeer", "premium activewear", "luxury athleisure", "best activewear brand", "high-end fitness apparel", "luxury gym clothes"
  ],
  alternates: {
    canonical: "https://dualdeer.com",
  }
};

export default function Home() {
  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    "name": "DualDeer",
    "image": "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=1200",
    "description": "Premium luxury athleisure, activewear, and performance menswear.",
    "url": "https://dualdeer.com",
    "priceRange": "$$$",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "IN"
    }
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DualDeer",
    "url": "https://dualdeer.com/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://dualdeer.com/shop?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }} />
      <HeroSection />
      <EditorialSplit />
      <ProductGrid title="The Spring Collection" />
      <BrandStory />
      <FeaturedProducts />
      <TestimonialSlider />
    </main>
  );
}
