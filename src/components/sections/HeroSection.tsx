"use client";
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { getBanners } from '@/lib/firebaseUtils';
import styles from './HeroSection.module.css';
import Magnetic from '../ui/Magnetic';

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

// Easing for luxury feel
const luxuryEase = [0.76, 0, 0.24, 1] as const;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLElement>(null);

  // Scroll Parallax
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityContent = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // CTA Cursor Follower
  const ctaX = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });
  const ctaY = useSpring(0, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!containerRef.current) return;
    const { clientX, clientY } = e;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    const intensity = 0.15; // How strongly it follows
    
    ctaX.set(deltaX * intensity);
    ctaY.set(deltaY * intensity);
  };

  const handleMouseLeave = () => {
    ctaX.set(0);
    ctaY.set(0);
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const banners = await getBanners();
        const activeBanners = banners
          .filter(b => b.active && !b.deleted)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        
        if (activeBanners.length > 0) {
          const mappedSlides = activeBanners.map((b, index) => ({
            id: b.id || index.toString(),
            mediaType: b.mediaType || 'image',
            image: b.image,
            mobileImage: b.mobileImage || b.image,
            desktopVideo: b.desktopVideo,
            mobileVideo: b.mobileVideo,
            heading: b.title,
            subheading: "",
            cta: (b.link || b.ctaLink) ? "DISCOVER MORE" : "SHOP NOW",
            showCta: b.showCta !== false,
            ctaLink: b.ctaLink || b.link || '/shop',
            theme: 'dark' 
          }));
          setDynamicSlides(mappedSlides);
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
    }, 15000); 
    return () => clearInterval(timer);
  }, [dynamicSlides]);

  if (loading) return <section ref={containerRef} className={styles.hero} style={{ background: '#0a0a0a' }} />;

  const currentSlide = dynamicSlides[current];

  // Split text for character animation
  const headingChars = currentSlide.heading.split('');

  return (
    <section 
      ref={containerRef} 
      className={styles.hero}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className={styles.slide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: luxuryEase } }}
          transition={{ duration: 1.2, ease: luxuryEase }}
        >
          {/* Desktop Background (Image or Video) */}
          {currentSlide.mediaType === 'video' && currentSlide.desktopVideo ? (
            <motion.video 
              className={`${styles.background} ${styles.desktopOnly}`} 
              src={currentSlide.desktopVideo}
              autoPlay muted loop playsInline
              style={{ objectFit: 'cover', width: '100%', height: '100%', y: yBg }} 
              initial={{ scale: 1.15, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: luxuryEase }}
            />
          ) : (
            <motion.div 
              className={`${styles.background} ${styles.desktopOnly}`} 
              role="img"
              aria-label={currentSlide.heading + " - DualDeer Premium Activewear"}
              style={{ 
                backgroundImage: `url(${currentSlide.image})`,
                y: yBg
              }} 
              initial={{ scale: 1.15, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: luxuryEase }}
            />
          )}

          {/* Mobile Background (Image or Video) */}
          {currentSlide.mediaType === 'video' && currentSlide.mobileVideo ? (
            <motion.video 
              className={`${styles.background} ${styles.mobileOnly}`} 
              src={currentSlide.mobileVideo}
              autoPlay muted loop playsInline
              style={{ objectFit: 'cover', width: '100%', height: '100%', y: yBg }} 
              initial={{ scale: 1.15, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: luxuryEase }}
            />
          ) : (
            <motion.div 
              className={`${styles.background} ${styles.mobileOnly}`} 
              role="img"
              aria-label={currentSlide.heading + " - DualDeer Premium Activewear"}
              style={{ 
                backgroundImage: `url(${currentSlide.mobileImage || currentSlide.image})`,
                y: yBg
              }} 
              initial={{ scale: 1.15, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: luxuryEase }}
            />
          )}
          <div 
            className={`${styles.overlay} ${currentSlide.theme === 'light' ? styles.overlayLight : ''}`} 
          />

          {/* Text Content */}
          <motion.div 
            className={`${styles.content} ${currentSlide.theme === 'light' ? styles.themeLight : ''}`}
            style={{ y: yContent, opacity: opacityContent }}
          >
            <h2 className={styles.heading}>
              {headingChars.map((char: string, index: number) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: luxuryEase, 
                    delay: 0.4 + (index * 0.03) 
                  }}
                  style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                  {char}
                </motion.span>
              ))}
            </h2>
            {currentSlide.subheading && (
              <motion.p 
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1, ease: luxuryEase }}
                className={styles.subheading}
              >
                {currentSlide.subheading}
              </motion.p>
            )}
            
            {currentSlide.showCta !== false && (
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1.4, duration: 1, ease: luxuryEase }}
                style={{ x: ctaX, y: ctaY }}
              >
                <button 
                  className={styles.ctaBtn}
                  onClick={() => {
                    if (currentSlide.ctaLink) {
                      window.location.href = currentSlide.ctaLink;
                    } else {
                      const heading = currentSlide.heading?.toLowerCase() || '';
                      if (heading.includes('speedsuit')) {
                        window.location.href = '/speedsuits-india';
                      } else if (heading.includes('men') || heading.includes('male')) {
                        window.location.href = '/men';
                      } else {
                        window.location.href = '/shop';
                      }
                    }
                  }}
                >
                  {currentSlide.cta}
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Slider Progress Indicators */}
      <div className={`${styles.indicators} ${currentSlide?.theme === 'light' ? styles.themeLight : ''}`}>
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
                transition={{ duration: 15, ease: "linear" }}
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
