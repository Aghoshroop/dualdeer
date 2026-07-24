import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LeadershipCrossLinks from '@/components/leadership/LeadershipCrossLinks';
import { guides } from '@/app/learn/guidesData';

export const metadata: Metadata = {
  title: 'Aritra Sharma - Head of Operations & Creative Media Lead | DualDeer',
  description: 'Meet Aritra Sharma, Head of Operations and Creative Media Lead at DualDeer. Driving brand storytelling, video production, and campaign development from Kolkata, India.',
  alternates: {
    canonical: 'https://dualdeer.com/leadership/aritra-sharma',
  },
  openGraph: {
    title: 'Aritra Sharma - Head of Operations & Creative Media Lead | DualDeer',
    description: 'Meet Aritra Sharma, Head of Operations and Creative Media Lead at DualDeer.',
    url: 'https://dualdeer.com/leadership/aritra-sharma',
    type: 'profile',
    images: [{ url: 'https://dualdeer.com/aritra-sharma-dualdeer.webp', width: 1200, height: 630 }],
  }
};

export default function AritraSharmaProfilePage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Aritra Sharma",
    "jobTitle": ["Head of Operations", "Creative Media Lead"],
    "worksFor": {
      "@type": "Organization",
      "name": "DualDeer",
      "url": "https://dualdeer.com"
    },
    "description": "Head of Operations and Creative Media Lead at DualDeer. Aritra manages core brand operations and leads all video production, brand storytelling, and campaign development.",
    "knowsAbout": [
      "Creative Direction",
      "Video Production",
      "Brand Storytelling",
      "Operations Management",
      "Social Media Research"
    ],
    "image": "https://dualdeer.com/aritra-sharma-dualdeer.webp",
    "url": "https://dualdeer.com/leadership/aritra-sharma",
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

  const authoredGuides = guides.filter(g => g.author === 'Aritra Sharma');

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
              { label: 'Aritra Sharma' }
            ]} />
          </div>

          {/* Header Section */}
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--color-text)', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              AS
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', color: 'var(--color-text)', lineHeight: 1 }}>Aritra Sharma</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Head of Operations & Lead Editor</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Creative Media Lead</span>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Brand Storytelling</span>
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
              {["Creative Direction", "Video Production", "Brand Storytelling"].map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>✓</span> {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Hero Quote */}
          <blockquote style={{ fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', textAlign: 'center', marginBottom: '5rem', color: 'var(--color-text)', opacity: 0.9, lineHeight: 1.4 }}>
            "Every campaign should tell a story before it sells a product. Visuals must carry the weight of the athlete's ambition."
          </blockquote>

          {/* Biography Content */}
          <div className="biography-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)', opacity: 0.9 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>The Core of DualDeer Operations</h2>
            <p style={{ marginBottom: '2rem' }}>
              Aritra Sharma stands as the operational backbone of DualDeer. As the top manager directly alongside the founder, his role is multifaceted and relentlessly demanding. Based out of the brand's headquarters in Kolkata, Aritra oversees the intricate daily mechanics that keep a high-end luxury activewear brand functioning flawlessly—from coordinating complex supply chain logistics to ensuring that every product launch is executed with military precision.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              His ability to synthesize vast amounts of operational data into actionable, streamlined processes allows the creative and marketing wings of the brand to operate without friction. When Deer architects a new line of activewear, it is Aritra who builds the operational runway to bring those garments from the manufacturing floor into the hands of elite athletes worldwide.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>A Passion for the Lens</h2>
            <p style={{ marginBottom: '2rem' }}>
              Beyond his operational duties, Aritra's true passion—and where his unique genius shines brightest—is behind the camera. As DualDeer's Lead Video Editor and Creative Media Director, he is entirely responsible for the brand's stunning visual language. He does not just edit videos; he sculpts adrenaline.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              Aritra has an unparalleled eye for capturing the raw intensity of physical exertion and pairing it with high-fashion cinematography. His editing suite is where sweat, grit, and ultra-premium fabric are translated into the gripping, high-octane campaigns that define DualDeer's digital presence. He spends countless hours meticulously color-grading footage, perfectly timing cuts to aggressive audio tracks, and ensuring that every frame screams luxury performance.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>The Devoted Employee</h2>
            <p style={{ marginBottom: '2rem' }}>
              Aritra is widely recognized within the company as the most devoted employee. His dedication to social media research is legendary; he constantly analyzes emerging digital trends, algorithm shifts, and visual aesthetics to ensure DualDeer's content remains not just relevant, but pioneering. He doesn't sleep until a campaign video is perfect, recognizing that in the digital age, a brand's visual story is its most powerful asset.
            </p>
          </div>

          {/* Related Articles authored by Aritra */}
          {authoredGuides.length > 0 && (
            <section style={{ marginTop: '4rem', padding: '3rem', background: 'var(--color-background-alt)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>
                Written by Aritra Sharma <span style={{ fontSize: '1rem', color: 'var(--color-primary)', marginLeft: '1rem' }}>{authoredGuides.length} Articles</span>
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

          <LeadershipCrossLinks currentExecutive="aritra-sharma" />

        </article>
      </main>
    </>
  );
}
