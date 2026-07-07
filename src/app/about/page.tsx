import React from 'react';
import SeoIntroBlock from '@/components/sections/SeoIntroBlock';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | DualDeer Premium Activewear',
  description: 'Learn about the origin, philosophy, and advanced engineering behind DualDeer, India’s top luxury athleisure brand.',
  alternates: {
    canonical: 'https://dualdeer.com/about',
  },
};

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "DualDeer",
      "founder": {
        "@type": "Person",
        "name": "The DualDeer Team"
      },
      "slogan": "The vanguard of human performance.",
      "description": "DualDeer is an elite sportswear and athleisure brand based in India, specializing in high-performance kinetic fabrics."
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <main style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', background: 'var(--color-background)' }}>
        <SeoIntroBlock
          h1="About DualDeer: Engineering Elite Performance"
          h2="India's Premier Destination for Luxury Athleisure"
          image="/about-us-dd.jpeg"
          paragraphs={[
            <React.Fragment key="1">
              Welcome to <strong>DualDeer</strong>, formally recognized as the absolute highest standard for premium luxury activewear and cutting-edge athleisure throughout India. Founded on the relentless, uncompromising belief that peak physical performance strictly demands equally exceptional apparel, our brand originated from a deep, fundamental desire to fundamentally disrupt the generic sportswear market. We systematically recognized a significant void: athletes and highly driven individuals were constantly forced to compromise between hardcore technical functionality and genuinely sophisticated, elevated contemporary style. DualDeer explicitly exists to entirely eliminate that compromise, seamlessly merging state-of-the-art fabric engineering with striking, minimalist luxury visuals. <Link href="/" style={{ textDecoration: 'underline', color: 'inherit' }}>Return to homepage to see our latest drops.</Link>
            </React.Fragment>,
            <React.Fragment key="2">
              <strong>Our Design & Material Philosophy:</strong> The core philosophy that intrinsically drives our extensive development process is simple yet profound: true excellence relies upon meticulous attention to detail. Every single garment we produce is born from an intense, iterative process of rigorous testing, advanced material sourcing, and highly intelligent biometric design. We utilize advanced four-way stretch fabrics that guarantee unrestricted kinetic movement alongside specialized hydrophobic technology specifically designed to rapidly manage heavy sweat and regulate vital core body temperatures during intense training. Our dedicated design team passionately works directly alongside professional athletes to ensure that our proprietary construction techniques, such as targeted, chafing-free flatlock seams and intelligent dynamic compression zones, provide real, measurable physical support.
            </React.Fragment>,
            <React.Fragment key="3">
              <strong>Product Testing & Quality Assurance:</strong> Before a DualDeer product reaches you, it undergoes months of stress testing by real athletes in extreme Indian climates. We evaluate stretch retention memory, moisture evaporation rates, and structural seam integrity under heavy lifting loads. We source only the finest elastane and hydrophobic polyester blends globally, ensuring our apparel retains its shape and compression profile wash after wash.
            </React.Fragment>,
            <React.Fragment key="4">
              Our vision deliberately extends far beyond simple gym utility. The modern individual requires an inherently versatile wardrobe that effortlessly transitions from an intense early-morning workout to a demanding, high-stakes boardroom, and finally to a refined evening social setting. By consciously elevating our athletic apparel to the demanding standards of contemporary luxury fashion, <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>our shop collections</Link> empower your daily life. Investing in DualDeer means investing in supreme physiological resilience, undeniable style, and long-lasting durability. We are not just a clothing brand; we are a dedicated lifestyle commitment for those elite individuals who relentlessly push their limits and simply refuse to settle for anything less than absolute sportswear perfection.
            </React.Fragment>
          ]}
        />
        <div style={{ maxWidth: '800px', margin: '4rem auto 0', padding: '0 2rem', textAlign: 'center', color: 'var(--color-text)' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Best SpeedSuits in India</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.8, lineHeight: 1.6 }}>
            DualDeer offers premium SpeedSuits designed for athletes in India.
            Our compression SpeedSuits improve performance, enhance recovery,
            and provide unmatched comfort for gym and running.
          </p>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
          <Link href="/shop" style={{ display: 'inline-block', padding: '1rem 3rem', background: 'var(--color-primary)', color: 'var(--color-text)', textDecoration: 'none', fontWeight: 600, borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Explore Our Collection
          </Link>
        </div>
      </main>
    </>
  );
}
