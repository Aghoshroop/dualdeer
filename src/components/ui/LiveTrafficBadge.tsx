"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LiveTrafficBadge.module.css';

export default function LiveTrafficBadge() {
  const [traffic, setTraffic] = useState(247);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    const fluctuate = () => {
      setTraffic(prev => {
        const change = Math.floor(Math.random() * 11) - 4;
        const next = prev + change;
        if (next < 130) return 130 + Math.floor(Math.random() * 15);
        if (next > 480) return 480 - Math.floor(Math.random() * 15);
        return next;
      });
      const nextDelay = 3000 + Math.random() * 4000;
      setTimeout(fluctuate, nextDelay);
    };

    const initialTimer = setTimeout(fluctuate, 3000);
    return () => {
      clearTimeout(initialTimer);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2 }} 
      className={styles.container}
      style={{
        bottom: isMobile ? '80px' : '20px',
        right: isMobile ? '10px' : '20px',
      }}
    >
      <motion.div 
        animate={{ opacity: [1, 0.4, 1], scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className={styles.pulseDot}
      />
      <div className={styles.textGroup}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={traffic}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className={styles.number}
          >
            {traffic}
          </motion.span>
        </AnimatePresence>
        <span className={styles.label}>Online</span>
      </div>
    </motion.div>
  );
}
