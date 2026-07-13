import React from 'react';
import Link from 'next/link';
import { trustPages } from './trustData';
import styles from './Trust.module.css';
import { Metadata } from 'next';
import { ShieldCheck, Factory, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trust Center | DualDeer',
  description: 'Evidence-based transparency covering our manufacturing, fabric tech, and brand philosophy.',
};

export default function TrustCenterPage() {
  const aboutPages = trustPages.filter(p => p.category === 'about');
  const manufacturingPages = trustPages.filter(p => p.category === 'manufacturing');
  const policyPages = trustPages.filter(p => p.category === 'policies');

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Trust & Transparency</h1>
        <p className={styles.subtitle}>
          We believe in absolute transparency. Discover how our products are engineered, where they are made, and the philosophy driving DualDeer.
        </p>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <BookOpen size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
          Brand Philosophy
        </h2>
        <div className={styles.grid}>
          {aboutPages.map(page => (
            <Link key={page.slug} href={`/trust/${page.slug}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{page.title}</h3>
              <p className={styles.cardDesc}>{page.description}</p>
              <div className={styles.cardFooter}>Read Document &rarr;</div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Factory size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
          Engineering & Manufacturing
        </h2>
        <div className={styles.grid}>
          {manufacturingPages.map(page => (
            <Link key={page.slug} href={`/trust/${page.slug}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{page.title}</h3>
              <p className={styles.cardDesc}>{page.description}</p>
              <div className={styles.cardFooter}>Read Document &rarr;</div>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <ShieldCheck size={24} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} /> 
          Policies & Care
        </h2>
        <div className={styles.grid}>
          {policyPages.map(page => (
            <Link key={page.slug} href={`/trust/${page.slug}`} className={styles.card}>
              <h3 className={styles.cardTitle}>{page.title}</h3>
              <p className={styles.cardDesc}>{page.description}</p>
              <div className={styles.cardFooter}>Read Document &rarr;</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
