"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './ParallaxShowcase.module.css';
import Link from 'next/link';

// A single image block that applies subtle parallax zoom to itself as it scrolls into view
function ParallaxImage({ src, alt }: { src: string, alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Extremely subtle scale effect (1.15 down to 1.0)
  const scale = useTransform(scrollYProgress, [0, 1], [1.15, 1]);

  return (
    <div className={styles.imageContainer} ref={ref}>
      <motion.img 
        src={src} 
        alt={alt} 
        style={{ scale }}
        transition={{ ease: "linear" }}
      />
    </div>
  );
}

export default function ParallaxShowcase() {
  return (
    <section className={styles.wrapper}>
      
      {/* Left: Sticky Narrative */}
      <div className={styles.stickyLeft}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className={styles.badge}>Flagship Innovation</div>
          <h2 className={styles.title}>The SpeedSuit<br/>Apex Series.</h2>
          <p className={styles.description}>
            Engineered for elite athletic performance and unparalleled aerodynamics. We stripped away every redundant fiber to create a silhouette that bends light and defies drag. This is the absolute pinnacle of luxury training gear.
          </p>
          
          <Link href="/shop?category=speedsuit" className={styles.ctaBtn}>
            Discover The SpeedSuit
          </Link>
        </motion.div>
      </div>

      {/* Right: Scrolling Gallery */}
      <div className={styles.scrollingRight}>
        <ParallaxImage 
          src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1600&auto=format&fit=crop" 
          alt="SpeedSuit View 1" 
        />
        <ParallaxImage 
          src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?q=80&w=1600&auto=format&fit=crop" 
          alt="SpeedSuit Fabric Detail" 
        />
        <ParallaxImage 
          src="https://images.unsplash.com/photo-1558017490-5de8e20af317?q=80&w=1600&auto=format&fit=crop" 
          alt="SpeedSuit Performance" 
        />
      </div>

    </section>
  );
}
