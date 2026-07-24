import React from "react";
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Critical rendering path components (above fold)
import HeroSection from "@/components/sections/HeroSection";
import TrustStrip from "@/components/sections/TrustStrip";

// Lazy-loaded components (below fold) to drastically reduce initial JS payload
const Cinematic3DSection = dynamic(() => import("@/components/sections/Cinematic3DSection"), { ssr: true });
const FeaturedProducts = dynamic(() => import("@/components/sections/FeaturedProducts"), { ssr: true });
const BrandStory = dynamic(() => import("@/components/sections/BrandStory"), { ssr: true });
const UpcomingProducts = dynamic(() => import("@/components/sections/UpcomingProducts"), { ssr: true });
const LeadershipSection = dynamic(() => import("@/components/sections/LeadershipSection"), { ssr: true });
const TestimonialSlider = dynamic(() => import("@/components/sections/TestimonialSlider"), { ssr: true });
const BrandIntroBlock = dynamic(() => import("@/components/sections/BrandIntroBlock"), { ssr: true });
const BrandFaqBlock = dynamic(() => import("@/components/sections/BrandFaqBlock"), { ssr: true });

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
      "addressLocality": "Kolkata",
      "addressRegion": "West Bengal",
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
      <div style={{ position: 'relative', zIndex: 1, backgroundColor: 'var(--color-background)' }}>
        <TrustStrip />

      <Cinematic3DSection />
      <FeaturedProducts />
      <BrandStory />
      <UpcomingProducts />
      <TestimonialSlider />

      {/* Brand Manifesto - Placed lower for pacing */}
      <div style={{ marginTop: '4rem', marginBottom: '2rem' }}>
        <BrandIntroBlock
          h1="The Best Gym Wear in Kolkata | DualDeer Elite"
          h2="Premium Activewear & The World's Best Fabrics"
          image="/speedsuitgang.jpeg"
          paragraphs={[
            <React.Fragment key="1">
              Welcome to DualDeer, widely recognized as the definitive destination for the <Link href="/shop" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>best activewear in Kolkata</Link>. Built upon a foundation of relentless innovation and an unwavering commitment to excellence, our brand is fundamentally redefining what it means to dress for performance. Featuring our exclusive <strong>Elite Collection</strong>, our meticulously crafted gym apparel and streetwear don't just follow fleeting trends; they set rigorous new standards by seamlessly blending the world's <strong>best fabrics</strong> with an avant-garde aesthetic that commands attention both inside and outside the gym.
            </React.Fragment>,
            <React.Fragment key="2">
              Whether you are an elite athlete training for peak physical supremacy, or a modern professional seeking the <Link href="/shop" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>best gym wears</Link> for your dynamic everyday life, our advanced collections bridge the critical gap between unmatched athletic performance and unparalleled luxury contemporary style. Every single garment at DualDeer is engineered with a strict purpose. We consistently integrate proprietary moisture-wicking materials and advanced four-way stretch fabrics that move instinctively and flawlessly in tandem with your body's natural biomechanics.
            </React.Fragment>,
            <React.Fragment key="3">
              Our signature pieces feature seamless, chafe-free construction alongside intelligent, targeted compression zones intended for superior muscle stabilization and recovery. The aerodynamic, flattering silhouettes are built exclusively for the modern discerning individual. <Link href="/speedsuit" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>Discover the best SpeedSuits in India</Link> and see how we continuously redefine the extreme boundaries of intense workout gear. By deploying state-of-the-art climate control technology directly into our exclusive weaves, our garments naturally and efficiently regulate your core body temperature during the most grueling conditions.
            </React.Fragment>,
            <React.Fragment key="4">
              Furthermore, our overarching brand philosophy operates under the core belief that authentic performance wear should never compromise on visual design. A sophisticated luxury training wardrobe is an essential investment in your enduring personal goals and long-term physical well-being. We invite you to experience the transformative power of elite athleisure that responds intuitively to your intense movement, rigid structural support requirements, and critical breathability needs. Elevate your daily routine with unparalleled pieces that inspire unwavering confidence, foster immense physical resilience, and make you look as exceptionally powerful as you feel. Let DualDeer be the cornerstone for those who simply refuse to ever settle for the ordinary.
            </React.Fragment>
          ]}
        >
          <LeadershipSection />
        </BrandIntroBlock>
      </div>
      
      <BrandFaqBlock />
      </div>
    </main>
  );
}
