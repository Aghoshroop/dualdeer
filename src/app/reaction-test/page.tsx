import React from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import styles from './ReactionTest.module.css';

export default function ReactionTestV2() {
  return (
    <div className={styles.container}>
      <div className={styles.navBarSpacer} />
      
      <Link href="/" className={styles.backBtn}>
        <ChevronLeft size={20} /> EXIT
      </Link>

      <div className={styles.content}>
        <h1 className={styles.title}>
          New Test Upcoming
        </h1>
        <p className={styles.subtitle}>
          The reaction test arena is currently being upgraded for the next phase. Stay tuned for the next competitive drop.
        </p>
        
        <Link href="/shop" className={styles.champagneBtnOutline} style={{ marginTop: '2rem' }}>
          Explore Collection
        </Link>
      </div>
    </div>
  );
}
