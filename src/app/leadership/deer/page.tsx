import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LeadershipCrossLinks from '@/components/leadership/LeadershipCrossLinks';
import { guides } from '@/app/learn/guidesData';

export const metadata: Metadata = {
  title: 'Deer - Founder & Creative Architect | DualDeer',
  description: 'Meet Deer, the Founder and Creative Architect of DualDeer. A national medalist and ultra-premium athlete engineering the vanguard of human performance.',
  alternates: {
    canonical: 'https://dualdeer.com/leadership/deer',
  },
  openGraph: {
    title: 'Deer - Founder & Creative Architect | DualDeer',
    description: 'Meet Deer, the Founder and Creative Architect of DualDeer.',
    url: 'https://dualdeer.com/leadership/deer',
    type: 'profile',
    images: [{ url: 'https://dualdeer.com/deer-founder-dualdeer.webp', width: 1200, height: 630 }],
  }
};

export default function DeerProfilePage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Deer",
    "jobTitle": "Founder & Creative Architect",
    "worksFor": {
      "@type": "Organization",
      "name": "DualDeer",
      "url": "https://dualdeer.com"
    },
    "description": "National medalist, state record holder, and the ultra-premium athlete who founded DualDeer. He serves as the Creative Architect, dictating the design, performance metrics, and technological integrations of all DualDeer activewear.",
    "knowsAbout": [
      "Performance Apparel",
      "Product Engineering",
      "Athlete Development",
      "Sports Science",
      "Sports Performance"
    ],
    "image": "https://dualdeer.com/deer-founder-dualdeer.webp",
    "url": "https://dualdeer.com/leadership/deer",
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

  const authoredGuides = guides.filter(g => g.author === 'Deer');

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
              { label: 'Deer' }
            ]} />
          </div>

          {/* Header Section */}
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: '#fff', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              D
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', color: 'var(--color-text)', lineHeight: 1 }}>Deer</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Founder & Creative Architect</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>National Medalist</span>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>State Record Holder</span>
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
              {["Performance Apparel", "Product Engineering", "Athlete Development", "Sports Performance"].map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>✓</span> {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Hero Quote */}
          <blockquote style={{ fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', textAlign: 'center', marginBottom: '5rem', color: 'var(--color-text)', opacity: 0.9, lineHeight: 1.4 }}>
            "Every stitch exists because an athlete needs it—not because fashion demands it. Performance is our only true metric."
          </blockquote>

          {/* Biography Content */}
          <div className="biography-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)', opacity: 0.9 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>The Origins of Excellence</h2>
            <p style={{ marginBottom: '2rem' }}>
              Deer's journey to founding DualDeer was not born out of a desire to simply enter the apparel industry; it was born out of profound frustration with it. As a national medalist and a recognized state record holder, his life has been dictated by the brutal, uncompromising demands of elite athletic performance. He spent thousands of hours in the gym, on the track, and in high-intensity training environments, only to find that the activewear market in India consistently failed to meet the physiological demands of ultra-premium level athletes.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              Existing gear was either technologically sound but aesthetically bankrupt, or visually appealing but structurally fragile under immense physical stress. This stark dichotomy ignited the foundational thesis of DualDeer: the absolute refusal to compromise between elite structural integrity and contemporary luxury aesthetics.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>The Role of Creative Architect</h2>
            <p style={{ marginBottom: '2rem' }}>
              As the Founder and Creative Architect, Deer approaches product design not as a fashion designer, but as a biometric engineer. His methodology is ruthlessly pragmatic. He dictates that every seam, every fabric blend, and every compressive zone must serve a distinct, measurable physiological purpose before it is ever considered for aesthetic refinement.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              Under his direct supervision, the DualDeer development lab in Kolkata operates on a cycle of continuous, aggressive iteration. He personally spearheads the sourcing of advanced hydrophobic polyesters, high-memory elastane, and kinetic fabrics from across the globe. He is notoriously meticulous about "stretch retention memory"—the ability of a garment to maintain its exact compressive profile after being subjected to maximum tension during heavy compound lifting or high-velocity sprinting.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>A Vision Beyond the Gym</h2>
            <p style={{ marginBottom: '2rem' }}>
              Deer's vision extends far beyond creating durable gym clothes; he is architecting a lifestyle standard for the relentless. He understands that the modern elite athlete is multifaceted—transitioning from morning training sessions to high-stakes boardrooms and evening social environments. By treating performance wear with the same rigorous construction techniques used in high-end luxury fashion, he ensures that DualDeer apparel empowers its wearer in every arena of life.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              His pseudonym is not merely a cloak of anonymity, but a deliberate philosophical statement. It removes the ego from the brand, ensuring that the focus remains entirely on the product, the performance, and the community. By operating as the unseen architect, Deer ensures that DualDeer is defined strictly by the caliber of its engineering, rather than the personality of its founder. It is a brand built on merit, for those who earn their place.
            </p>
          </div>

          {/* Related Articles authored by Deer */}
          {authoredGuides.length > 0 && (
            <section style={{ marginTop: '4rem', padding: '3rem', background: 'var(--color-background-alt)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>
                Written by Deer <span style={{ fontSize: '1rem', color: 'var(--color-primary)', marginLeft: '1rem' }}>{authoredGuides.length} Articles</span>
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

          <LeadershipCrossLinks currentExecutive="deer" />

        </article>
      </main>
    </>
  );
}
