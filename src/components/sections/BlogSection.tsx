"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import styles from "./BlogSection.module.css";

const blogPosts = [
  {
    id: 1,
    title: "Women In The World Of Sports: Power Fit, Fierce, And Inspiring.",
    category: "Fitness",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop",
    link: "/blog/1"
  },
  {
    id: 2,
    title: "Train Like A Local - Discover Europe In A Sporty Way.",
    category: "Travel",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop",
    link: "/blog/2"
  },
  {
    id: 3,
    title: "Sport And Sustainability: How You Can Make Your Eco-Decision.",
    category: "Lifestyle",
    image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=800&auto=format&fit=crop",
    link: "/blog/3"
  }
];

export default function BlogSection() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.subtitle}>NEWS</span>
          <h2 className={styles.title}>Latest News</h2>
        </motion.div>

        <div className={styles.grid}>
          {blogPosts.map((post, index) => (
            <motion.div 
              key={post.id}
              className={styles.card}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Link href={post.link} className={styles.imageBox}>
                <Image 
                  src={post.image}
                  alt={post.title}
                  fill
                  className={styles.image}
                />
              </Link>
              <div className={styles.content}>
                <span className={styles.category}>{post.category}</span>
                <Link href={post.link} className={styles.postTitle}>
                  {post.title}
                </Link>
                <Link href={post.link} className={styles.readMore}>
                  Read More
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
