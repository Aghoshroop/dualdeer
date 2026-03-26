"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { getContentBlock } from '@/lib/firebaseUtils';
import styles from "./BrandStory.module.css";

export default function BrandStory() {
  const [block, setBlock] = useState<any>(null);

  useEffect(() => {
    getContentBlock('brand-story').then(res => setBlock(res));
  }, []);

  const image = block?.imageUrl || 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2600&auto=format&fit=crop';
  const title = block?.title || 'The Pursuit of Absolute Perfection';
  const text = block?.body || 'DualDeer was founded on a singular philosophy: that extreme athletic performance and uncompromising luxury are not mutually exclusive. We source the world\'s most advanced aerodynamic fabrics and stitch them with heritage craftsmanship to create silhouettes that command the street and dominate the track.';
  const cta = block?.ctaText || 'DISCOVER THE HERITAGE';
  const ctaLink = block?.ctaLink || '/about';

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.imageContainer}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.2 }}
        >
          <div 
            className={styles.image}
            style={{ backgroundImage: `url('${image}')` }}
          />
        </motion.div>

        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <span className={styles.subtitle}>EST. 2026</span>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.text}>{text}</p>
          <Link href={ctaLink} className={styles.shopLink}>
            {cta}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
