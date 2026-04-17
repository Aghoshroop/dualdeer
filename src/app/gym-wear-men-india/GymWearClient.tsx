"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import styles from "@/app/speedsuits-india/page.module.css";
import { Product } from "@/lib/firebaseUtils";
import { useCart } from "@/context/CartContext";

export default function GymWearClient({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <main className={styles.main}>
      <section className={styles.hero} style={{ background: '#050505', minHeight: '60vh' }}>
        <div className={styles.heroContent}>
          <motion.h1 
            className={styles.heroTitle} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
            style={{ fontSize: 'clamp(32px, 8vw, 64px)' }}
          >
            GYM WEAR FOR MEN INDIA
          </motion.h1>
          <motion.p className={styles.heroSubtitle} initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 1, delay: 0.3 }}>
            The definitive collection of elite athletic garments engineered for uncompromising performance and unassailable style.
          </motion.p>
        </div>
      </section>

      <section className={styles.section} style={{ maxWidth: '1000px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.8' }}>
        <div style={{ marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>The Evolution of Men's Gym Wear in India</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              The landscape of <Link href="/best-gym-clothes-india" style={{ textDecoration: 'underline', color: 'inherit' }}>best gym clothes in India</Link> has experienced a dramatic and necessary revolution. Gone are the days when loose, uninspired cotton t-shirts and heavily branded athletic wear were the acceptable standard for serious athletes. Today, discerning gentlemen demand significantly more from their activewear—they actively demand intelligent fabric technology, aerodynamic silhouettes, and an uncompromising luxury aesthetic that effortlessly transitions from the squat rack directly to the sophisticated city streets. DualDeer stands exclusively at the absolute forefront of this paradigm shift, offering the ultimate tier of premium gym wear for men in India. We intimately understand that when you are relentlessly pushing past your absolute physical thresholds, your clothing must perform as a highly supportive, secondary skin rather than a dripping, restrictive liability.
            </p>
            <p>
              Our meticulously designed collections focus intensely on cutting-edge synthetic configurations, featuring dynamic moisture-management systems, radical four-way kinetic stretch properties, and strategically body-mapped compression zones. Whether you are actively seeking the ultimate <Link href="/compression-tshirt-men" style={{ textDecoration: 'underline', color: 'inherit' }}>compression t-shirt for men</Link> or unparalleled athletic bottoms, every single thread engineered by DualDeer is aggressively tested to violently outlast extreme wear while relentlessly retaining its premium structural integrity.
            </p>
        </div>

        <div style={{ marginBottom: '3rem' }}>
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>Why DualDeer Dominates the Market</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              True high-performance gym wear is rarely defined by flashy logos; it is strictly defined by invisible, state-of-the-art utility. At DualDeer, we critically recognize that the modern Indian athlete requires advanced climate control to intensely combat brutal humidity, alongside robust friction-resistant flatlock seams to practically eliminate painful chafing during prolonged, rigorous exertion. The introduction of our signature, extremely limited-edition <Link href="/speedsuits-india" style={{ textDecoration: 'underline', color: 'inherit' }}>SpeedSuits</Link> effectively challenged the entire industry standard, fundamentally proving that luxury aesthetics and hardcore functional compression can, and absolutely must, seamlessly coexist. 
            </p>
            <p>
              When evaluating high-tier gym wear for men in India, it is critical to critically analyze the proprietary fabric blend. DualDeer rigorously incorporates superior hydrophobic micro-fibers that explicitly reject heavy moisture buildup, completely ensuring your core temperature remains heavily regulated regardless of environmental hostility.
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
            <h2 className={styles.sectionTitle} style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>The Anatomy of Perfection</h2>
            <p style={{ marginBottom: '1.5rem' }}>
              We absolutely refuse to compromise. Each garment is systematically constructed utilizing an architectural approach to biomechanical alignment. The strategically integrated muscular support found within our <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>men's training collection</Link> effectively reduces structural vibration during aggressive lifts, heavily stimulating vital blood flow to explicitly accelerate immediate post-workout recovery. This is not simply basic clothing; this is professionally graded tactical equipment uniquely disguised as remarkably sleek, minimalist luxury fashion.
            </p>
            <p>
              Furthermore, adapting to varied disciplines requires immense versatility. A professional athlete performing highly explosive plyometric movements demands substantially different kinetic feedback than an endurance runner heavily logging miles on hot asphalt. DualDeer's advanced adaptive textiles intuitively and naturally stretch with your body's direct command, providing absolute restriction-free multidirectional mobility. Investing generously in high-caliber gym wear directly correlates to actively investing in your personal physical output—because securing total victory inherently demands the absolute finest armaments.
            </p>
        </div>
      </section>

      <section className={styles.darkSection} style={{ padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '3rem' }}>Frequently Asked Questions</h2>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>What constitutes the best gym wear for men in India?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>The finest gym wear strictly requires advanced moisture-wicking synthetic blends, aggressive four-way kinetic stretch capability, friction-resistant flatlock stitching, and an inherently sleek, highly tailored architectural fit—all of which precisely define the DualDeer core collection.</p>
            </div>
            <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>How does compression gear enhance performance?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Compression gear directly stabilizes major muscle groups to actively reduce painful vibration, effectively increasing critical blood flow and drastically reducing immediate post-workout fatigue, highly evident within our meticulously engineered <Link href="/compression-tshirt-men" style={{ textDecoration: 'underline', color: 'inherit' }}>compression t-shirt line</Link>.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Can DualDeer activewear be worn outside the gym?</h3>
                <p style={{ opacity: 0.8, lineHeight: '1.6' }}>Absolutely. DualDeer pieces are precisely designed with a strictly minimalist, highly refined luxury aesthetic, ensuring they seamlessly and confidently transition into sophisticated casual athleisure wear on the contemporary city streets.</p>
            </div>
        </div>
      </section>
    </main>
  );
}
