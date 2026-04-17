"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/lib/firebaseUtils";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts().then(prods => {
      // Find products that are NOT exclusively part of the seasonal home grid
      const coreProducts = prods.filter(p => !p.isSeasonal && (!p.category || !p.category.toUpperCase().includes('SEASONAL')));
      setProducts(coreProducts.slice(0, 4));
      setLoading(false);
    });
  }, []);

  return (
    <section className={styles.section} style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            THE CORE ARSENAL
          </motion.h2>
          <Link href="/shop" className={styles.shopAll}>View All Profiles</Link>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ color: 'var(--color-text)', textAlign: 'center', width: '100%', padding: '2rem' }}>Loading the Archives...</div>
          ) : products.length === 0 ? (
            <div style={{ color: 'var(--color-text)', textAlign: 'center', width: '100%', padding: '2rem', opacity: 0.5 }}>Core collection updating. Add products unflagged as Seasonal via Admin.</div>
          ) : (
            products.map((product, i) => (
              <motion.div 
                key={product.id}
                className={styles.card}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
              >
                <Link href={`/product/${product.slug}`} className={styles.imageBox}>
                  {/* Primary Image */}
                  <img 
                    src={product.image}
                    alt={product.name}
                    className={styles.primaryImage}
                  />
                  {/* Hover Image */}
                  <img 
                    src={(product.images && product.images.length > 1) ? product.images[1] : (product.images && product.images[0]) || product.image} 
                    alt={`${product.name} alternate view`} 
                    className={styles.hoverImage} 
                  />
                  
                  {/* Badge system */}
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
                    {product.mrp && product.mrp > product.price && (
                      <span className={styles.mrp}>₹{product.mrp.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    )}
                    <span className={styles.price}>₹{product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>

                  {/* Color Swatches */}
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
