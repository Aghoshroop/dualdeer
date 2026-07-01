"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Check } from 'lucide-react';
import styles from './AnimatedCartButton.module.css';

interface AnimatedCartButtonProps {
  onAdd: () => void;
  className?: string;
  label?: string;
  size?: 'small' | 'default';
  disabled?: boolean;
}

// Minimalistic T-Shirt SVG
const ShirtIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.38 3.46L16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
  </svg>
);

export default function AnimatedCartButton({
  onAdd,
  className = '',
  label = 'Add to Bag',
  size = 'default',
  disabled = false,
}: AnimatedCartButtonProps) {
  const [btnState, setBtnState] = useState<'idle' | 'animating' | 'success'>('idle');

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (btnState !== 'idle') return;
    
    setBtnState('animating');
    
    // Trigger actual cart addition early so UI feels responsive
    onAdd();

    setTimeout(() => {
      setBtnState('success');
    }, 800); // 800ms for the t-shirt to fly into the bag

    setTimeout(() => {
      setBtnState('idle');
    }, 2500); // Reset after 2.5s
  }, [btnState, onAdd]);

  const isSmall = size === 'small';

  return (
    <motion.button
      className={`${styles.btn} ${isSmall ? styles.small : ''} ${btnState === 'success' ? styles.added : ''} ${className}`}
      onClick={(e) => {
        if (!disabled) handleClick(e);
      }}
      disabled={btnState !== 'idle' || disabled}
      aria-label={btnState === 'success' ? 'Added to bag' : label}
    >
      <div className={styles.innerContainer}>
        {/* Invisible Spacer to lock the exact width of the content at all times */}
        <div style={{ visibility: 'hidden', display: 'flex', alignItems: 'center', gap: '0.5rem', pointerEvents: 'none' }}>
          <span className={styles.label}>{label}</span>
          <ShoppingBag size={isSmall ? 16 : 18} />
        </div>

        {/* Absolute Container for all animations */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          {/* Idle Label */}
          <AnimatePresence>
            {btnState === 'idle' && (
              <motion.span
                className={styles.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* The Bag Icon - Always present during idle & animating, bounces on receive */}
          <AnimatePresence>
            {(btnState === 'idle' || btnState === 'animating') && (
              <motion.div
                className={styles.bagIconWrap}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  btnState === 'animating' 
                    ? { 
                        scale: [1, 1, 1, 1.3, 1], // Wait, wait, wait, POP, rest
                        rotate: [0, -5, 5, -10, 0], // Slight wobble as it receives
                      }
                    : { opacity: 1, scale: 1, rotate: 0 }
                }
                transition={
                  btnState === 'animating' 
                    ? { duration: 0.8, times: [0, 0.4, 0.6, 0.8, 1], ease: "easeInOut" }
                    : { duration: 0.3 }
                }
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
              >
                <ShoppingBag size={isSmall ? 16 : 18} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* The Flying T-Shirt */}
          <AnimatePresence>
            {btnState === 'animating' && (
              <motion.div
                className={styles.flyingShirt}
                initial={{ opacity: 0, scale: 0, x: -30, y: 10 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.5, 1, 0.8, 0],
                  x: [-40, -10, 20, 45], // Moves left to right towards the bag
                  y: [10, -30, -20, 0],  // Arcs upwards then down into bag
                  rotate: [-20, 0, 15, 45]
                }}
                transition={{ duration: 0.7, times: [0, 0.3, 0.7, 1], ease: [0.25, 1, 0.5, 1] }}
              >
                <ShirtIcon />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success State */}
          <AnimatePresence>
            {btnState === 'success' && (
              <motion.div
                className={styles.successWrap}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Check size={16} strokeWidth={3} className={styles.checkIcon} />
                <span className={styles.successLabel}>Added</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.button>
  );
}
