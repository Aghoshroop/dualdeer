"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from 'react';
import { getContentBlock } from '@/lib/firebaseUtils';
import styles from "./EditorialSplit.module.css";

const categories = [
  {
    id: 1,
    title: "Women",
    image: "/women.png", // Local static asset
    link: "/shop?gender=Women",
  },
  {
    id: 2,
    title: "Men",
    image: "/men.png", // Local static asset
    link: "/shop?gender=Men",
  }
];

export default function EditorialSplit() {
  const [leftBlock, setLeftBlock] = useState<any>(null);
  const [rightBlock, setRightBlock] = useState<any>(null);

  useEffect(() => {
    getContentBlock('editorial-left').then(res => setLeftBlock(res));
    getContentBlock('editorial-right').then(res => setRightBlock(res));
  }, []);

  const dynamicCategories = [
    {
      id: 1,
      title: (leftBlock?.title && leftBlock.title.trim() !== '') ? leftBlock.title : categories[0].title,
      image: (leftBlock?.imageUrl && leftBlock.imageUrl.trim() !== '') ? leftBlock.imageUrl : categories[0].image,
      link: (leftBlock?.ctaLink && leftBlock.ctaLink.trim() !== '') ? leftBlock.ctaLink : categories[0].link,
      cta: (leftBlock?.ctaText && leftBlock.ctaText.trim() !== '') ? leftBlock.ctaText : "EXPLORE"
    },
    {
      id: 2,
      title: (rightBlock?.title && rightBlock.title.trim() !== '') ? rightBlock.title : categories[1].title,
      image: (rightBlock?.imageUrl && rightBlock.imageUrl.trim() !== '') ? rightBlock.imageUrl : categories[1].image,
      link: (rightBlock?.ctaLink && rightBlock.ctaLink.trim() !== '') ? rightBlock.ctaLink : categories[1].link,
      cta: (rightBlock?.ctaText && rightBlock.ctaText.trim() !== '') ? rightBlock.ctaText : "EXPLORE"
    }
  ];

  return (
    <section className={styles.section}>
      <div className={styles.splitContainer}>
        {dynamicCategories.map((cat, i) => (
          <Link href={cat.link} key={cat.id} className={styles.block}>
            <div className={styles.imageWrapper}>
              <div 
                className={styles.image}
                style={{ backgroundImage: `url('${cat.image}')` }}
              />
              <div className={styles.overlay} />
            </div>
            <motion.div 
              className={styles.content}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: i * 0.2 }}
            >
              <h2 className={styles.title}>{cat.title}</h2>
              <span className={styles.shopLink}>{cat.cta}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </section>
  );
}
