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
import PremiumProductCard from '../product/PremiumProductCard';
import ProductCard from '../product/ProductCard';

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
              THE ESSENTIALS
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
        </div>
      </div>
    </section>
  );
}
