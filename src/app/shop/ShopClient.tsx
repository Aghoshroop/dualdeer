"use client";
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ShopPage.module.css';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import React from 'react';

// UI Interaction Sound Generator (No external assets required)
const playInteractionSound = (type: 'hover' | 'click' | 'ring') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'ring') {
      // Cash register / notification bell ring
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Higher harmonic for bright metallic chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1600, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {}
};

interface ShopClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialBackdrop: string;
  initialHeroUrl: string;
  initialHeroText: string;
}

const filters = ["ALL", "T-SHIRTS", "SPEEDSUITS", "NEW ARRIVALS"];

export default function ShopClient({ initialProducts, initialHeroUrl, initialHeroText }: ShopClientProps) {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#fff', background: '#050505', minHeight: '100vh' }}>Initializing Elite Experience...</div>}>
      <ShopEngine initialProducts={initialProducts} initialHeroUrl={initialHeroUrl} initialHeroText={initialHeroText} />
    </Suspense>
  );
}

function ShopEngine({ initialProducts, initialHeroUrl, initialHeroText }: any) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState("ALL");
  const { addToCart } = useCart();
  const { formatPrice } = useCurrency();

  // Process live products
  const displayProducts = initialProducts.filter((p: any) => {
    if (activeFilter === "NEW ARRIVALS" && !p.isNew) return false;
    if (activeFilter !== "ALL" && activeFilter !== "NEW ARRIVALS") {
      const searchStr = `${p.category || ''} ${p.name || ''}`.toLowerCase();
      if (activeFilter === "T-SHIRTS" && !searchStr.includes("t-shirt") && !searchStr.includes("tshirt") && !searchStr.includes("tee")) return false;
      if (activeFilter === "SPEEDSUITS" && !searchStr.includes("speedsuit")) return false;
    }
    return true;
  });

  return (
    <div className={styles.shopContainer}>
      
      {/* 1. Ultra-Cinematic Dark Hero Section */}
      <section className={styles.heroSection}>
        <img 
          src={initialHeroUrl || "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2600&auto=format&fit=crop"} 
          alt="Collection" 
          className={styles.heroImage} 
        />
        <div className={styles.heroOverlay} />
        
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <span className={styles.heroSubtitle}>Dual Deer Collection</span>
          <h1 className={styles.heroTitle}>{initialHeroText || "THE ARSENAL"}</h1>
        </motion.div>
      </section>

      {/* 2. Floating Filter Pills */}
      <section className={styles.filterSection}>
        <div className={styles.filterGlass}>
          {filters.map(filter => (
            <button 
              key={filter}
              className={`${styles.filterBtn} ${activeFilter === filter ? styles.active : ''}`}
              onMouseEnter={() => playInteractionSound('hover')}
              onClick={() => {
                playInteractionSound('click');
                setActiveFilter(filter);
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Products Showcase */}
      <section className={styles.productsSection}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeFilter}
            className={styles.galleryGrid}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            {displayProducts.length === 0 ? (
              <div className={styles.emptyState}>Archive is currently empty for this category.</div>
            ) : (
              displayProducts.map((product: any, i: number) => (
                <motion.div 
                  key={product.id} 
                  className={styles.galleryCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  onMouseEnter={() => playInteractionSound('hover')}
                >
                  <Link href={`/product/${product.slug}`} className={styles.imageContainer}>
                    <img src={product.image} alt={product.name} className={styles.productImg} />
                    {product.images && product.images.length > 1 && (
                      <img src={product.images[1]} alt={product.name} className={styles.imageHover} />
                    )}
                    
                    <div className={styles.badgeContainer}>
                      {product.mrp && product.mrp > product.price && <span className={`${styles.badge} ${styles.saleBadge}`}>SALE</span>}
                      {product.isNew && <span className={`${styles.badge} ${styles.newBadge}`}>NEW</span>}
                    </div>
                  </Link>

                  <div className={styles.productMeta}>
                    <span className={styles.brandLabel}>Dual Deer</span>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 className={styles.productName}>{product.name}</h3>
                    </Link>
                    
                    <div className={styles.productPrice}>
                      {product.mrp && product.mrp > product.price && <span style={{ textDecoration: 'line-through', opacity: 0.5, marginRight: '10px' }}>{formatPrice(product.mrp)}</span>}
                      <span style={{ fontWeight: 700 }}>{formatPrice(product.price)}</span>
                    </div>

                    <div className={styles.cardActions}>
                      <button 
                        className={`${styles.actionBtn} ${styles.addBtn}`}
                        onMouseEnter={() => playInteractionSound('hover')}
                        onClick={(e) => {
                          e.preventDefault();
                          playInteractionSound('ring');
                          addToCart({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image, size: 'M', quantity: 1 });
                        }}
                      >
                        Add to Bag
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.buyBtn}`}
                        onMouseEnter={() => playInteractionSound('hover')}
                        onClick={(e) => {
                          e.preventDefault();
                          playInteractionSound('click');
                          router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>

                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </section>

    </div>
  );
}
