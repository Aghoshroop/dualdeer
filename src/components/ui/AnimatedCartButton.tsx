"use client";
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import styles from './AnimatedCartButton.module.css';

interface AnimatedCartButtonProps {
  onAdd: () => void;
  className?: string;
  label?: string;
  /** small = compact card variant, default = full-width PDP variant */
  size?: 'small' | 'default';
}

export default function AnimatedCartButton({
  onAdd,
  className,
  label = 'Add to Cart',
  size = 'default',
}: AnimatedCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) return;
    onAdd();
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2200);
  }, [isAdded, onAdd]);

  return (
    <button
      className={`${styles.btn} ${size === 'small' ? styles.small : ''} ${isAdded ? styles.added : ''} ${className || ''}`}
      onClick={handleClick}
      disabled={isAdded}
      aria-label={isAdded ? 'Added to cart' : label}
    >
      {/* Bag icon — slides out left on add */}
      <motion.span
        className={styles.iconWrap}
        animate={isAdded ? { x: -36, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.25, ease: [0.55, 0, 1, 0.45] }}
      >
        <ShoppingBag size={size === 'small' ? 14 : 16} />
      </motion.span>

      {/* Label — slides left on add */}
      <motion.span
        className={styles.label}
        animate={isAdded ? { x: -16, opacity: 0 } : { x: 0, opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.55, 0, 1, 0.45] }}
      >
        {label}
      </motion.span>

      {/* Confirmation — slides in from right */}
      <motion.span
        className={styles.confirm}
        initial={{ x: 28, opacity: 0 }}
        animate={isAdded ? { x: 0, opacity: 1 } : { x: 28, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1], delay: isAdded ? 0.12 : 0 }}
      >
        ✓ Added
      </motion.span>
    </button>
  );
}
