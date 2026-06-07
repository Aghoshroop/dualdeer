"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { useState, useEffect, useRef } from 'react';
import { getContentBlock } from '@/lib/firebaseUtils';
import styles from "./BrandStory.module.css";
import Magnetic from "../ui/Magnetic";

const luxuryEase = [0.76, 0, 0.24, 1] as const;

export default function BrandStory() {
  const [block, setBlock] = useState<any>(null);
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

  useEffect(() => {
    getContentBlock('brand-story').then(res => setBlock(res));
  }, []);

  const isVideo = block?.mediaType === 'video' && block?.videoUrl;
  const mediaSrc = isVideo ? block.videoUrl : (block?.imageUrl || 'https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2600&auto=format&fit=crop');
  const title = block?.title || 'The Pursuit of Absolute Perfection';
  const text = block?.body || 'DualDeer was founded on a singular philosophy: that extreme athletic performance and uncompromising luxury are not mutually exclusive. We source the world\'s most advanced aerodynamic fabrics and stitch them with heritage craftsmanship to create silhouettes that command the street and dominate the track.';
  const cta = block?.ctaText || 'DISCOVER THE HERITAGE';
  const ctaLink = block?.ctaLink || '/about';

  const words = text.split(" ");

  return (
    <section ref={containerRef} className={styles.section}>
      <div className={styles.container}>
        
        {/* Mask Reveal Image */}
        <div className={styles.imageContainer}>
          <motion.div 
            className={styles.image}
            style={{ 
              backgroundImage: isVideo ? 'none' : `url('${mediaSrc}')`,
              y: yBg
            }}
          >
            {isVideo && (
              <video 
                src={mediaSrc} 
                autoPlay 
                muted 
                loop 
                playsInline 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </motion.div>
          <motion.div 
            initial={{ height: "100%" }}
            whileInView={{ height: "0%" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1.5, ease: luxuryEase }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              backgroundColor: "var(--color-background)",
              zIndex: 1
            }}
          />
        </div>

        <div className={styles.content}>
          <motion.span 
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: luxuryEase }}
          >
            EST. 2026
          </motion.span>
          
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: luxuryEase, delay: 0.2 }}
          >
            {title}
          </motion.h2>
          
          <p className={styles.text}>
            {words.map((word: string, index: number) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  ease: luxuryEase, 
                  delay: 0.3 + (index * 0.02) 
                }}
                style={{ display: "inline-block", marginRight: "0.25em" }}
              >
                {word}
              </motion.span>
            ))}
          </p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, ease: luxuryEase, delay: 0.8 }}
          >
            <Magnetic intensity={0.2}>
              <Link href={ctaLink} className={styles.shopLink}>
                {cta}
              </Link>
            </Magnetic>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
