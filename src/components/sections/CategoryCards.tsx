"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./CategoryCards.module.css";

const categories = [
  {
    id: 1,
    title: "Women's Yoga Gear",
    subtitle: "FOR HER",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2670&auto=format&fit=crop",
    link: "/category/womens-yoga",
    color: "#FFAC81"
  },
  {
    id: 2,
    title: "Men's Running Wear",
    subtitle: "FOR HIM",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2670&auto=format&fit=crop",
    link: "/category/mens-running",
    color: "#E2F0F9"
  }
];

export default function CategoryCards() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {categories.map((category, index) => (
          <motion.div 
            key={category.id}
            className={styles.card}
            style={{ backgroundColor: category.color }}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: index * 0.2 }}
          >
            <div className={styles.content}>
              <span className={styles.subtitle}>{category.subtitle}</span>
              <h2 className={styles.title}>{category.title}</h2>
              <Link href={category.link} className={styles.btn}>
                Shop Now
              </Link>
            </div>
            <div className={styles.imageWrapper}>
              <Image 
                src={category.image} 
                alt={category.title}
                fill
                className={styles.image}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
