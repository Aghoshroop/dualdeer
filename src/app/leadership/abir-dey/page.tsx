import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LeadershipCrossLinks from '@/components/leadership/LeadershipCrossLinks';
import { guides } from '@/app/learn/guidesData';

export const metadata: Metadata = {
  title: 'Abir Dey - Lead Brand Model | DualDeer',
  description: 'Meet Abir Dey, Lead Brand Model at DualDeer. An elite fitness model representing the aesthetic standard of India’s top luxury athleisure brand.',
  alternates: {
    canonical: 'https://dualdeer.com/leadership/abir-dey',
  },
  openGraph: {
    title: 'Abir Dey - Lead Brand Model | DualDeer',
    description: 'Meet Abir Dey, Lead Brand Model at DualDeer.',
    url: 'https://dualdeer.com/leadership/abir-dey',
    type: 'profile',
    images: [{ url: 'https://dualdeer.com/abir-dey-brand-model.webp', width: 1200, height: 630 }],
  }
};

export default function AbirDeyProfilePage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Abir Dey",
    "jobTitle": "Lead Brand Model",
    "worksFor": {
      "@type": "Organization",
      "name": "DualDeer",
      "url": "https://dualdeer.com"
    },
    "description": "Lead Brand Model at DualDeer. Abir is an elite fitness model who spearheads on-camera campaigns, product testing, and community engagement to drive lead generation.",
    "knowsAbout": [
      "Fitness",
      "Brand Representation",
      "Product Testing",
      "Athlete Lifestyle",
      "Lead Generation"
    ],
    "image": "https://dualdeer.com/abir-dey-brand-model.webp",
    "url": "https://dualdeer.com/leadership/abir-dey",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kolkata",
      "addressRegion": "West Bengal",
      "addressCountry": "IN"
    },
    "nationality": {
      "@type": "Country",
      "name": "India"
    }
  };

  const authoredGuides = guides.filter(g => g.author === 'Abir Dey');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <main style={{ position: 'relative', paddingTop: '10rem', paddingBottom: '6rem', minHeight: '80vh', background: 'var(--color-background)' }}>
        <article style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem' }}>
          
          <div style={{ marginBottom: '3rem' }}>
            <Breadcrumb items={[
              { label: 'Home', href: '/' },
              { label: 'Leadership', href: '/leadership' },
              { label: 'Abir Dey' }
            ]} />
          </div>

          {/* Header Section */}
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--color-text)', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              AD
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', color: 'var(--color-text)', lineHeight: 1 }}>Abir Dey</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Lead Brand Model</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Fitness Model</span>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Brand Athlete</span>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Kolkata, India</span>
            </div>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-text)', opacity: 0.6, fontWeight: 500 }}>
              Updated: July 2026
            </div>
          </header>

          {/* Expertise Block */}
          <section style={{ background: 'var(--color-background-alt)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', marginBottom: '4rem' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem', letterSpacing: '1px' }}>Expertise</h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {["Fitness", "Product Testing", "Athlete Lifestyle"].map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>✓</span> {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Hero Quote */}
          <blockquote style={{ fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', textAlign: 'center', marginBottom: '5rem', color: 'var(--color-text)', opacity: 0.9, lineHeight: 1.4 }}>
            "Performance is the best advertisement. When the gear works, the athlete speaks."
          </blockquote>

          {/* Biography Content */}
          <div className="biography-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)', opacity: 0.9 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>The Physical Embodiment of DualDeer</h2>
            <p style={{ marginBottom: '2rem' }}>
              Abir Dey is not just a face in a photograph; he is the physical embodiment of the DualDeer ethos. As an elite fitness model and a highly disciplined athlete, Abir represents the extreme standard of physique and performance that the brand caters to. Based in Kolkata, he is an integral part of the leadership team, acting as the bridge between DualDeer's engineering lab and the intense reality of heavy physical training.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              When a new compression shirt or a prototype speedsuit is developed, Abir is the primary test subject. He subjects the apparel to grueling, multi-hour workout sessions, providing critical feedback to Deer regarding seam integrity, breathability, and kinetic restriction. If the garment does not survive Abir's training regimen, it does not go to market.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>Driving the Visual Narrative</h2>
            <p style={{ marginBottom: '2rem' }}>
              On camera, Abir operates in total synergy with Aritra Sharma. Together, they create the striking, aggressive visuals that define DualDeer's marketing. Abir knows instinctively how a garment should drape over muscle under tension, and how to pose to highlight the specific compressive zones of the apparel.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              His work goes far beyond traditional modeling. Abir's authentic presence in the fitness community is a massive driver for lead generation. Because he genuinely lives the lifestyle of an elite athlete, his endorsement of the brand carries profound weight with fitness enthusiasts. He frequently engages with the community, answering questions about training, nutrition, and why DualDeer gear is his exclusive choice for performance wear.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>The Core of Community Trust</h2>
            <p style={{ marginBottom: '2rem' }}>
              By putting an active, respected athlete at the forefront of the brand's imagery, DualDeer establishes immediate trust with its target demographic. Abir proves that the gear is built for those who take their physical development as seriously as the brand takes its fabric engineering.
            </p>
          </div>

          {/* Related Articles authored by Abir */}
          {authoredGuides.length > 0 && (
            <section style={{ marginTop: '4rem', padding: '3rem', background: 'var(--color-background-alt)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>
                Written by Abir Dey <span style={{ fontSize: '1rem', color: 'var(--color-primary)', marginLeft: '1rem' }}>{authoredGuides.length} Articles</span>
              </h3>
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {authoredGuides.map(guide => (
                  <Link key={guide.slug} href={`/learn/${guide.slug}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', padding: '1.5rem', background: 'var(--color-background)', borderRadius: '12px', border: '1px solid rgba(var(--foreground-rgb), 0.05)', transition: 'border-color 0.3s' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem' }}>{guide.title}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--color-text)', opacity: 0.7, margin: 0 }}>{guide.category} • {guide.readingTime}</p>
                    </div>
                    <span style={{ color: 'var(--color-primary)' }}>&rarr;</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <LeadershipCrossLinks currentExecutive="abir-dey" />

        </article>
      </main>
    </>
  );
}
