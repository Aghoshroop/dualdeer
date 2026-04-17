"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "@/app/speedsuits-india/page.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";

export default function BestGymClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  return (
    <main className={styles.main}>
      <section className={styles.hero} style={{ background: '#0a0a0a', minHeight: '60vh' }}>
        <div className={styles.heroContent}>
          <motion.h1 
            className={styles.heroTitle} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
            style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}
          >
            BEST GYM CLOTHES INDIA
          </motion.h1>
          <motion.p className={styles.heroSubtitle} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1, delay: 0.3 }}>
            Unrivaled craftsmanship explicitly tailored for athletes demanding the absolute highest echelon of physical dominance and aesthetic authority.
          </motion.p>
        </div>
      </section>

      <section className={styles.section} style={{ maxWidth: '1000px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Setting an Impossible New Standard</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              For far too long, the activewear market has been overwhelmingly flooded with subpar, mass-produced garments that entirely fail to withstand the true rigors of elite athletic pressure. Discovering genuinely the <Link href="/best-gym-clothes-india" style={{ textDecoration: 'underline', color: 'inherit' }}>best gym clothes in India</Link> has historically required importing heavily overpriced international luxury brands. DualDeer was precisely engineered to directly annihilate this glaring deficit. By merging heavily researched biomechanical principles with uncompromising, ultra-high-end fashion silhouettes, we successfully engineered an incredibly powerful collection that simply outclasses everything currently existing on the subcontinent's market. 
            </p>
            <p>
              An elite professional athlete explicitly requires their physical armaments to silently support rapid kinetic output. From meticulously hunting for the ultimate <Link href="/compression-tshirt-men" style={{ textDecoration: 'underline', color: 'inherit' }}>compression t-shirt for men</Link> to sourcing breathable, sweat-evaporating bottoms, DualDeer's advanced proprietary fabrics effortlessly provide monumental athletic superiority. We rely exclusively upon ultra-dense, four-way hydrophobic synthetic weaves that aggressively wick moisture, effectively regulating critical core temperatures during violently high-intensity training intervals. 
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
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Luxury Aesthetics Masking Brutal Performance</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The very foundation of finding premium <Link href="/gym-wear-men-india" style={{ textDecoration: 'underline', color: 'inherit' }}>gym wear in India</Link> lies within longevity and structural resistance. Many basic garments immediately suffer from thread degradation and dangerous chafing when exposed to heavy barbell friction or intense repetitive aerobic motion. Through the heavy utilization of advanced flatlock seam construction and intricately body-mapped ergonomic paneling, DualDeer absolutely eliminates all internal chafing parameters. Furthermore, our signature masterpiece, the incredibly exclusive <Link href="/speedsuits-india" style={{ textDecoration: 'underline', color: 'inherit' }}>SpeedSuits collection</Link>, has firmly cemented its legendary reputation amongst the 1% of elite Indian athletes who refuse to wear anything lacking absolute aerodynamic perfection.
            </p>
            <p>
              Investing directly into your physical hardware is undeniably an investment seamlessly woven into your immediate athletic progression. By strictly maintaining an incredibly rigid quality control architecture, DualDeer ensures that each individual garment fundamentally feels like a finely tuned instrument of war. Experience the ultimate apex of functional, breathable, and deeply aesthetic athletics.
            </p>
        </div>
      </section>

      <section className={styles.darkSection} style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Why is DualDeer considered the best activewear in the country?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>We completely bypass standard fast-fashion methodologies, explicitly choosing to meticulously engineered our garments using heavily guarded proprietary hydrophobic textiles, extreme stress-tested flatlock seams, and visually striking architectural designs that seamlessly execute both in the combat gym and upon sophisticated city streets.</p>
            </div>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Do these garments actively assist in workout recovery?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Yes, extensively. Our highly specialized compression pieces intuitively stabilize rapidly firing muscle fibers, strongly minimizing internal connective micro-trauma. This actively boosts immediate venous return, rapidly flushing devastating lactic acid to substantially lower mandatory recovery timeframes.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>How extensively are the fabrics tested?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Every structural silhouette, prominently including our highly sought-after <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>core collection pieces</Link>, undergoes violently rigorous friction, stretch, and thermal dynamic stress testing before it ever approaches the public market.</p>
            </div>
        </div>
      </section>
    </main>
  );
}
