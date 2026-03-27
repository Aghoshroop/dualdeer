"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { getProducts, Product } from "@/lib/firebaseUtils";

interface RelatedProductsProps {
  category: string;
  excludeId?: string;
}

export default function RelatedProducts({ category, excludeId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) return;
    
    getProducts().then(prods => {
      // Find products matching the same category, excluding the current product itself
      const related = prods.filter(p => p.category === category && p.id !== excludeId);
      setProducts(related.slice(0, 4));
      setLoading(false);
    });
  }, [category, excludeId]);

  if (loading || products.length === 0) return null; // Hide the section if no related items found

  return (
    <section className={styles.section} style={{ paddingTop: '4rem', paddingBottom: '4rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.h2 
            className={styles.title}
            style={{ fontSize: '1.5rem', letterSpacing: '2px' }}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            MORE LIKE THIS
          </motion.h2>
          <Link href={`/shop?category=${encodeURIComponent(category)}`} className={styles.shopAll}>View Category</Link>
        </div>

        <div className={styles.grid}>
          {products.map((product, i) => (
            <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
              <motion.div 
                className={styles.premiumGlassCard}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className={styles.premiumImageBox}>
                  <img 
                    src={product.image}
                    alt={product.name}
                    className={styles.primaryImage}
                  />
                  <img 
                    src={product.images && product.images.length > 1 ? product.images[1] : product.image}
                    alt={`${product.name} alternate`}
                    className={styles.hoverImage}
                  />
                </div>
                <div className={styles.info} style={{ padding: '0 0.5rem 0.5rem' }}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <div className={styles.priceRow}>
                    {product.mrp && product.mrp > product.price && (
                      <span className={styles.mrp}>₹{product.mrp.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    )}
                    <span className={styles.price}>₹{product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className={styles.rating} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className={styles.star}
                          style={{ 
                            opacity: star <= Math.round(product.rating || 5) ? 1 : 0.2,
                            fontSize: '0.85rem'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontWeight: 800, marginLeft: '2px' }}>{(product.rating || 5.0).toFixed(1)}</span>
                    <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(Verified)</span>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
