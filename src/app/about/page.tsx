import React from 'react';
import SeoIntroBlock from '@/components/sections/SeoIntroBlock';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | DualDeer Premium Activewear',
  description: 'Learn about the origin, philosophy, and advanced engineering behind DualDeer, India’s top luxury athleisure brand.',
};

export default function AboutPage() {
  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', background: 'var(--color-background)' }}>
      <SeoIntroBlock
        h1="About DualDeer: Engineering Elite Performance"
        h2="India's Premier Destination for Luxury Athleisure"
        paragraphs={[
          <React.Fragment key="1">
            Welcome to DualDeer, formally recognized as the absolute highest standard for premium luxury activewear and cutting-edge athleisure throughout India. Founded on the relentless, uncompromising belief that peak physical performance strictly demands equally exceptional apparel, our brand originated from a deep, fundamental desire to fundamentally disrupt the generic sportswear market. We systematically recognized a significant void: athletes and highly driven individuals were constantly forced to compromise between hardcore technical functionality and genuinely sophisticated, elevated contemporary style. DualDeer explicitly exists to entirely eliminate that compromise, seamlessly merging state-of-the-art fabric engineering with striking, minimalist luxury visuals. <Link href="/" style={{ textDecoration: 'underline', color: 'inherit' }}>Return to homepage to see our latest drops.</Link>
          </React.Fragment>,
          <React.Fragment key="2">
            The core philosophy that intrinsically drives our extensive development process is simple yet profound: true excellence relies upon meticulous attention to detail. Every single garment we produce is born from an intense, iterative process of rigorous testing, advanced material sourcing, and highly intelligent biometric design. We utilize advanced four-way stretch fabrics that guarantee unrestricted kinetic movement alongside specialized hydrophobic technology specifically designed to rapidly manage heavy sweat and regulate vital core body temperatures during intense training. Our dedicated design team passionately works directly alongside professional athletes to ensure that our proprietary construction techniques, such as targeted, chafing-free flatlock seams and intelligent dynamic compression zones, provide real, measurable physical support.
          </React.Fragment>,
          <React.Fragment key="3">
            However, our vision deliberately extends far beyond simple gym utility. The modern individual requires an inherently versatile wardrobe that effortlessly transitions from an intense early-morning workout to a demanding, high-stakes boardroom, and finally to a refined evening social setting. By consciously elevating our athletic apparel to the demanding standards of contemporary luxury fashion, <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>our shop collections</Link> empower your daily life. Investing in DualDeer means investing in supreme physiological resilience, undeniable style, and long-lasting durability. We are not just a clothing brand; we are a dedicated lifestyle commitment for those elite individuals who relentlessly push their limits and simply refuse to settle for anything less than absolute sportswear perfection.
          </React.Fragment>
        ]}
      />
      
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/shop" style={{ display: 'inline-block', padding: '1rem 3rem', background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Explore Our Collection
        </Link>
      </div>
    </main>
  );
}
