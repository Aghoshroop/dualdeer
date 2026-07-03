"use client";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";
import { useEffect, useState } from "react";
import { Eye, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import AnimatedCartButton from "../ui/AnimatedCartButton";
import { useCurrency } from "@/context/CurrencyContext";

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
  isSoldOut?: boolean;
  stock?: number;
}

export default function ProductGrid({ title: fallbackTitle }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();
  const { formatPrice, renderPrice } = useCurrency();

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
          {/* Promo Banner */}
          {!loading && products.some(p => p.name.toLowerCase().includes('greninja') || p.name.toLowerCase().includes('blue horizon')) && (
            <div style={{
              gridColumn: '1 / -1',
              background: 'linear-gradient(45deg, rgba(var(--foreground-rgb), 0.05), transparent)',
              border: '1px solid var(--color-border)',
              borderRadius: '12px',
              padding: '1.5rem',
              marginBottom: '1rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '1px', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>LIMITED TIME OFFER</span>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Unlock the DualDeer Duo Pack</h3>
              <p style={{ margin: '0.5rem 0 0 0', opacity: 0.8, fontSize: '0.9rem', maxWidth: '500px' }}>
                Add 1x Greninja and 1x Blue Horizon to your cart and automatically get the bundle for just {renderPrice(1549)}. No code needed.
              </p>
            </div>
          )}
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
                    loading="lazy"
                  />
                  
                  {/* Badge system */}
                  <div className={styles.badgeContainer}>
                     {product.mrp && product.mrp > product.price && (
                       <span className={styles.saleBadge}>SALE</span>
                     )}
                     {product.isNew && (
                       <span className={styles.newBadge}>NEW</span>
                     )}
                     {(product.name.toLowerCase().includes('greninja') || product.name.toLowerCase().includes('blue horizon')) && (
                       <span style={{ padding: '4px 8px', background: 'var(--color-primary)', color: 'var(--color-background)', fontSize: '0.65rem', fontWeight: 700, borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                         Duo Pack Eligible
                       </span>
                     )}
                  </div>

                  {/* Overlays */}
                  <div className={styles.quickActions}>
                      <button className={styles.actionCircle} aria-label="Quick View"><Eye size={16} /></button>
                      <button 
                        className={styles.actionCircle} 
                        aria-label="Add to Bag" 
                        onClick={(e) => { 
                          e.preventDefault(); 
                          if (!product.isSoldOut && product.stock !== 0) {
                            addToCart({ ...product, size: 'M', quantity: 1 }); 
                          }
                        }}
                        style={{ opacity: (product.isSoldOut || product.stock === 0) ? 0.5 : 1, cursor: (product.isSoldOut || product.stock === 0) ? 'not-allowed' : 'pointer' }}
                      ><ShoppingBag size={16} /></button>
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
                    {product.mrp && product.price > 0 && product.mrp > product.price && (
                      <span className={styles.mrp}>{renderPrice(product.mrp)}</span>
                    )}
                    <span className={styles.price}>{renderPrice(product.price === 0 && product.mrp ? product.mrp : product.price)}</span>
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
                        onClick={() => {
                          if (!product.isSoldOut && product.stock !== 0) {
                            router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`);
                          }
                        }}
                        disabled={product.isSoldOut || product.stock === 0}
                        style={{ opacity: (product.isSoldOut || product.stock === 0) ? 0.5 : 1, cursor: (product.isSoldOut || product.stock === 0) ? 'not-allowed' : 'pointer' }}
                      >
                        {(product.isSoldOut || product.stock === 0) ? 'Stock Out' : 'Buy Now'}
                      </button>
                      <AnimatedCartButton
                        size="small"
                        onAdd={() => addToCart({ ...product, size: 'M', quantity: 1 })}
                        label={(product.isSoldOut || product.stock === 0) ? 'X' : '+'}
                        disabled={product.isSoldOut || product.stock === 0}
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
