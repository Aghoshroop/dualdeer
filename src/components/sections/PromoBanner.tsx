"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./PromoBanner.module.css";

export default function PromoBanner() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={`${styles.card} ${styles.left}`}
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.imageBoxLeft}>
            <div className={styles.archShape}>
              <Image 
                src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1000&auto=format&fit=crop"
                alt="Women's New Arrivals"
                fill
                className={styles.image}
              />
            </div>
          </div>
          <div className={styles.contentLeft}>
            <span className={styles.subtitle}>FOR HER</span>
            <h2 className={styles.title}>Women's<br/>New Arrivals</h2>
          </div>
        </motion.div>

        <motion.div 
          className={`${styles.card} ${styles.right}`}
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className={styles.contentRight}>
            <span className={styles.subtitle}>FOR HIM</span>
            <h2 className={styles.title}>Men's<br/>Basketball</h2>
          </div>
          <div className={styles.imageBox}>
            <Image 
              src="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop"
              alt="Men's Basketball"
              fill
              className={styles.image}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
