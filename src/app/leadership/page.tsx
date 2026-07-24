import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Leadership | DualDeer Premium Activewear',
  description: 'Meet the visionaries, athletes, and creative minds behind DualDeer. Discover the team engineering the future of high-performance athleisure.',
  alternates: {
    canonical: 'https://dualdeer.com/leadership',
  },
};

export default function LeadershipPage() {
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Leadership Team",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "item": {
          "@type": "Person",
          "name": "Deer",
          "url": "https://dualdeer.com/leadership/deer"
        }
      },
      {
        "@type": "ListItem",
        "position": 2,
        "item": {
          "@type": "Person",
          "name": "Aritra Sharma",
          "url": "https://dualdeer.com/leadership/aritra-sharma"
        }
      },
      {
        "@type": "ListItem",
        "position": 3,
        "item": {
          "@type": "Person",
          "name": "Abir Dey",
          "url": "https://dualdeer.com/leadership/abir-dey"
        }
      },
      {
        "@type": "ListItem",
        "position": 4,
        "item": {
          "@type": "Person",
          "name": "Ayushman Haldar",
          "url": "https://dualdeer.com/leadership/ayushman-haldar"
        }
      }
    ]
  };

  return (
    <main style={{ position: 'relative', paddingTop: '10rem', paddingBottom: '6rem', minHeight: '80vh', background: 'var(--color-background)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem', color: 'var(--color-text)' }}>DualDeer Leadership</h1>
          <p style={{ fontSize: '1.2rem', color: 'var(--color-text)', opacity: 0.8, maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
            The vanguard of human performance is not built by chance. It is engineered by athletes who understand the demands of the body, and creatives who understand the power of design.
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {/* Deer */}
          <Link href="/leadership/deer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'all 0.4s ease', cursor: 'pointer' }} className="leadership-card">
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: '#fff', fontWeight: 900 }}>D</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>Deer</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 1.5rem' }}>Founder & Creative Architect</p>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.7 }}>National medalist, state record holder, and ultra-premium level athlete. The visionary driving DualDeer's product and performance architecture.</p>
            </div>
          </Link>
          
          {/* Aritra */}
          <Link href="/leadership/aritra-sharma" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'all 0.4s ease', cursor: 'pointer' }} className="leadership-card">
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--color-text)', fontWeight: 900 }}>AS</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>Aritra Sharma</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 1.5rem' }}>Head of Operations & Lead Editor</p>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.7 }}>DualDeer's creative backbone. Translating athletic intensity into striking visual narratives through world-class video production.</p>
            </div>
          </Link>
          
          {/* Abir */}
          <Link href="/leadership/abir-dey" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'all 0.4s ease', cursor: 'pointer' }} className="leadership-card">
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--color-text)', fontWeight: 900 }}>AD</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>Abir Dey</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 1.5rem' }}>Lead Brand Model</p>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.7 }}>Elite fitness model and brand ambassador. The physical embodiment of DualDeer's aesthetic, driving high-converting on-camera campaigns.</p>
            </div>
          </Link>
          
          {/* Ayushman */}
          <Link href="/leadership/ayushman-haldar" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'rgba(var(--foreground-rgb), 0.02)', padding: '3rem 2rem', borderRadius: '24px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', color: 'var(--color-text)', height: '100%', transition: 'all 0.4s ease', cursor: 'pointer' }} className="leadership-card">
              <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--color-text)', fontWeight: 900 }}>AH</div>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '0 0 0.5rem' }}>Ayushman Haldar</h2>
              <p style={{ color: 'var(--color-primary)', fontWeight: 800, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 1.5rem' }}>Head of Marketing & Social</p>
              <p style={{ fontSize: '1rem', opacity: 0.8, lineHeight: 1.7 }}>The strategic marketing brain. Architecting DualDeer's digital growth, audience engagement, and overarching social media footprint.</p>
            </div>
          </Link>
        </div>
      </section>
      <style dangerouslySetInnerHTML={{ __html: `
        .leadership-card:hover {
          transform: translateY(-10px) !important;
          background: rgba(var(--foreground-rgb), 0.04) !important;
          border-color: rgba(var(--foreground-rgb), 0.1) !important;
        }
      ` }} />
    </main>
  );
}
