"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getBanners, Banner } from '@/lib/firebaseUtils';
import styles from './HeroSection.module.css';

const speedSuitSlide = {
  id: 'speedsuit-hero',
  image: "https://images.unsplash.com/photo-1548690312-e3b507d17a12?q=80&w=2600&auto=format&fit=crop", // Male training
  heading: "Signature SpeedSuits",
  subheading: "Advanced compression and aerodynamic design.",
  cta: "EXPLORE SPEEDSUITS",
  theme: 'dark'
};

const fallbackSlides = [
  speedSuitSlide,
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1518611012118-29a8d63ee0c2?q=80&w=2600&auto=format&fit=crop", // Yoga women
    heading: "Absolute Zen",
    subheading: "Seamless comfort for mindful movement.",
    cta: "SHOP YOGA",
    theme: 'light'
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2600&auto=format&fit=crop", // Sprinting
    heading: "Elite Supremacy",
    subheading: "Unleash your full potential on the track.",
    cta: "DISCOVER SPEED",
    theme: 'dark'
  }
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await getBanners();
        const activeBanners = banners.filter(b => b.active);
        
        if (activeBanners.length > 0) {
          const mappedSlides = activeBanners.map((b, index) => ({
            id: b.id || index.toString(),
            image: b.image,
            heading: b.title,
            subheading: "Premium exclusive selection.",
            cta: b.link ? "DISCOVER MORE" : "SHOP NOW",
            theme: 'dark' 
          }));
          // Filter out any DB banner that might be a duplicate speedsuit to avoid double-showing
          const otherSlides = mappedSlides.filter(s => !s.heading.toLowerCase().includes('speedsuit'));
          setDynamicSlides([speedSuitSlide, ...otherSlides]);
        } else {
          setDynamicSlides(fallbackSlides);
        }
      } catch (error) {
        setDynamicSlides(fallbackSlides);
      }
      setLoading(false);
    };
    
    fetchBanners();
  }, []);

  useEffect(() => {
    if (dynamicSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % dynamicSlides.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [dynamicSlides]);

  if (loading) return <section className={styles.hero} style={{ background: '#0a0a0a' }} />;

  return (
    <section className={styles.hero}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className={styles.slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          {/* Background Image */}
          <motion.div 
            className={styles.background} 
            style={{ backgroundImage: `url(${dynamicSlides[current].image})` }} 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 6, ease: "linear" }}
          />
          <div 
            className={`${styles.overlay} ${dynamicSlides[current].theme === 'light' ? styles.overlayLight : ''}`} 
          />

          {/* Text Content */}
          <div className={`${styles.content} ${dynamicSlides[current].theme === 'light' ? styles.themeLight : ''}`}>
            <motion.h2 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className={styles.heading}
            >
              {dynamicSlides[current].heading}
            </motion.h2>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 1 }}
              className={styles.subheading}
            >
              {dynamicSlides[current].subheading}
            </motion.p>
            <motion.button 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 1 }}
              className={styles.ctaBtn}
              onClick={() => {
                if (dynamicSlides[current].heading.includes('SpeedSuit')) {
                  window.location.href = '/shop?category=speedsuit';
                } else {
                  window.location.href = '/shop';
                }
              }}
            >
              {dynamicSlides[current].cta}
            </motion.button>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Progress Indicators */}
      <div className={`${styles.indicators} ${dynamicSlides[current].theme === 'light' ? styles.themeLight : ''}`}>
        {dynamicSlides.map((_, index) => (
          <div 
            key={index} 
            className={styles.indicatorTrack}
            onClick={() => setCurrent(index)}
          >
            {current === index && (
              <motion.div 
                className={styles.indicatorFill}
                layoutId="indicatorFill"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 6, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
