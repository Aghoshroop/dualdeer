"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ChevronRight, Play, Pause } from "lucide-react";
import styles from "./SeasonalShowcaseSlider.module.css";
import { useCart } from "@/context/CartContext";

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  mrp?: number;
  image: string;
  images?: string[];
  category?: string;
  isSeasonal?: boolean;
}

export default function SeasonalShowcaseSlider({ title: fallbackTitle = "Seasonal Collection" }: { title?: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    import('@/lib/firebaseUtils').then(({ getProducts, getContentBlock }) => {
      Promise.all([getProducts(), getContentBlock('home-season-title')]).then(([prods, titleBlock]) => {
        const seasonal = prods.filter(p => p.isSeasonal === true || (p.category && p.category.toUpperCase().includes('SEASONAL')));
        
        // Ensure we have enough products to loop through properly
        // If not enough, duplicate them so the slider works
        let displayProducts = seasonal as Product[];
        if (displayProducts.length > 0 && displayProducts.length < 4) {
             displayProducts = [...displayProducts, ...displayProducts.map(p => ({...p, id: p.id + '-dup'}))];
        }
        
        setProducts(displayProducts);
        if (titleBlock && titleBlock.title) {
          setTitle(titleBlock.title);
        }
        setLoading(false);
      }).catch((e) => {
        console.error("Failed to load seasonal data:", e);
        setLoading(false);
      });
    });
  }, []);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % products.length);
  }, [products.length]);

  useEffect(() => {
    if (!isPlaying || products.length <= 1) return;
    const interval = setInterval(() => {
      handleNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, products.length, handleNext]);

  const activeProduct = products[activeIndex];
  const prevActiveRef = useRef<Product | null>(null);
  
  useEffect(() => {
    prevActiveRef.current = activeProduct;
  }, [activeProduct]);

  if (loading) {
    return <div className={styles.loadingState}>LOADING COLLECTION...</div>;
  }

  if (products.length === 0) {
    return null; // hide section if no products
  }

  // Calculate preview products (next 3 products)
  const previewProducts = [];
  for (let i = 1; i <= Math.min(3, products.length - 1); i++) {
    previewProducts.push(products[(activeIndex + i) % products.length]);
  }

  const easeTransitions: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <section>
      {/* --- DESKTOP VIEW --- */}
      <div className={`${styles.container} ${styles.desktopView}`}>
        <AnimatePresence>
          <motion.div
            key={activeProduct.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1.2, ease: easeTransitions }}
            className={styles.activeBackground}
            layoutId={`image-morph-${activeProduct.id}`}
          >
            <img src={activeProduct.image} alt={activeProduct.name} className={styles.activeImage} />
          </motion.div>
        </AnimatePresence>

        <div className={styles.overlay} />

        <div className={styles.contentContainer}>
          <div className={styles.textContent}>
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeProduct.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.8, ease: easeTransitions }}
              >
                <span className={styles.categorySpan}>{title} / {activeProduct.category || "Featured"}</span>
                <h2 className={styles.title}>{activeProduct.name}</h2>
                <div className={styles.price}>₹{activeProduct.price?.toLocaleString()}</div>
                <Link href={`/product/${activeProduct.slug || activeProduct.id.replace('-dup', '')}`} className={styles.shopButton}>
                  Shop Now
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div className={styles.controls}>
          <button className={styles.navButton} onClick={() => setIsPlaying(!isPlaying)} aria-label="Play/Pause">
             {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button className={styles.navButton} onClick={handleNext} aria-label="Next Product">
             <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.previewStrip}>
          <AnimatePresence mode="popLayout">
            {previewProducts.map((p, index) => {
              const isDemoted = prevActiveRef.current?.id === p.id;
              return (
                <motion.div
                  key={p.id}
                  layoutId={isDemoted ? undefined : `image-morph-${p.id}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: easeTransitions }}
                  className={styles.previewCard}
                  onClick={() => {
                     setActiveIndex(products.indexOf(p));
                     setIsPlaying(false);
                  }}
                >
                  <img src={p.image} alt={p.name} className={styles.previewImage} />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className={styles.mobileView}>
         <div className={styles.mobileHeader}>
            <div className={styles.mobileSubtitle}>Curated Selection</div>
            <h2 className={styles.mobileTitle}>{title}</h2>
         </div>
         <div className={styles.mobileSlider}>
            {products.filter(p => !p.id.endsWith('-dup')).map((product) => (
               <div key={product.id} className={styles.mobileCard}>
                  <div className={styles.mobileImageWrapper}>
                     <img src={product.image} alt={product.name} className={styles.mobileImage} />
                  </div>
                  <div className={styles.mobileInfo}>
                     <h3 className={styles.mobileName}>{product.name}</h3>
                     <div className={styles.mobilePrice}>₹{product.price?.toLocaleString()}</div>
                     <Link href={`/product/${product.slug}`} className={styles.mobileShopBtn}>
                        Shop Now
                     </Link>
                  </div>
               </div>
            ))}
         </div>
      </div>
    </section>
  );
}
