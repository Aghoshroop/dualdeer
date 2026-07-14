"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { getProducts, Product } from "@/lib/firebaseUtils";
import Magnetic from "../ui/Magnetic";
import { useCurrency } from "@/context/CurrencyContext";

const luxuryEase = [0.76, 0, 0.24, 1] as const;

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatPrice, renderPrice } = useCurrency();

  useEffect(() => {
    getProducts().then(prods => {
      const coreProducts = prods.filter(p => !p.isSeasonal && (!p.category || !p.category.toUpperCase().includes('SEASONAL')));
      setProducts(coreProducts.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <section className={styles.section} style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrapper}>
            <motion.span 
              className={styles.preTitle}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: luxuryEase }}
            >
              Signature Series
            </motion.span>
            <motion.h2 
              className={styles.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: luxuryEase, delay: 0.1 }}
            >
              THE CORE ARSENAL
            </motion.h2>
          </div>
          <Magnetic intensity={0.1}>
            <Link href="/shop" className={styles.shopAll}>Explore Collection</Link>
          </Magnetic>
        </div>

        <div className={`
          ${styles.grid} 
          ${!loading && products.length === 1 ? styles.singleItemGrid : ''}
          ${!loading && products.length === 2 ? styles.twoItemGrid : ''}
        `}>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))
          ) : products.length === 0 ? (
            <div style={{ color: 'var(--color-text)', textAlign: 'center', width: '100%', padding: '2rem', opacity: 0.5 }}>Core collection updating. Add products unflagged as Seasonal via Admin.</div>
          ) : (
            products.map((product, i) => (
                <motion.div 
                  key={product.id}
                  className={styles.card}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, ease: luxuryEase, delay: i * 0.15 }}
                >
                  <Link href={`/product/${product.slug}`} className={styles.imageBox}>
                    <img 
                      src={product.image}
                      alt={product.name}
                      className={styles.primaryImage}
                    />
                    <img 
                      src={(product.images && product.images.length > 1) ? product.images[1] : (product.images && product.images[0]) || product.image} 
                      alt={`${product.name} alternate view`} 
                      className={styles.hoverImage} 
                      loading="lazy"
                    />
                    
                    <div className={styles.badgeContainer}>
                       {product.mrp && product.mrp > product.price && (
                         <span className={styles.saleBadge}>SALE</span>
                       )}
                       {product.isNew && (
                         <span className={styles.newBadge}>NEW</span>
                       )}
                    </div>
                  </Link>

                  <div className={styles.info}>
                    <div className={styles.catRow}>
                      <span className={styles.categoryName}>Core Arsenal</span>
                      <div className={styles.rating} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={styles.star}
                              style={{ 
                                opacity: star <= Math.round(product.rating || 5) ? 1 : 0.2,
                                fontSize: '0.75rem'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span style={{ fontWeight: 800 }}>{(product.rating || 5.0).toFixed(1)}</span>
                      </div>
                    </div>
                    <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                      <h3 className={styles.name}>{product.name}</h3>
                    </Link>
                    <div className={styles.priceRow}>
                      {product.mrp && product.price > 0 && product.mrp > product.price && (
                        <span className={styles.mrp}>{renderPrice(product.mrp)}</span>
                      )}
                      <span className={styles.price}>{renderPrice(product.price === 0 && product.mrp ? product.mrp : product.price)}</span>
                    </div>

                    {product.colors && product.colors.length > 0 && (
                      <div className={styles.colorSwatches}>
                        {product.colors.map((color, idx) => (
                          <div key={idx} className={styles.colorCircle} style={{ backgroundColor: color }} title={color} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
