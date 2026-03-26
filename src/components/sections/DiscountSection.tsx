"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import styles from "./DiscountSection.module.css";
import { useState, useEffect } from "react";

export default function DiscountSection() {
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 5,
    minutes: 30,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.bgImageContainer}
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5 }}
        >
          <Image 
            src="https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2670&auto=format&fit=crop"
            alt="Man running"
            fill
            className={styles.bgImage}
          />
        </motion.div>
        <div className={styles.overlay}></div>
        
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.subtitle}>LIMITED TIME OFFER</span>
          <h2 className={styles.title}>Get 35% Off Everything!</h2>
          
          <div className={styles.timer}>
            <div className={styles.timeBox}>
              <span className={styles.value}>{timeLeft.days}</span>
              <span className={styles.label}>Days</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.value}>{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className={styles.label}>Hours</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.value}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className={styles.label}>Mins</span>
            </div>
            <div className={styles.timeBox}>
              <span className={styles.value}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className={styles.label}>Secs</span>
            </div>
          </div>

          <Link href="/shop" className={styles.btn}>
            Shop Now
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
