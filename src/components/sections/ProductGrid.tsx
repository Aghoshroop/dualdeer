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
import { onAuthStateChanged } from 'firebase/auth';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import PremiumProductCard from '../product/PremiumProductCard';
import ProductCard from '../product/ProductCard';

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
  isPremium?: boolean;
  colors?: string[];
  isSoldOut?: boolean;
  stock?: number;
}

export default function ProductGrid({ title: fallbackTitle }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    import('@/lib/firebase').then(({ auth }) => {
      onAuthStateChanged(auth, (user) => setCurrentUser(user));
    });
  }, []);
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
            Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={`skeleton-${i}`} />
            ))
          ) : products.length === 0 ? (
            <div className={styles.emptyGrid}>New collection arriving soon.</div>
          ) : (
            products.slice(0, 4).map((product, i) => (
              product.isPremium ? (
                <PremiumProductCard 
                  key={product.id}
                  product={product}
                  i={i}
                  renderPrice={renderPrice}
                />
              ) : (
              <ProductCard
                key={product.id}
                product={product}
                i={i}
                renderPrice={renderPrice}
              />
              )
            ))
          )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
