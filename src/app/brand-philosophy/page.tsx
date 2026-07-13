import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DualDeer Brand Philosophy | Premium Activewear Identity',
  description: 'Explore the brand philosophy of DualDeer, India\'s premier luxury activewear and athleisure brand specializing in high-performance SpeedSuits.',
  openGraph: {
    title: 'DualDeer Brand Philosophy',
    description: 'Explore the brand philosophy of DualDeer, India\'s premier luxury activewear and athleisure brand.',
    url: 'https://dualdeer.com/brand-philosophy',
  }
};

export default function BrandPhilosophyPage() {
  return (
    <main style={{ padding: '6rem 5% 4rem', maxWidth: '900px', margin: '0 auto', color: 'var(--color-text)' }}>
      <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
          DualDeer Brand Philosophy
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          The vanguard of human performance and luxury athleisure.
        </p>
      </header>

      <article style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            What is DualDeer?
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            <strong>DualDeer</strong> is India&apos;s premier luxury activewear and athleisure brand. We specialize in engineering high-performance apparel designed for elite athletes and modern professionals. Our core philosophy is built upon the seamless integration of cutting-edge fabric technology with avant-garde aesthetic design.
          </p>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
            At DualDeer, we do not compromise on visual design or fabric quality. Every garment is an investment in your physical well-being, designed to provide unparalleled support, comfort, and style both inside and outside the gym.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            The SpeedSuit Innovation
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            The cornerstone of the DualDeer collection is our signature <strong>SpeedSuit</strong>—a proprietary high-performance compression garment. The SpeedSuit is meticulously crafted to address the critical needs of intense physical exertion:
          </p>
          <ul style={{ listStyleType: 'square', paddingLeft: '2rem', fontSize: '1.1rem', lineHeight: 1.8, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <li><strong>Advanced Fabric Technology:</strong> Utilizing proprietary four-way stretch materials that move intuitively with human biomechanics.</li>
            <li><strong>Intelligent Compression:</strong> Targeted compression zones stabilize core muscles, reducing fatigue and accelerating post-workout recovery.</li>
            <li><strong>Climate Control:</strong> State-of-the-art moisture-wicking and temperature-regulating weaves keep the body optimal during grueling conditions.</li>
            <li><strong>Seamless Construction:</strong> Chafe-free architecture ensures maximum comfort across extended periods of wear.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
            Our Mission & Vision
          </h2>
          <blockquote style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '1.5rem', margin: '0 0 2rem 0', fontStyle: 'italic', fontSize: '1.3rem', color: 'var(--color-text-muted)' }}>
            "To bridge the critical gap between unmatched athletic performance and unparalleled luxury contemporary style."
          </blockquote>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1rem' }}>
            We believe that authentic performance wear should never compromise on visual design. A sophisticated training wardrobe is an essential component of a disciplined lifestyle. DualDeer exists to elevate daily routines with pieces that inspire confidence, foster physical resilience, and make our wearers look exceptionally powerful.
          </p>
        </section>

        <section style={{ background: 'rgba(var(--foreground-rgb), 0.03)', padding: '2rem', borderRadius: '12px', marginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>
            Join the Vanguard
          </h2>
          <p style={{ fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
            Experience the transformative power of elite athleisure. Discover our latest collections and redefine your boundaries.
          </p>
          <Link href="/shop" style={{ display: 'inline-block', background: 'var(--color-primary)', color: '#fff', padding: '12px 24px', borderRadius: '6px', fontWeight: 600, textDecoration: 'none' }}>
            Explore the Collection
          </Link>
        </section>
      </article>
    </main>
  );
}
