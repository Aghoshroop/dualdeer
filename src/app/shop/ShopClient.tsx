"use client";
import { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './ShopPage.module.css';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import AnimatedCartButton from '@/components/ui/AnimatedCartButton';
import { ShoppingBag, Heart, Check, LayoutGrid, Square, SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';

// UI Interaction Sound Generator (No external assets required)
const playInteractionSound = (type: 'hover' | 'click' | 'ring') => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.05);
    } else if (type === 'click') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === 'ring') {
      // Cash register / notification bell ring
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1600, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);

      // Higher harmonic for bright metallic chime
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(1600, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.1);
      gain2.gain.setValueAtTime(0, ctx.currentTime);
      gain2.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.3);
    }
  } catch(e) {}
};

interface ShopClientProps {
  initialProducts: any[];
  initialCategories: any[];
  initialBackdrop: string;
  initialHeroUrl: string;
  initialHeroText: string;
}

const filters = ["ALL", "T-SHIRTS", "SPEEDSUITS", "NEW ARRIVALS"];

export default function ShopClient({ initialProducts, initialCategories, initialHeroUrl, initialHeroText }: ShopClientProps) {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#fff', background: '#050505', minHeight: '100vh' }}>Initializing Elite Experience...</div>}>
      <ShopEngine initialProducts={initialProducts} initialCategories={initialCategories} initialHeroUrl={initialHeroUrl} initialHeroText={initialHeroText} />
    </Suspense>
  );
}

function ShopEngine({ initialProducts, initialCategories, initialHeroUrl, initialHeroText }: any) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("");
  const { addToCart } = useCart();
  const { formatPrice, renderPrice } = useCurrency();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [gridLayout, setGridLayout] = useState<'grid-2' | 'grid-1'>('grid-2');
  const [sortOption, setSortOption] = useState<string>("featured");
  const [isDesktop, setIsDesktop] = useState(true);

  React.useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth > 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const validCategories = initialCategories?.filter((cat: any) => {
    const catName = cat.name.toUpperCase();
    return initialProducts.some((p: any) => p.category?.toUpperCase() === catName);
  }).map((cat: any) => {
    const catName = cat.name.toUpperCase();
    const validSubs = cat.subcategories?.filter((sub: string) => {
      return initialProducts.some((p: any) => p.category?.toUpperCase() === catName && p.subcategory?.toUpperCase() === sub.toUpperCase());
    }) || [];
    return { ...cat, subcategories: validSubs };
  }) || [];

  const categoriesList = validCategories.map((c: any) => c.name.toUpperCase());
  const activeCatObj = validCategories.find((c: any) => c.name.toUpperCase() === activeCategory);
  const subcategoriesList = activeCatObj?.subcategories?.length > 0 ? activeCatObj.subcategories.map((s: string) => s.toUpperCase()) : [];

  const handleAddToCart = (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.isSoldOut && product.stock !== 0) {
      playInteractionSound('ring');
      addToCart({ id: product.id, name: product.name, price: product.price, mrp: product.mrp, image: product.image, size: 'M', quantity: 1 });
      setJustAddedId(product.id);
      setTimeout(() => setJustAddedId(null), 1500);
    }
  };

  const toggleWishlist = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    playInteractionSound('click');
    setWishlist(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleCategoryClick = (cat: string) => {
    playInteractionSound('click');
    if (activeCategory === cat && !expandedCategory) {
      setActiveCategory("");
      setActiveSubcategory("");
      setShowFilters(false);
      return;
    }
    const catObj = initialCategories?.find((c: any) => c.name.toUpperCase() === cat);
    if (catObj?.subcategories?.length > 0) {
      // Toggle accordion
      setExpandedCategory(expandedCategory === cat ? null : cat);
    } else {
      // Direct select and close
      setActiveCategory(cat);
      setActiveSubcategory("");
      setShowFilters(false);
    }
  };

  const handleSubcategoryClick = (cat: string, sub: string) => {
    playInteractionSound('click');
    setActiveCategory(cat);
    setActiveSubcategory(sub);
    setShowFilters(false);
  };

  // Process live products
  const displayProducts = initialProducts.filter((p: any) => {
    if (activeCategory) {
      const pCat = (p.category || "").toUpperCase();
      if (pCat !== activeCategory) return false;
      
      if (activeSubcategory) {
        const pSub = (p.subcategory || "").toUpperCase();
        if (pSub !== activeSubcategory) return false;
      }
    }
    return true;
  });

  if (sortOption === "discount_desc") {
    displayProducts.sort((a: any, b: any) => {
      const aDiscount = a.mrp && a.price ? (a.mrp - a.price) / a.mrp : 0;
      const bDiscount = b.mrp && b.price ? (b.mrp - b.price) / b.mrp : 0;
      return bDiscount - aDiscount;
    });
  } else if (sortOption === "price_desc") {
    displayProducts.sort((a: any, b: any) => (b.price || 0) - (a.price || 0));
  } else if (sortOption === "price_asc") {
    displayProducts.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
  }

  return (
    <div className={styles.shopContainer}>
      
      {/* 1. Ultra-Cinematic Dark Hero Section */}
      <section className={styles.heroSection}>
        <img 
          src={initialHeroUrl || "https://images.unsplash.com/photo-1558222218-b7b54eede3f3?q=80&w=2600&auto=format&fit=crop"} 
          alt="Collection" 
          className={styles.heroImage} 
        />
        <div className={styles.heroOverlay} />
        
        <motion.div 
          className={styles.heroContent}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 1, 0.5, 1] }}
        >
          <span className={styles.heroSubtitle}>Dual Deer Collection</span>
          <h1 className={styles.heroTitle}>MOVE WITHOUT LIMITS.</h1>
        </motion.div>
      </section>

      {/* 3. Filter Sidebar Overlay */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              className={styles.sidebarOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
            />
            <motion.div 
              className={styles.filterSidebar}
              initial={isDesktop ? { x: '100%' } : { y: '100%' }}
              animate={isDesktop ? { x: 0 } : { y: 0 }}
              exit={isDesktop ? { x: '100%' } : { y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 200, mass: 0.8 }}
            >
              <div className={styles.dragIndicator} />
              <div className={styles.sidebarHeader}>
                <h2>FILTER & SORT</h2>
                <button className={styles.closeBtn} onClick={() => setShowFilters(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.sidebarContent}>
                
                <div className={styles.sidebarSection}>
                  <h3>SORT BY</h3>
                  <div className={styles.sidebarList} style={{ marginBottom: '24px' }}>
                    <button 
                      className={`${styles.sidebarItem} ${sortOption === "featured" ? styles.sidebarItemActive : ''}`}
                      onClick={() => { setSortOption("featured"); playInteractionSound('click'); setShowFilters(false); }}
                    >
                      Show All
                    </button>
                    <button 
                      className={`${styles.sidebarItem} ${sortOption === "discount_desc" ? styles.sidebarItemActive : ''}`}
                      onClick={() => { setSortOption("discount_desc"); playInteractionSound('click'); setShowFilters(false); }}
                    >
                      Discount: High to Low
                    </button>
                    <button 
                      className={`${styles.sidebarItem} ${sortOption === "price_desc" ? styles.sidebarItemActive : ''}`}
                      onClick={() => { setSortOption("price_desc"); playInteractionSound('click'); setShowFilters(false); }}
                    >
                      Price: Highest to Lowest
                    </button>
                    <button 
                      className={`${styles.sidebarItem} ${sortOption === "price_asc" ? styles.sidebarItemActive : ''}`}
                      onClick={() => { setSortOption("price_asc"); playInteractionSound('click'); setShowFilters(false); }}
                    >
                      Price: Lowest to Highest
                    </button>
                  </div>
                </div>

                <div className={styles.sidebarSection}>
                  <h3>CATEGORIES</h3>
                  <div className={styles.sidebarList}>
                    
                    {/* Dynamic Categories */}
                    {validCategories.map((cat: any) => {
                      const catName = cat.name.toUpperCase();
                      const hasSubs = cat.subcategories && cat.subcategories.length > 0;
                      const isExpanded = expandedCategory === catName || activeCategory === catName;
                      
                      return (
                        <div key={cat.id || catName} className={styles.accordionGroup}>
                          <button 
                            className={`${styles.sidebarItem} ${activeCategory === catName && !hasSubs ? styles.sidebarItemActive : ''}`}
                            onClick={() => handleCategoryClick(catName)}
                          >
                            <span>{catName}</span>
                            {hasSubs && (
                              isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                            )}
                          </button>
                          
                          <AnimatePresence>
                            {hasSubs && isExpanded && (
                              <motion.div 
                                className={styles.accordionContent}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                              >
                                {cat.subcategories.map((sub: string) => {
                                  const subName = sub.toUpperCase();
                                  return (
                                    <button 
                                      key={subName}
                                      className={`${styles.subSidebarItem} ${activeCategory === catName && activeSubcategory === subName ? styles.subSidebarItemActive : ''}`}
                                      onClick={() => handleSubcategoryClick(catName, subName)}
                                    >
                                      {subName}
                                    </button>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Products Showcase */}
      <section className={styles.productsSection}>
        <div className={styles.collectionHeaderRow}>
          <div className={styles.gymsharkFilterSection}>

            <button className={styles.gymsharkFilterBtn} onClick={() => setShowFilters(!showFilters)}>
              <SlidersHorizontal size={16} strokeWidth={2} />
              <span>FILTER & SORT</span>
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${activeCategory}-${activeSubcategory}-${gridLayout}`}
            className={`${styles.galleryGrid} ${styles[gridLayout] || ''}`}
            style={displayProducts.length < 4 ? { display: 'flex', flexWrap: 'wrap', justifyContent: 'center' } : {}}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
          >
            {displayProducts.length === 0 ? (
              <div className={styles.emptyState}>Archive is currently empty for this category.</div>
            ) : (
              displayProducts.map((product: any, i: number) => (
                <div key={product.id} style={displayProducts.length < 4 ? { width: 'calc(25% - 48px)', minWidth: '300px' } : {}}>
                  <ProductCard 
                    product={product}
                    i={i}
                    styles={styles}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                    playInteractionSound={playInteractionSound}
                    renderPrice={renderPrice}
                  />
                </div>
              ))
            )}
          </motion.div>
        </AnimatePresence>
      </section>

    </div>
  );
}

function ProductCard({ product, i, styles, wishlist, toggleWishlist, playInteractionSound, renderPrice }: any) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Build images array safely
  const images = (product.images && product.images.length > 0)
    ? (product.images.includes(product.image) ? product.images : [product.image, ...product.images])
    : [product.image];

  // Touch handlers for mobile swiping
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 50) {
      setActiveImageIndex(prev => Math.min(prev + 1, images.length - 1));
    } else if (diff < -50) {
      setActiveImageIndex(prev => Math.max(prev - 1, 0));
    }
    setTouchStart(null);
  };

  return (
    <motion.div 
      className={styles.galleryCard}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: (i % 12) * 0.08, duration: 0.4, ease: "easeOut" }}
      onMouseEnter={() => {
        playInteractionSound('hover');
        if (images.length > 1) setActiveImageIndex(1);
      }}
      onMouseLeave={() => setActiveImageIndex(0)}
    >
      <div 
        className={styles.imageContainer} 
        onTouchStart={handleTouchStart} 
        onTouchEnd={handleTouchEnd}
      >
        {/* Top Left: Discount Badge */}
        {product.mrp && product.mrp > product.price && (
          <div className={styles.premiumDiscountBadge}>
            -{Math.round(((product.mrp - product.price) / product.mrp) * 100)}%
          </div>
        )}

        {/* Wishlist Icon */}
        <button 
          className={styles.premiumWishlistBtn}
          onClick={(e) => toggleWishlist(e, product.id)}
        >
          <Heart size={18} fill={wishlist.includes(product.id) ? '#4a3b8c' : 'none'} color="#4a3b8c" />
        </button>

        <Link href={`/product/${product.slug}`}>
          {images.map((img: string, idx: number) => (
            <img 
              key={idx}
              src={img} 
              alt={`${product.name} - view ${idx + 1}`} 
              className={styles.carouselImg}
              style={{
                opacity: idx === activeImageIndex ? 1 : 0,
                position: idx === 0 ? 'relative' : 'absolute',
                zIndex: idx === activeImageIndex ? 2 : 1
              }}
            />
          ))}
        </Link>
        
        {/* Dynamic Carousel Dots */}
        {images.length > 1 && (
          <div className={styles.carouselDots}>
            {images.map((_, idx) => (
              <span 
                key={idx}
                className={`${styles.dot} ${idx === activeImageIndex ? styles.activeDot : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setActiveImageIndex(idx);
                }}
              ></span>
            ))}
          </div>
        )}
      </div>

      <div className={styles.productMeta}>
        <div className={styles.productHeader}>
          <Link href={`/product/${product.slug}`} style={{ textDecoration: 'none', flex: 1, paddingRight: '12px' }}>
            <h3 className={styles.productName}>{product.name}</h3>
          </Link>
          <div className={styles.ratingRow}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.ratingNumber}>{product.rating ? product.rating.toFixed(1) : "5.0"}</span>
          </div>
        </div>
        
        <p className={styles.fitText}>Muscle Fit</p>
        <p className={styles.colorText}>FOR MEN</p>
        
        <div className={styles.divider}></div>

        <div className={styles.productPrice}>
          <span className={styles.currentPrice}>{renderPrice(product.price)}</span>
          {product.mrp && product.mrp > product.price && (
            <span className={styles.originalPrice}>{renderPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
