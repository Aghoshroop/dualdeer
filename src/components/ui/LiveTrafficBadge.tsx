"use client";
import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      transition={{ delay: 2, duration: 1 }} 
      style={{
        position: 'fixed',
        bottom: isMobile ? '85px' : '30px', /* Securely clears extreme 200px bottom arrays */
        right: isMobile ? '10px' : '30px',
        background: 'rgba(20, 20, 20, 0.4)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '50px',
        padding: isMobile ? '6px 12px' : '10px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        zIndex: 9999,
        color: '#ffffff',
        fontFamily: 'var(--font-inter)',
        fontSize: isMobile ? '0.65rem' : '0.8rem',
        fontWeight: '500',
        letterSpacing: '0.5px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'none' 
      }}
    >
      <motion.div 
        animate={{ opacity: [1, 0.3, 1], scale: [1, 1.2, 1] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#4ade80', // Premium secure green
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(74, 222, 128, 0.6)'
        }}
      />
      
      <Users size={14} style={{ opacity: 0.6 }} />
      
      <span style={{ display: 'flex', gap: '4px' }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={traffic}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.4 }}
            style={{ fontWeight: '700' }}
          >
            {traffic}
          </motion.span>
        </AnimatePresence>
        <span style={{ opacity: 0.8 }}>Active Shoppers</span>
      </span>
    </motion.div>
  );
}
