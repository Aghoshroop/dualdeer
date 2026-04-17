"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import AnimatedCartButton from "../ui/AnimatedCartButton";

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  mrp?: number;
  rating?: number;
  image: string;
  images?: string[];
  isNew?: boolean;
  colors?: string[];
}

export default function ProductGrid({ title: fallbackTitle }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    import('@/lib/firebaseUtils').then(({ getProducts, getContentBlock }) => {
      Promise.all([getProducts(), getContentBlock('home-season-title')]).then(([prods, titleBlock]) => {
        const seasonal = prods.filter(p => p.isSeasonal === true || (p.category && p.category.toUpperCase().includes('SEASONAL')));
        setProducts(seasonal as Product[]);
        if (titleBlock && titleBlock.title) {
          setTitle(titleBlock.title);
        }
        setLoading(false);
      });
    });
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.header}>
          <motion.div 
            className={styles.titleWrapper}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <span className={styles.preTitle}>CURATED SELECTION</span>
            <h2 className={styles.title}>{title}</h2>
          </motion.div>
          <Link href="/shop" className={styles.shopAll}>View Lookbook</Link>
        </div>

        <div className={styles.grid}>
          <AnimatePresence>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeletonCard} />
            ))
          ) : products.length === 0 ? (
            <div className={styles.emptyGrid}>New collection arriving soon.</div>
          ) : (
            products.slice(0, 4).map((product, i) => (
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

                  {/* Overlays */}
                  <div className={styles.quickActions}>
                      <button className={styles.actionCircle} aria-label="Quick View"><Eye size={16} /></button>
                      <button className={styles.actionCircle} aria-label="Add to Bag" onClick={(e) => { e.preventDefault(); addToCart({ ...product, size: 'M', quantity: 1 }); }}><ShoppingBag size={16} /></button>
                  </div>
                </Link>

                <div className={styles.info}>
                  <div className={styles.catRow}>
                    <span className={styles.categoryName}>Dual Collection</span>
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
                      <span className={styles.mrp}>₹{product.mrp.toLocaleString()}</span>
                    )}
                    <span className={styles.price}>₹{product.price.toLocaleString()}</span>
                  </div>

                  {/* Color Swatches */}
                  {product.colors && product.colors.length > 0 && (
                    <div className={styles.colorSwatches}>
                      {product.colors.map((color, idx) => (
                        <div key={idx} className={styles.colorCircle} style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  )}

                  {/* Optional Compact Action */}
                  <div className={styles.cardActions}>
                      <button
                        className={styles.buyNowBtn}
                        onClick={() => router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`)}
                      >
                        Buy Now
                      </button>
                      <AnimatedCartButton
                        size="small"
                        onAdd={() => addToCart({ ...product, size: 'M', quantity: 1 })}
                        label="+"
                      />
                  </div>
                </div>
              </motion.div>
            ))
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
