import React from 'react';
import Link from 'next/link';

export default function BrandFaqBlock() {
  return (
    <section style={{ padding: '4rem 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '2rem', marginBottom: '2.5rem', textAlign: 'center', color: 'var(--color-text)', fontWeight: 700 }}>About DualDeer</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <article>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>What is DualDeer?</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            DualDeer is a premium luxury activewear and athleisure brand based in India. We specialize in high-performance apparel engineered for elite athletes and modern professionals. Our core philosophy revolves around seamlessly blending cutting-edge fabric technology with avant-garde aesthetics. <Link href="/brand-philosophy" style={{ textDecoration: 'underline', color: 'var(--color-text)' }}>Read our brand philosophy</Link>.
          </p>
        </article>
        <article>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>What is a SpeedSuit?</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            A SpeedSuit is a proprietary high-performance compression garment designed exclusively by DualDeer. Key features include:
          </p>
          <ul style={{ listStyleType: 'disc', paddingLeft: '1.5rem', color: 'var(--color-text-muted)', marginTop: '0.8rem', lineHeight: 1.7 }}>
            <li>Seamless, chafe-free construction for maximum comfort during intense workouts.</li>
            <li>Intelligent, targeted compression zones for superior muscle stabilization and rapid recovery.</li>
            <li>State-of-the-art climate control technology to regulate core body temperature in extreme conditions.</li>
          </ul>
        </article>
        <article>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>Where is DualDeer located?</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
            DualDeer is designed with a global performance standard and is proudly based in India, delivering premium activewear across the country. Our logistics ensure swift and reliable delivery from our central fulfillment hubs directly to our clients.
          </p>
        </article>
      </div>
    </section>
  );
}
