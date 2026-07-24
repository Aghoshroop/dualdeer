"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './EliteProductCard.module.css';

interface EliteProductCardProps {
  product: any;
  i: number;
  renderPrice: (price: number) => string;
}

export default function EliteProductCard({ product, i, renderPrice }: EliteProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const images = (product.images && product.images.length > 0)
    ? (product.images.includes(product.image) ? product.images : [product.image, ...product.images])
    : [product.image];
    
  const hoverImage = images.length > 1 ? images[1] : images[0];

  const handleAcquire = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isSoldOut && product.stock !== 0) {
      addToCart({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image, size: 'M', quantity: 1 });
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    }
  };

  return (
    <motion.div 
      className={styles.eliteCardWrapper}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.9, delay: (i % 4) * 0.1, ease: [0.25, 1, 0.5, 1] }}
    >
      <Link href={`/product/${product.slug}`} className={styles.eliteLink}>
        <div className={styles.imageContainer}>
          <motion.img 
            src={product.image} 
            alt={product.name}
            className={styles.primaryImage}
            animate={{ 
              scale: isHovered ? 1.05 : 1, 
              filter: isHovered ? 'brightness(0.9) grayscale(0.2)' : 'brightness(1) grayscale(0)' 
            }}
            transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
          />
          {images.length > 1 && (
            <motion.img 
              src={hoverImage} 
              alt={`${product.name} detail`}
              className={styles.secondaryImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
            />
          )}

          <div className={styles.noiseOverlay} />
          <div className={styles.darkGradient} />
          <div className={styles.luxuryFrame} />
          
          <div className={styles.contentOverlay}>
            <div className={styles.topInfo}>
              <span className={styles.editorialBadge}>PRIVATE CLIENT</span>
            </div>

            <motion.div 
              className={styles.bottomInfo}
              animate={{ y: isHovered ? 0 : 20 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
            >
              <h3 className={styles.productName}>{product.name}</h3>
              
              <div className={styles.actionRow}>
                <span className={styles.price}>{renderPrice(product.price)}</span>
                <AnimatePresence>
                  {isHovered && (
                    <motion.button 
                      className={styles.acquireBtn}
                      onClick={handleAcquire}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      disabled={product.isSoldOut || product.stock === 0}
                    >
                      {justAdded ? 'ACQUIRED' : (product.isSoldOut || product.stock === 0 ? 'UNAVAILABLE' : 'RESERVE PIECE')}
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
