"use client";
import { useState, useEffect, Suspense, useRef, Fragment } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ElitePage.module.css';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { Grid, Minimize, Wind, Shield } from 'lucide-react';
import EliteSplash from '@/components/ui/EliteSplash';

export default function EliteClient({ initialProducts, initialCategories, initialHeroSettings, initialSplashSettings }: any) {
  return (
    <Suspense fallback={<div className={styles.loadingScreen}>Initializing Elite Experience...</div>}>
      <EliteEngine 
        initialProducts={initialProducts} 
        initialCategories={initialCategories} 
        initialHeroSettings={initialHeroSettings} 
        initialSplashSettings={initialSplashSettings} 
      />
    </Suspense>
  );
}

// Sub-component for a 3D Tilt Luxury Card
function LuxuryCard({ product, indexStr, isEven, router, formatPrice }: any) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Format price manually to match mock (e.g. ₹ 899.00)
  const formattedPrice = formatPrice(product.price);
  const priceParts = formattedPrice.match(/([^\d]*)([\d,]+)(\.\d+)?/);
  const symbol = priceParts?.[1] || '₹';
  const whole = priceParts?.[2] || product.price.toString();
  const fraction = priceParts?.[3] || '.00';

  // Generate pseudo-serial from product ID so it's consistent
  const serial = `TW-${product.id ? product.id.slice(0, 6).toUpperCase() : '000000'}`;

  return (
    <motion.div 
      ref={ref}
      className={styles.productCard}
      initial={{ opacity: 0, y: 100 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className={`${styles.premiumCardContainer} ${!isEven ? styles.premiumCardContainerReversed : ''}`}
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        
        <div className={styles.premiumImageSide}>
          <div className={styles.premiumRibbon}>
            <div className={styles.ribbonLogo} />
            <div className={styles.ribbonText}>
              <span>ELITE</span>
              <span>SERIES</span>
            </div>
          </div>
          <img src={product.image} alt={product.name} className={styles.premiumImage} />
        </div>

        {/* Details Side */}
        <div className={styles.premiumContentSide}>
          
          <motion.div 
            className={styles.premiumTop}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className={styles.premiumIndex}>N °  {indexStr}</span>
            <h2 className={styles.premiumTitle}>
              <span className={styles.titleWhite}>{product.name.split(' ')[0]}</span>
              {product.name.split(' ').length > 1 && (
                <span className={styles.titleGold}> {product.name.split(' ').slice(1).join(' ')}</span>
              )}
            </h2>
          </motion.div>
          
          {product.attributes && product.attributes.length > 0 ? (
            <motion.div 
              className={styles.editorialSpecs}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 className={styles.specHeader}>{product.attributes[0]}</h4>
              {product.attributes.slice(1).map((attr: string, idx: number) => (
                <Fragment key={idx}>
                  {idx > 0 && <div className={styles.hairlineDivider}></div>}
                  <p className={idx === 0 ? styles.specText : styles.specHighlight}>{attr}</p>
                </Fragment>
              ))}
              {product.sizes && product.sizes.length > 0 && (
                <>
                  <div className={styles.hairlineDivider}></div>
                  <p className={styles.specHighlight}>Available Sizes: {product.sizes.join(', ')}</p>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div 
              className={styles.editorialSpecs}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <h4 className={styles.specHeader}>EXCLUSIVE ALLOCATION</h4>
              <p className={styles.specText}>{product.description?.substring(0, 100)}...</p>
              {product.sizes && product.sizes.length > 0 && (
                <>
                  <div className={styles.hairlineDivider}></div>
                  <p className={styles.specHighlight}>Available Sizes: {product.sizes.join(', ')}</p>
                </>
              )}
            </motion.div>
          )}

          <motion.div 
            className={styles.premiumPriceArea}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.priceContainer}>
              <span className={styles.priceLabel}>Allocation Price</span>
              <div className={styles.premiumPrice}>
                {symbol}{whole}
              </div>
            </div>
            
            <button 
              className={styles.premiumRequestBtn}
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/product/${product.slug}`);
              }}
            >
              Begin Allocation &rarr;
            </button>
          </motion.div>

          <motion.div 
            className={styles.bottomMeta}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.serialBox}>
              <span className={styles.metaLabel}>Serial</span>
              <span className={styles.metaValue}>{serial}</span>
            </div>
            <div className={styles.editionBox}>
              <span className={styles.metaLabel}>Limited Allocation</span>
            </div>
          </motion.div>

        </div>

      </div>
    </motion.div>
  );
}

function EliteEngine({ initialProducts, initialHeroSettings, initialSplashSettings }: any) {
  const router = useRouter();
  const { formatPrice } = useCurrency();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  const yParallax = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    // Only show splash once per session
    const hasSeenSplash = sessionStorage.getItem('elite_splash_seen');
    if (!hasSeenSplash && initialSplashSettings?.isActive) {
      setShowSplash(true);
    }
  }, [initialSplashSettings]);

  const handleSplashComplete = () => {
    sessionStorage.setItem('elite_splash_seen', 'true');
    setShowSplash(false);
  };

  // Only display premium products
  const eliteProducts = initialProducts.filter((p: any) => p.isPremium);

  const defaultHero = {
    mediaType: 'image',
    desktopMediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2670&auto=format&fit=crop',
    mobileMediaUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=2670&auto=format&fit=crop',
    title: "L'ÉLITE",
    subtitle: 'THE PRIVATE CLIENT COLLECTION',
  };

  const heroSettings = initialHeroSettings || defaultHero;

  // Window size for responsive media
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (showSplash) {
    return <EliteSplash settings={initialSplashSettings} onComplete={handleSplashComplete} />;
  }

  const currentMediaUrl = isMobile && heroSettings.mobileMediaUrl ? heroSettings.mobileMediaUrl : heroSettings.desktopMediaUrl;

  return (
    <div className={styles.eliteContainer}>
      {/* Cinematic Hero */}
      <section className={styles.heroSection} ref={heroRef}>
        <div className={styles.heroBackground}>
          {heroSettings.mediaType === 'video' ? (
            <motion.video 
              src={currentMediaUrl}
              autoPlay
              muted
              loop
              playsInline
              className={styles.heroImage} 
              style={{ y: isMobile ? 0 : yParallax, scale: 1.05 }}
            />
          ) : (
            <motion.img 
              src={currentMediaUrl} 
              alt="Elite Collection" 
              className={styles.heroImage} 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 15, ease: 'easeOut' }}
              style={{ y: isMobile ? 0 : yParallax }}
            />
          )}
          <div className={styles.heroGradient} />
          <div className={styles.heroNoise} />
        </div>
        
        <motion.div 
          className={styles.heroContent}
          style={{ opacity: heroOpacity }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className={styles.heroSub}
          >
            {heroSettings.subtitle}
          </motion.div>
          <motion.h1 
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          >
            {heroSettings.title}
          </motion.h1>
          <motion.div 
            className={styles.scrollIndicator}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 1.5 }}
          >
            <span>DISCOVER</span>
            <div className={styles.scrollLine} />
          </motion.div>
        </motion.div>
      </section>

      {/* The Gallery / Staggered Grid */}
      <section className={styles.gallerySection}>
        <div className={styles.galleryHeader}>
          <h2 className={styles.galleryTitle}>Curated Masterpieces</h2>
          <p className={styles.galleryDesc}>For those who demand nothing less than perfection.</p>
        </div>

        {eliteProducts.length === 0 ? (
          <div className={styles.emptyState}>
            No masterpieces currently available.
          </div>
        ) : (
          <div className={styles.staggeredGrid} style={{ perspective: "1000px" }}>
            {eliteProducts.map((product: any, i: number) => {
              const indexStr = (i + 1).toString().padStart(2, '0');
              const isEven = i % 2 === 0;
              return (
                <LuxuryCard 
                  key={product.id} 
                  product={product} 
                  indexStr={indexStr} 
                  isEven={isEven} 
                  router={router} 
                  formatPrice={formatPrice} 
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
