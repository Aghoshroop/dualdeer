"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "./page.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";

export default function SpeedSuitsIndiaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    import("@/lib/firebaseUtils").then(({ getProducts }) => {
      getProducts().then((allProducts) => {
        const speedsuits = allProducts.filter(
          (p) =>
            p.category?.toLowerCase() === "speedsuit" ||
            p.category?.toLowerCase() === "speedsuits" ||
            ((p as any).tags || []).some((t: string) => t.toLowerCase().includes("speedsuit"))
        );
        setProducts(speedsuits);
        setLoading(false);
      });
    });
  }, []);

  const fadeUpBlur: any = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } }
  };

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className={styles.main}>
      {/* 1. Cinematic Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroImageWrapper}>
          <motion.img
            src="/speedsuitgang.jpeg"
            className={styles.heroImage}
            alt="High-Performance SpeedSuits India"
            initial={{ scale: 1.05 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className={styles.heroOverlay}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroTitleWrapper}>
            <motion.h1
              className={styles.heroTitle}
              initial="hidden"
              animate="visible"
              variants={fadeUpBlur}
            >
              SPEEDSUITS
            </motion.h1>
            <motion.h1
              className={styles.heroTitle}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.15 } }
              }}
            >
              IN INDIA
            </motion.h1>
          </div>
          <motion.p
            className={styles.heroSubtitle}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 20, filter: "blur(5px)" },
              visible: { opacity: 0.9, y: 0, filter: "blur(0px)", transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 } },
            }}
          >
            The Ultimate Fusion of Elite Performance & Luxury Craftsmanship
          </motion.p>
        </div>
      </section>

      {/* 2. Dynamic Product Showcase */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <motion.h2 className={styles.sectionSubtitle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>The Collection</motion.h2>
          <motion.h3 className={styles.sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>Aesthetic Meets Aerodynamics</motion.h3>
        </div>

        {loading ? (
          <div className={styles.zeroState}>Loading premium gear...</div>
        ) : products.length === 0 ? (
          <div className={styles.zeroState}>New SpeedSuits arriving shortly limitied drop.</div>
        ) : (
          <div className={styles.productGrid}>
            {products.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link href={`/product/${product.id}`} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </div>
                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <span className={styles.productPrice}>₹{product.price.toLocaleString()}</span>
                    <button
                      className={styles.buyBtn}
                      onClick={(e) => {
                        e.preventDefault();
                      addToCart({ ...product, id: product.id || '', size: "M", quantity: 1 });
                      }}
                    >
                      Pre-Order / Buy Now
                    </button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Performance & Luxury Experience Sections */}
      <section className={styles.darkSection}>
        <div className={styles.section}>
          {/* Performance */}
          <div className={styles.splitSection}>
            <motion.div className={styles.splitImage} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img src="/speedsuit.png" alt="SpeedSuit Compression Performance" />
            </motion.div>
            <motion.div className={styles.splitContent} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className={styles.splitTitle}>Engineered for Greatness</h2>
              <p className={styles.splitText}>
                The DualDeer SpeedSuit redefines elite compression. We heavily researched biomechanics to create structural zones that boost blood flow, increase oxygen delivery, and improve muscle recovery speed in real-time. Whether on the track or lifting limits at the gym, experience zero kinetic restrictions.
              </p>
            </motion.div>
          </div>

          {/* Luxury Craft */}
          <div className={`${styles.splitSection} ${styles.splitReverse}`}>
            <motion.div className={styles.splitImage} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <img src="/speedsuit-luxury.jpg" alt="Luxury Craftsmanship" />
            </motion.div>
            <motion.div className={styles.splitContent} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className={styles.splitTitle}>Absolute Precision Artistry</h2>
              <p className={styles.splitText}>
                Functionless form is obsolete. Each thread is selected and precisely woven to withstand extreme wear while retaining an architectural, striking silhouette. Flatlock, chafe-free seams guarantee invisible transitions, complemented by deep, rich, hyper-premium textile finishes that command the room. 
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. Why DualDeer */}
      <section className={styles.section} style={{ textAlign: "center", maxWidth: "800px" }}>
        <motion.h2 className={styles.sectionTitle} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          Why DualDeer SpeedSuits?
        </motion.h2>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <p style={{ fontSize: "clamp(14px, 4vw, 1.2rem)", lineHeight: "1.8", opacity: 0.8, marginTop: "2rem" }}>
            Mass-produced activewear dilutes identity. DualDeer strictly designs for the 1%. In India's rising luxury activewear scene, our SpeedSuits act as an undeniable badge of physical authority. When you wear a DualDeer signature piece, you immediately step into an exclusive tier of uncompromised aesthetic dominance.
          </p>
        </motion.div>
      </section>

      {/* 5. Testimonials */}
      <section className={styles.darkSection}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Elite Endorsements</h2>
          </div>
          <div className={styles.testimonialGrid}>
            {[
              { text: "The fit is absolutely insane. It feels painted on, yet restricts nothing. By far the best SpeedSuit available in India today.", author: "Arjun M., Pro Athlete" },
              { text: "It's rare to find gear that actually looks like high fashion but performs like tactical equipment. DualDeer cracked it.", author: "Karan S., Fitness Model" },
              { text: "I threw away my international brand gear. The cooling technology and material luxury in this compression suit are unmatched.", author: "Ravi V., Endurance Coach" }
            ].map((test, i) => (
              <motion.div 
                key={i}
                className={styles.testimonialCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <p className={styles.quote}>"{test.text}"</p>
                <div className={styles.author}>{test.author}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
