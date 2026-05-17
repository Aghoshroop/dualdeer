"use client";
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
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
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 2, type: 'spring', stiffness: 200, damping: 20 }} 
      className={styles.container}
      style={{
        bottom: isMobile ? '85px' : '30px',
        right: isMobile ? '10px' : '30px',
      }}
    >
      <div className={styles.stripe} />
      <div className={styles.stripe2} />
      
      <div className={styles.content}>
        <motion.div 
          animate={{ opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={styles.pulseDot}
        />
        
        <Activity size={isMobile ? 12 : 18} className={styles.icon} strokeWidth={2.5} />
        
        <div className={styles.textGroup}>
          <span className={styles.liveTag}>LIVE</span>
          <div className={styles.numberGroup}>
            <AnimatePresence mode="popLayout">
              <motion.span
                key={traffic}
                initial={{ opacity: 0, y: -15, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.9 }}
                transition={{ duration: 0.3, type: "spring" }}
                className={styles.number}
              >
                {traffic}
              </motion.span>
            </AnimatePresence>
            <span className={styles.label}>Active</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
