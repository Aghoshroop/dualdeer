import HeroSection from "@/components/sections/HeroSection";
import SeoIntroBlock from "@/components/sections/SeoIntroBlock";
import EditorialSplit from "@/components/sections/EditorialSplit";
import ProductGrid from "@/components/sections/ProductGrid";
import BrandStory from "@/components/sections/BrandStory";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import React from "react";
import Link from 'next/link';
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

      {/* Signature Product Emphasis */}
      <section style={{ padding: '6rem 2rem', textAlign: 'center', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'var(--font-logo), serif', fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--color-text)' }}>
            Signature Product: SpeedSuit
          </h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.6 }}>
            Engineered for elite athletic performance and unparalleled aerodynamics. Experience the absolute pinnacle of luxury training gear.
          </p>
          <Link href="/shop?category=speedsuit" style={{ 
            display: 'inline-block', padding: '1rem 3rem', background: 'var(--color-foreground)', 
            color: 'var(--color-background)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', borderRadius: '30px'
          }}>
            Explore SpeedSuit Collection
          </Link>
        </div>
      </section>
      
      <SeoIntroBlock
        h1="Best Premium Activewear & Luxury Athleisure Brand in India"
        h2="Engineered for Elite Performance and Contemporary Style"
        image="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop"
        paragraphs={[
          <React.Fragment key="1">
            Welcome to DualDeer, the definitive destination for <Link href="/shop" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>premium activewear</Link> and high-end athleisure in India. Built upon a foundation of relentless innovation and an unwavering commitment to excellence, our brand is fundamentally redefining what it means to dress for performance, featuring our signature <Link href="/shop?category=speedsuit" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>SpeedSuit collection</Link>. Our meticulously crafted gym apparel and streetwear don&apos;t just follow fleeting trends; they set rigorous new standards by seamlessly blending cutting-edge fabric technology with an avant-garde aesthetic that commands attention both inside and outside the gym.
          </React.Fragment>,
          <React.Fragment key="2">
            Whether you are an elite athlete training for peak physical supremacy, or a modern professional seeking sophisticated and resilient comfort for your dynamic everyday life, our advanced collections bridge the critical gap between unmatched athletic performance and unparalleled luxury contemporary style. Every single garment at DualDeer is engineered with a strict purpose. We consistently integrate proprietary moisture-wicking materials and advanced four-way stretch fabrics that move instinctively and flawlessly in tandem with your body&apos;s natural biomechanics.
          </React.Fragment>,
          <React.Fragment key="3">
            Our signature pieces feature seamless, chafe-free construction alongside intelligent, targeted compression zones intended for superior muscle stabilization and recovery. The aerodynamic, flattering silhouettes are built exclusively for the modern discerning individual. <Link href="/speedsuit" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>Discover the best SpeedSuits in India</Link> and see how we continuously redefine the extreme boundaries of intense workout gear. By deploying state-of-the-art climate control technology directly into our exclusive weaves, our garments naturally and efficiently regulate your core body temperature during the most grueling conditions.
          </React.Fragment>,
          <React.Fragment key="4">
            Furthermore, our overarching brand philosophy operates under the core belief that authentic performance wear should never compromise on visual design. A sophisticated luxury training wardrobe is an essential investment in your enduring personal goals and long-term physical well-being. We invite you to experience the transformative power of elite athleisure that responds intuitively to your intense movement, rigid structural support requirements, and critical breathability needs. Elevate your daily routine with unparalleled pieces that inspire unwavering confidence, foster immense physical resilience, and make you look as exceptionally powerful as you feel. Let DualDeer be the cornerstone for those who simply refuse to ever settle for the ordinary.
          </React.Fragment>
        ]}
      />

      <EditorialSplit />
      <ProductGrid title="The Spring Collection" />
      <BrandStory />
      <FeaturedProducts />
      <TestimonialSlider />
    </main>
  );
}
