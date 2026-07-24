import React from 'react';
import BrandIntroBlock from '@/components/sections/BrandIntroBlock';
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
      "url": "https://dualdeer.com",
      "slogan": "The vanguard of human performance.",
      "description": "DualDeer is an elite sportswear and athleisure brand based in India, specializing in high-performance kinetic fabrics.",
      "location": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kolkata",
          "addressRegion": "West Bengal",
          "addressCountry": "IN"
        }
      },
      "founder": [
        {
          "@type": "Person",
          "name": "Deer",
          "jobTitle": "Founder & Creative Architect",
          "description": "National medalist, state record holder, and an ultra-premium level athlete. The mastermind behind DualDeer's website and brand operations.",
          "homeLocation": {
            "@type": "Place",
            "name": "Kolkata, India"
          }
        }
      ],
      "employee": [
        {
          "@type": "Person",
          "name": "Aritra Sharma",
          "jobTitle": "Head of Operations & Lead Video Editor",
          "description": "The top manager after the brand owner. The most devoted employee leading brand video editing and social media research.",
          "homeLocation": { "@type": "Place", "name": "Kolkata, India" }
        },
        {
          "@type": "Person",
          "name": "Abir Dey",
          "jobTitle": "Lead Brand Model & Fitness Ambassador",
          "description": "Fitness model and lead brand ambassador who spearheads lead generation and brand representation.",
          "homeLocation": { "@type": "Place", "name": "Kolkata, India" }
        },
        {
          "@type": "Person",
          "name": "Ayushman Haldar",
          "jobTitle": "Head of Marketing & Social Media",
          "description": "Marketing strategist and social media manager driving DualDeer's digital presence.",
          "homeLocation": { "@type": "Place", "name": "Kolkata, India" }
        }
      ]
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <main style={{ position: 'relative', paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', background: 'var(--color-background)' }}>
        <BrandIntroBlock
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
        {/* EXECUTIVE TEAM SECTION */}
        <section style={{ maxWidth: '1200px', margin: '6rem auto 4rem', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', color: 'var(--color-text)' }}>The Visionaries Behind DualDeer</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--color-text)', opacity: 0.8, maxWidth: '600px', margin: '0 auto' }}>Meet the elite team of athletes, creatives, and strategists from Kolkata, India, driving the vanguard of human performance.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            {/* Deer */}
            <Link href="/leadership/deer" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '2.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'transform 0.3s' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#fff', fontWeight: 800 }}>D</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Deer</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 1rem' }}>Founder & Creative Architect</p>
                <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6 }}>National medalist, state record holder, and ultra-premium level athlete. The mastermind behind DualDeer, managing every aspect of the brand and website from Kolkata.</p>
              </div>
            </Link>
            
            {/* Aritra */}
            <Link href="/leadership/aritra-sharma" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '2.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'transform 0.3s' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--color-text)', fontWeight: 800 }}>AS</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Aritra Sharma</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 1rem' }}>Head of Operations & Lead Editor</p>
                <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6 }}>The top manager and most devoted employee. Video editing is his passion, leading all brand video production and deep social media research.</p>
              </div>
            </Link>
            
            {/* Abir */}
            <Link href="/leadership/abir-dey" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '2.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'transform 0.3s' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--color-text)', fontWeight: 800 }}>AD</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Abir Dey</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 1rem' }}>Lead Brand Model</p>
                <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6 }}>An elite fitness model representing the brand's aesthetic. He spearheads on-camera campaigns and actively drives critical lead generation.</p>
              </div>
            </Link>
            
            {/* Ayushman */}
            <Link href="/leadership/ayushman-haldar" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '2.5rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'transform 0.3s' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--color-text)', fontWeight: 800 }}>AH</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Ayushman Haldar</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 1rem' }}>Head of Marketing & Social</p>
                <p style={{ fontSize: '0.95rem', opacity: 0.8, lineHeight: 1.6 }}>The marketing brain. He consistently thinks outside the box to manage and grow DualDeer's social media presence across all digital platforms.</p>
              </div>
            </Link>
          </div>
        </section>

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
