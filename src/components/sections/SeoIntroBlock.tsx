"use client";
import React, { useState } from 'react';
import styles from './SeoIntroBlock.module.css';
import Link from 'next/link';

interface SeoIntroBlockProps {
  h1: string;
  h2?: string;
  h3?: string;
  paragraphs: React.ReactNode[];
  image?: string;
  reverse?: boolean;
}

export default function SeoIntroBlock({ h1, h2, h3, paragraphs, image, reverse = false }: SeoIntroBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Ultra premium default image complementing the dark luxury aesthetic
  const defaultImage = "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=1600&auto=format&fit=crop";
  const displayImage = image || defaultImage;

  return (
    <section className={styles.seoSection}>
      <div className={`${styles.seoContainer} ${reverse ? styles.reverse : ''}`}>
        <div className={styles.imageColumn}>
          <div className={styles.imageWrapper}>
            <div className={styles.glassBadge}>Premium Reserve</div>
            <img src="/speedsuit.png" alt="DualDeer SpeedSuit premium compression wear India" className={styles.image} />
          </div>
        </div>
        <div className={styles.textColumn}>
          <div className={styles.textWrapper}>
            {h2 && <h2 className={styles.subtitle}>{h2}</h2>}
            <h1 className={styles.title}>{h1}</h1>
            <div className={styles.divider}></div>
            {h3 && <h3 className={styles.subSubtitle}>{h3}</h3>}
            <div className={`${styles.paragraphs} ${!isExpanded ? styles.collapsed : ''}`}>
              {paragraphs.map((content, idx) => (
                <p key={idx} className={styles.text}>{content}</p>
              ))}
            </div>
            
            {paragraphs.length > 1 && (
              <button 
                className={styles.readMoreBtn} 
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show Less' : 'Read More Details'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
