import React from 'react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumb from '@/components/ui/Breadcrumb';
import LeadershipCrossLinks from '@/components/leadership/LeadershipCrossLinks';
import { guides } from '@/app/learn/guidesData';

export const metadata: Metadata = {
  title: 'Ayushman Haldar - Head of Marketing & Social | DualDeer',
  description: 'Meet Ayushman Haldar, Head of Marketing & Social at DualDeer. Driving digital strategy, brand positioning, and social media growth from Kolkata, India.',
  alternates: {
    canonical: 'https://dualdeer.com/leadership/ayushman-haldar',
  },
  openGraph: {
    title: 'Ayushman Haldar - Head of Marketing & Social | DualDeer',
    description: 'Meet Ayushman Haldar, Head of Marketing & Social at DualDeer.',
    url: 'https://dualdeer.com/leadership/ayushman-haldar',
    type: 'profile',
    images: [{ url: 'https://dualdeer.com/ayushman-haldar-marketing.webp', width: 1200, height: 630 }],
  }
};

export default function AyushmanHaldarProfilePage() {
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Ayushman Haldar",
    "jobTitle": ["Head of Marketing", "Social Media Manager"],
    "worksFor": {
      "@type": "Organization",
      "name": "DualDeer",
      "url": "https://dualdeer.com"
    },
    "description": "Head of Marketing and Social Media at DualDeer. Ayushman drives digital strategy, social media management, and out-of-the-box brand positioning.",
    "knowsAbout": [
      "Digital Marketing",
      "Community Growth",
      "Consumer Psychology",
      "Social Media Management",
      "Campaign Positioning"
    ],
    "image": "https://dualdeer.com/ayushman-haldar-marketing.webp",
    "url": "https://dualdeer.com/leadership/ayushman-haldar",
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

  const authoredGuides = guides.filter(g => g.author === 'Ayushman Haldar');

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
              { label: 'Ayushman Haldar' }
            ]} />
          </div>

          {/* Header Section */}
          <header style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '4rem' }}>
            <div style={{ width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(var(--foreground-rgb), 0.1)', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', color: 'var(--color-text)', fontWeight: 900, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              AH
            </div>
            <h1 style={{ fontSize: '4rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', color: 'var(--color-text)', lineHeight: 1 }}>Ayushman Haldar</h1>
            <p style={{ fontSize: '1.2rem', color: 'var(--color-primary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1.5rem' }}>Head of Marketing & Social</p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Marketing Strategy</span>
              <span style={{ padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700 }}>Social Media</span>
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
              {["Digital Marketing", "Community Growth", "Consumer Psychology"].map(skill => (
                <span key={skill} style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                  <span style={{ color: 'var(--color-primary)', marginRight: '0.5rem' }}>✓</span> {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Hero Quote */}
          <blockquote style={{ fontSize: '2rem', fontWeight: 300, fontStyle: 'italic', textAlign: 'center', marginBottom: '5rem', color: 'var(--color-text)', opacity: 0.9, lineHeight: 1.4 }}>
            "Marketing begins with understanding athletes. If you don't speak their language, you don't earn their attention."
          </blockquote>

          {/* Biography Content */}
          <div className="biography-content" style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)', opacity: 0.9 }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.5rem', letterSpacing: '1px' }}>The Architect of Digital Strategy</h2>
            <p style={{ marginBottom: '2rem' }}>
              As the Head of Marketing and Social Media, Ayushman Haldar is the strategic mind responsible for amplifying the DualDeer ethos across the digital landscape. Based in Kolkata alongside the rest of the executive team, he translates the intense physical reality of the brand's apparel into compelling digital narratives that capture and convert high-value audiences.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              Ayushman does not rely on traditional, antiquated marketing playbooks. He understands that the modern consumer of luxury activewear is highly educated and immediately dismissive of inauthentic advertising. Instead, he focuses heavily on out-of-the-box brand positioning, leveraging highly targeted campaigns that emphasize the precise engineering and rigorous athletic testing behind every DualDeer product.
            </p>

            <h2 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', margin: '4rem 0 1.5rem', letterSpacing: '1px' }}>Managing the Digital Ecosystem</h2>
            <p style={{ marginBottom: '2rem' }}>
              When Deer finalizes a new product design and Aritra shoots the campaign, it is Ayushman who architects the distribution strategy. He manages all social media channels, carefully curating the brand's aesthetic grid to ensure it consistently reflects the premium nature of the products.
            </p>
            <p style={{ marginBottom: '2rem' }}>
              His deep understanding of algorithm dynamics, consumer psychology, and digital engagement allows him to rapidly scale DualDeer's audience. He fosters a digital community of elite athletes and discerning consumers who are united by their demand for uncompromised performance wear. Under his guidance, DualDeer's social presence is not just a marketing channel; it is a community hub for high performers.
            </p>
          </div>

          {/* Related Articles authored by Ayushman */}
          {authoredGuides.length > 0 && (
            <section style={{ marginTop: '4rem', padding: '3rem', background: 'var(--color-background-alt)', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '1px' }}>
                Written by Ayushman Haldar <span style={{ fontSize: '1rem', color: 'var(--color-primary)', marginLeft: '1rem' }}>{authoredGuides.length} Articles</span>
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

          <LeadershipCrossLinks currentExecutive="ayushman-haldar" />

        </article>
      </main>
    </>
  );
}
