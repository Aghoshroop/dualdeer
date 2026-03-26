"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./ProductGrid.module.css";

import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp?: number;
  rating?: number;
  image: string;
}

export default function ProductGrid({ title: fallbackTitle }: { title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState(fallbackTitle);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('@/lib/firebaseUtils').then(({ getProducts, getContentBlock }) => {
      Promise.all([getProducts(), getContentBlock('home-season-title')]).then(([prods, titleBlock]) => {
        // Only load products marked explicitly for the season grid
        const seasonal = prods.filter(p => p.isSeasonal === true);
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
          <motion.h2 
            className={styles.title}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {title}
          </motion.h2>
          <Link href="/shop" className={styles.shopAll}>View Lookbook</Link>
        </div>

        <div className={styles.grid}>
          {loading ? (
            <div style={{ color: '#fff', textAlign: 'center', width: '100%', padding: '2rem' }}>Loading Season Essentials...</div>
          ) : products.length === 0 ? (
            <div style={{ color: '#fff', textAlign: 'center', width: '100%', padding: '2rem', opacity: 0.5 }}>New collection arriving soon.</div>
          ) : (
            products.slice(0, 4).map((product, i) => (
              <Link href={`/product/${product.id}`} key={product.id} style={{ textDecoration: 'none' }}>
                <motion.div 
                  className={styles.card}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <div className={styles.imageBox}>
                  <img 
                    src={product.image}
                    alt={product.name}
                    className={styles.image}
                  />
                </div>
                <div className={styles.info}>
                  <h3 className={styles.name}>{product.name}</h3>
                  <div className={styles.priceContainer}>
                    {product.mrp && product.mrp > product.price && (
                      <span className={styles.mrp}>₹{product.mrp.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                    )}
                    <span className={styles.price}>₹{product.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                  </div>
                  <div className={styles.rating}>
                    <span className={styles.star}>★</span> {product.rating || 5.0} <span>(Verified Client)</span>
                  </div>
                </div>
                </motion.div>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
