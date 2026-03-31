"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./MenPage.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function MenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    import("@/lib/firebaseUtils").then(({ getProducts }) => {
      getProducts().then((allProducts) => {
        const menProducts = allProducts.filter(
          (p) => {
            const catMatch = p.category?.toLowerCase().includes("men") && !p.category?.toLowerCase().includes("women");
            const nameMatch = p.name?.toLowerCase().includes("men") && !p.name?.toLowerCase().includes("women");
            const tagMatch = (p as any).tags?.some((t: string) => t.toLowerCase().includes("men") && !t.toLowerCase().includes("women"));
            return catMatch || nameMatch || tagMatch;
          }
        );
        
        setProducts(menProducts);
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
          src="/speedsuitgang.jpeg"
          className={styles.heroImage}
          alt="Men's Exclusive Collection DualDeer"
          initial={{ scale: 1.15, filter: "brightness(0.5) contrast(1.1)" }}
          animate={{ scale: 1, filter: "brightness(0.6) contrast(1.2)" }}
          transition={{ duration: 2, ease: "easeOut" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=2600&auto=format&fit=crop';
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
            Built for Power
          </motion.h1>
          <motion.p
            className={styles.heroSubtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.9, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            The Ultimate Men's Performance Archive
          </motion.p>
        </div>
      </section>

      {/* 2. Motivational Hook */}
      <section className={styles.motivationSection}>
        <motion.h2 
            className={styles.motivationTitle}
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={slideUp}
        >
            Discipline. Power. Aesthetic.
        </motion.h2>
        <motion.p 
            className={styles.motivationText}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
        >
            Average is an absolute insult. DualDeer Menswear is architected specifically for the outliers—the top 1%. 
            These are precision-engineered garments that aggressively mold to your physique and withstand extreme kinetic exertion. 
            Do not compromise your potential. Elevate your presence immediately.
        </motion.p>
      </section>

      {/* 3. Infinite Bento Box Grid */}
      <section className={styles.gridSection}>
        {loading ? (
          <div style={{ textAlign: "center", color: "var(--color-text-muted)", fontSize: "1.2rem", padding: "4rem" }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { repeat: Infinity, duration: 1, repeatType: "reverse" } }}>
                Forging the collection...
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
