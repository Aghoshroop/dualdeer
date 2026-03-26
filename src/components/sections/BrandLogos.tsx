"use client";
import { motion } from "framer-motion";
import styles from "./BrandLogos.module.css";

export default function BrandLogos() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {[1, 2, 3, 4, 5].map((item, index) => (
          <motion.div
            key={item}
            className={styles.logoItem}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <div className={styles.placeholderLogo}>BRAND {item}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
