"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "@/app/speedsuits-india/page.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";

export default function CompressionClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <main className={styles.main}>
      <section className={styles.hero} style={{ background: '#111', minHeight: '60vh' }}>
        <div className={styles.heroContent}>
          <motion.h1 
            className={styles.heroTitle} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
            style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}
          >
            MENS COMPRESSION T-SHIRTS
          </motion.h1>
          <motion.p className={styles.heroSubtitle} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1, delay: 0.3 }}>
            Tactical activewear strategically engineered to stabilize muscular geometry, accelerate recovery, and deliver profound athletic dominance.
          </motion.p>
        </div>
      </section>

      <section className={styles.section} style={{ maxWidth: '1000px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>The Science of High-End Compression</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              Finding a truly exceptional <Link href="/compression-tshirt-men" style={{ textDecoration: 'underline', color: 'inherit' }}>compression t-shirt for men</Link> goes far beyond simply buying tighter clothing. True compression requires a highly specific, mathematically calibrated level of systemic pressure actively deployed across critical muscular zones. The DualDeer elite compression line is strictly engineered utilizing advanced biomechanical principles to deliberately increase venous return. By forcefully driving deoxygenated blood back toward your heart structure at an exponentially accelerated rate, our garments effectively clear out debilitating lactic acid buildup the absolute moment it actively begins to aggressively accumulate during intense high-rep volume sets.
            </p>
            <p>
              When you are aggressively establishing the <Link href="/best-gym-clothes-india" style={{ textDecoration: 'underline', color: 'inherit' }}>best gym clothes in India</Link>, the uncompromising standard immediately becomes the exact quality of the micro-fibers utilized. Our uniquely blended, remarkably thin yet densely woven proprietary synthetic fabrics seamlessly lock onto your body's specific topography. This explicitly guarantees total stabilization of major chest and back musculature, drastically suppressing the micro-vibrations that consistently trigger deep-tissue fatigue and dangerous connective strain. Furthermore, the garment acts fundamentally as an impenetrable barrier, severely regulating the external climate to enforce ideal internal body temperatures.
            </p>
        </div>

        {/* Product Component Render inside text for structure */}
        <div className={styles.productGrid} style={{ margin: '4rem 0' }}>
            {products.slice(0, 4).map((product, i) => (
              <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
                <Link href={`/product/${product.slug}`} className={styles.productCard}>
                  <div className={styles.imageWrapper}>
                    <img src={product.image} alt={product.name} className={styles.productImage} />
                  </div>
                  <div className={styles.productInfo}>
                    <h4 className={styles.productName}>{product.name}</h4>
                    <span className={styles.productPrice}>₹{product.price.toLocaleString()}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
        </div>

        <div style={{ marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>An Astounding Competitive Advantage</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The modern Indian athlete is completely tired of subpar manufacturing. This directly fueled the highly demanded launch of the revolutionary DualDeer <Link href="/speedsuits-india" style={{ textDecoration: 'underline', color: 'inherit' }}>SpeedSuits</Link>—a masterful garment line that flawlessly bridges the extremely difficult gap between high-fashion luxury aesthetics and brutal, undeniable tactical performance. Our mens compression garments aggressively follow this exact same luxurious DNA. Featuring aggressively contoured ergonomic paneling and virtually indestructible flat-lock needle stitching, every piece is explicitly guaranteed to effortlessly endure years of grueling, hostile physical abuse while perpetually maintaining its sleek, architectural silhouette. 
            </p>
            <p>
              Additionally, our proprietary hydrophilic coating instantly pulls aggressive moisture straight away from the epidermis, forcibly pushing it entirely outwards towards the atmosphere for rapid, instantaneous evaporation. As you dive headfirst into intensely commanding <Link href="/gym-wear-men-india" style={{ textDecoration: 'underline', color: 'inherit' }}>gym wear in India</Link>, understand that acquiring DualDeer compression represents an active, strategic investment directly into preserving your long-term kinetic health and rapidly accelerating your elite athletic progression.
            </p>
        </div>
      </section>

      <section className={styles.darkSection} style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Should I size down to establish maximum compression?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>No, our garments are rigorously pre-engineered specifically for maximum targeted pressure at true-to-size dimensions. Simply selecting your standard chest dimensions will flawlessly deliver the optimal, scientifically calculated compression feedback required.</p>
            </div>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>How does it strictly compare to standard athletic t-shirts?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Unlike highly porous, loose-fitting standard cotton or basic polyester which absorbs sweat and drags heavily, our <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>elite compression gear</Link> decisively forms a highly supportive secondary skin, actively mitigating friction while immensely boosting vital neuromuscular proprioception.</p>
            </div>
        </div>
      </section>
    </main>
  );
}
