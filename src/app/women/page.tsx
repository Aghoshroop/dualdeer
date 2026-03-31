"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./WomenPage.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function WomenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    import("@/lib/firebaseUtils").then(({ getProducts }) => {
      getProducts().then((allProducts) => {
        const womenProducts = allProducts.filter(
          (p) => {
            const catStr = p.category?.toLowerCase() || '';
            const nameStr = p.name?.toLowerCase() || '';
            const tags = (p as any).tags || [];
            
            const catMatch = catStr.includes("women");
            const nameMatch = nameStr.includes("women");
            const tagMatch = tags.some((t: string) => t.toLowerCase().includes("women"));
            
            // Explicitly reject if it only says 'men' and not 'women' (though includes('women') resolves most of this)
            const explicitlyMen = (catStr === "men" || nameStr === "men") && !catMatch && !nameMatch;
            
            return (catMatch || nameMatch || tagMatch) && !explicitlyMen;
          }
        );
        
        setProducts(womenProducts); // Strictly set to only matched items, never default to generic catalog
        setLoading(false);
      });
    });
  }, []);

  const slideUp: any = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: "easeOut" } }
  };

  return (
    <main className={styles.main}>
      {/* Ambient Aurora Glow */}
      <div className={styles.auroraGlow}>
        <div className={styles.aurora1} />
        <div className={styles.aurora2} />
        <div className={styles.aurora3} />
      </div>

      {/* 1. Cinematic Hero Section */}
      <section className={styles.hero}>
        <motion.img
          src="https://images.unsplash.com/photo-1518611012118-29a8d63ee0c2?q=80&w=2600&auto=format&fit=crop"
          className={styles.heroImage}
          alt="Women's Exclusive Collection DualDeer"
          initial={{ scale: 1.15, filter: "brightness(0.5) contrast(1.1)" }}
          animate={{ scale: 1, filter: "brightness(0.65) contrast(1.1) sepia(0.2) hue-rotate(300deg) saturate(1.4)" }}
          transition={{ duration: 2, ease: "easeOut" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2000&auto=format&fit=crop';
          }}
        />
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <motion.h1
            className={styles.heroTitle}
            initial="hidden"
            animate="visible"
            variants={slideUp}
          >
            Fierce & Flawless
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            The Ultimate Women's Performance Archive
          </motion.p>
        </div>
      </section>

      {/* 2. Motivational Hook */}
      <section className={styles.motivationSection}>
        <motion.h2 
            className={styles.motivationTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={slideUp}
        >
            Resilience. Grace. Supremacy.
        </motion.h2>
        <motion.p 
            className={styles.motivationText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            Limits are merely an illusion. DualDeer Women's line is engineered specifically for visionaries—those who shape their own destiny. 
            These are precision-crafted garments that move seamlessly with your body while withstanding extreme exertion. 
            Claim your power. Radiate your absolute best form.
        </motion.p>
      </section>

      {/* 3. Infinite Bento Box Grid */}
      <section className={styles.gridSection}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "1.2rem", padding: "4rem" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { repeat: Infinity, duration: 1, repeatType: "reverse" } }}>
                Curating the collection...
            </motion.div>
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "1.2rem", padding: "4rem" }}>
            The vault is currently empty. More drops incoming.
          </div>
        ) : (
          <div className={styles.bentoGrid}>
            <AnimatePresence>
            {products.map((product, i) => (
              <motion.div
                key={product.id || i}
                className={styles.bentoItem}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.8, delay: (Math.min(i % 8, 4)) * 0.1, ease: "easeOut" }}
                onClick={() => router.push(`/product/${product.id}`)}
              >
                <img 
                    src={product.image || '/speedsuit.png'} 
                    alt={product.name} 
                    className={styles.bentoImg} 
                />
                <div className={styles.bentoOverlay}>
                  <h3 className={styles.bentoName}>{product.name}</h3>
                  <span className={styles.bentoPrice}>
                    {product.mrp && product.mrp > product.price && (
                      <del style={{marginRight: '8px', opacity: 0.5, fontSize: '0.85em'}}>₹{product.mrp.toLocaleString()}</del>
                    )}
                    ₹{product.price.toLocaleString()}
                  </span>
                  <button 
                    className={styles.bentoAction}
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart({ ...product, id: product.id || '', size: "M", quantity: 1 });
                    }}
                  >
                    Quick Add
                  </button>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </section>
    </main>
  );
}
