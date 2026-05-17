import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './ReactionTest.module.css';

export default function ReactionTestV2() {
  return (
    <div className={styles.container} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div className={styles.navBarSpacer} />
      
      <Link href="/" className={styles.backBtn} style={{ position: 'absolute', top: '100px', left: '20px' }}>
        <ChevronLeft size={20} /> EXIT
      </Link>

      <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '3.5rem', fontFamily: 'var(--font-logo)', marginBottom: '1rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
          New Test Upcoming
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', letterSpacing: '1px', lineHeight: '1.6' }}>
          The reaction test arena is currently being upgraded for the next phase. Stay tuned for the next competitive drop.
        </p>
        
        <Link href="/shop" style={{ display: 'inline-block', marginTop: '2rem', padding: '1rem 3rem', border: '1px solid var(--color-border)', borderRadius: '50px', letterSpacing: '2px', fontWeight: 600, textTransform: 'uppercase', color: 'var(--color-text)' }}>
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
