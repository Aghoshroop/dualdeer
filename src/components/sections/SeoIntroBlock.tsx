import React from 'react';
import styles from './SeoIntroBlock.module.css';
import Link from 'next/link';

interface SeoIntroBlockProps {
  h1: string;
  h2?: string;
  h3?: string;
  paragraphs: React.ReactNode[];
}

export default function SeoIntroBlock({ h1, h2, h3, paragraphs }: SeoIntroBlockProps) {
  return (
    <section className={styles.seoBlock}>
      <h1 className={styles.title}>{h1}</h1>
      {h2 && <h2 className={styles.subtitle}>{h2}</h2>}
      {h3 && <h3 className={styles.subSubtitle}>{h3}</h3>}
      {paragraphs.map((content, idx) => (
        <p key={idx} className={styles.text}>{content}</p>
      ))}
    </section>
  );
}
