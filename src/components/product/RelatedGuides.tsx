import React from 'react';
import Link from 'next/link';
import { guides } from '@/app/learn/guidesData';
import styles from './RelatedGuides.module.css';

interface RelatedGuidesProps {
  category?: string;
  name?: string;
}

export default function RelatedGuides({ category = '', name = '' }: RelatedGuidesProps) {
  // Simple heuristic to pick relevant guides based on product name/category
  const isCompression = category.toLowerCase().includes('compression') || name.toLowerCase().includes('compression');
  
  let selectedGuides = guides.slice(0, 3);
  
  if (isCompression) {
    selectedGuides = guides.filter(g => g.slug.includes('compression')).slice(0, 3);
    if (selectedGuides.length < 3) {
      selectedGuides = [...selectedGuides, ...guides.filter(g => !g.slug.includes('compression'))].slice(0, 3);
    }
  } else {
    // Pick general guides
    selectedGuides = guides.filter(g => g.slug.includes('buying-guide') || g.slug.includes('size-guide') || g.slug.includes('care-guide')).slice(0, 3);
    if (selectedGuides.length < 3) {
      selectedGuides = guides.slice(2, 5);
    }
  }

  if (selectedGuides.length === 0) return null;

  return (
    <section className={styles.relatedGuidesContainer}>
      <h3 className={styles.sectionTitle}>DualDeer Knowledge Center</h3>
      <p className={styles.sectionSubtitle}>Dive deeper into the science and care of your activewear.</p>
      
      <div className={styles.guidesGrid}>
        {selectedGuides.map(guide => (
          <Link href={`/learn/${guide.slug}`} key={guide.slug} className={styles.guideCard}>
            <h4 className={styles.guideTitle}>{guide.title}</h4>
            <p className={styles.guideDesc}>{guide.description.substring(0, 80)}...</p>
            <span className={styles.readMore}>Read Guide &rarr;</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
