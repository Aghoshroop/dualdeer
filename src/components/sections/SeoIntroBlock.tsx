"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './SeoIntroBlock.module.css';
import Link from 'next/link';
import Image from 'next/image';

interface SeoIntroBlockProps {
  h1: string;
  h2?: string;
  h3?: string;
  paragraphs: React.ReactNode[];
  image?: string;
  reverse?: boolean;
}

const luxuryEase = [0.76, 0, 0.24, 1] as const;

export default function SeoIntroBlock({ h1, h2, h3, paragraphs, image, reverse = false }: SeoIntroBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className={styles.seoSection}>
      <div className={`${styles.seoContainer} ${reverse ? styles.reverse : ''}`}>
        <motion.div 
          className={styles.imageColumn}
          initial={{ opacity: 0, filter: "blur(10px)", scale: 0.95 }}
          whileInView={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2, ease: luxuryEase }}
        >
          <div className={styles.imageWrapper}>
            <div className={styles.glassBadge}>Premium Reserve</div>
            <Image src="/speedsuit.png" alt="DualDeer SpeedSuit premium compression wear India" fill style={{ objectFit: 'cover' }} className={styles.image} />
          </div>
        </motion.div>
        <div className={styles.textColumn}>
          <div className={styles.textWrapper}>
            {h2 && (
              <motion.h2 
                className={styles.subtitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: luxuryEase }}
              >
                {h2}
              </motion.h2>
            )}
            
            <motion.h1 
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: luxuryEase, delay: 0.1 }}
            >
              {h1}
            </motion.h1>
            
            <motion.div 
              className={styles.divider}
              initial={{ scaleX: 0, originX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: luxuryEase, delay: 0.2 }}
            />
            
            {h3 && (
              <motion.h3 
                className={styles.subSubtitle}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, ease: luxuryEase, delay: 0.3 }}
              >
                {h3}
              </motion.h3>
            )}
            
            <div className={`${styles.paragraphs} ${!isExpanded ? styles.collapsed : ''}`}>
              {paragraphs.map((content, idx) => (
                <motion.p 
                  key={idx} 
                  className={styles.text}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: luxuryEase, delay: 0.4 + (idx * 0.1) }}
                >
                  {content}
                </motion.p>
              ))}
            </div>
            
            {paragraphs.length > 1 && (
              <motion.button 
                className={styles.readMoreBtn} 
                onClick={() => setIsExpanded(!isExpanded)}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                {isExpanded ? 'Show Less' : 'Read More Details'}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
