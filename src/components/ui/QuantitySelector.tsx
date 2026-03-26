"use client";
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
import styles from './QuantitySelector.module.css';

interface QuantitySelectorProps {
  value: number;
  max?: number;
  min?: number;
  onChange: (newValue: number) => void;
  className?: string;
}

export default function QuantitySelector({
  value,
  max = 10,
  min = 1,
  onChange,
  className,
}: QuantitySelectorProps) {
  const [pulseKey, setPulseKey] = useState(0);
  const [splashKey, setSplashKey] = useState(0);
  const prevValueRef = useRef(value);
  const orbControls = useAnimationControls();

  const fillPercent = Math.min(((value - min) / (max - min)) * 100, 100);
  const isFull = value >= max;
  const isEmpty = value <= min;

  const handleHoverStart = useCallback(async () => {
    if (fillPercent <= 0) return;
    setSplashKey(k => k + 1);
    // Dip into the fluid — compress downward
    await orbControls.start({
      y: 8,
      scale: 0.88,
      transition: { duration: 0.18, ease: [0.55, 0, 1, 0.45] }
    });
    // Bounce back up past resting — spring overshoot
    orbControls.start({
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 420,
        damping: 12,
        mass: 0.6
      }
    });
  }, [fillPercent, orbControls]);

  const handleHoverEnd = useCallback(() => {
    orbControls.start({
      y: 0,
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 }
    });
  }, [orbControls]);

  const increment = useCallback(() => {
    if (value < max) {
      onChange(value + 1);
      setPulseKey(k => k + 1);
      prevValueRef.current = value + 1;
    }
  }, [value, max, onChange]);

  const decrement = useCallback(() => {
    if (value > min) {
      onChange(value - 1);
      setPulseKey(k => k + 1);
      prevValueRef.current = value - 1;
    }
  }, [value, min, onChange]);

  return (
    <div
      className={`${styles.selector} ${className || ''}`}
      aria-label="Quantity Selector"
      onMouseEnter={handleHoverStart}
      onMouseLeave={handleHoverEnd}
    >

      {/* The Energy Bar */}
      <div className={`${styles.energyBar} ${isFull ? styles.isFull : ''}`}>

        {/* The Violet Fill Layer */}
        <motion.div
          className={styles.fillLayer}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.55, ease: [0.25, 1, 0.5, 1] }}
          aria-hidden="true"
        />

        {/* The Orb — rides the leading edge of the fill */}
        {fillPercent > 0 && (
          <motion.div
            className={`${styles.orb} ${isFull ? styles.orbFull : ''}`}
            animate={orbControls}
            style={{
              left: `calc(${fillPercent}% - 12px)`,
              scale: isFull ? 1.1 : 1,
            }}
            aria-hidden="true"
          >
            {/* Tap pulse ring */}
            <motion.div
              key={pulseKey}
              className={styles.orbRing}
              initial={{ opacity: 0.8, scale: 1 }}
              animate={{ opacity: 0, scale: 2.2 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
            {/* Splash ring — fires on hover dip */}
            <motion.div
              key={`splash-${splashKey}`}
              className={styles.splashRing}
              initial={{ opacity: 0.6, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 3.5, y: -6 }}
              transition={{ duration: 0.55, ease: [0.2, 0, 0.4, 1] }}
            />
          </motion.div>
        )}

        {/* Decrement */}
        <button
          className={styles.decrementBtn}
          onClick={decrement}
          disabled={isEmpty}
          aria-label="Decrease quantity"
        >
          −
        </button>

        <div className={styles.divider} aria-hidden="true" />

        {/* Quantity Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={pulseKey}
            className={styles.valueDisplay}
            initial={{ opacity: 0.3, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            aria-live="polite"
            aria-atomic="true"
          >
            {String(value).padStart(2, '0')}
          </motion.div>
        </AnimatePresence>

        <div className={styles.divider} aria-hidden="true" />

        {/* Increment */}
        <button
          className={styles.incrementBtn}
          onClick={increment}
          disabled={isFull}
          aria-label="Increase quantity"
        >
          +
        </button>

      </div>

      {/* State Label */}
      <div className={`${styles.label} ${isFull ? styles.maxReached : ''}`}>
        {isFull ? 'MAXIMUM CAPACITY' : `${value} / ${max} UNITS`}
      </div>

    </div>
  );
}
