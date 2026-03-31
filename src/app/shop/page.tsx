"use client";
import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import styles from './ShopPage.module.css';
import { useCart } from '@/context/CartContext';
import AnimatedCartButton from '@/components/ui/AnimatedCartButton';
import SeoIntroBlock from '@/components/sections/SeoIntroBlock';
import React from 'react';

const filters = ["ALL", "SPECIAL", "BEST SELLER", "FEATURED PRODUCTS"];

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Loading Catalogue...</div>}>
      <ShopEngine />
    </Suspense>
  );
}

function ShopEngine() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialGender = searchParams.get('gender') || searchParams.get('category');
  const mappedGender = (initialGender?.toLowerCase().includes('men') && !initialGender?.toLowerCase().includes('women'))
    ? 'Men'
    : (initialGender?.toLowerCase().includes('women') ? 'Women' : null);

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [activeGender, setActiveGender] = useState<string | null>(mappedGender);
  const [activeType, setActiveType] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [backdropUrl, setBackdropUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');
  const [heroText, setHeroText] = useState('');

  let activeFiltersCount = 0;
  if (activeGender) activeFiltersCount++;
  if (activeType) activeFiltersCount++;
  if (activeFilter !== "ALL") activeFiltersCount++;

  const [liveProducts, setLiveProducts] = useState<any[]>([]);
  const [liveCategories, setLiveCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 324; // Card width 300px + some gap
      if (direction === 'left') {
        sliderRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  useEffect(() => {
    import('@/lib/firebaseUtils').then(({ getProducts, getCategories, getContentBlock }) => {
      Promise.all([
        getProducts(),
        getCategories(),
        getContentBlock('shop-backdrop'),
        getContentBlock('shop-hero'),
      ]).then(([prods, cats, backdrop, hero]) => {
        setLiveProducts(prods);
        setLiveCategories(cats.filter((c: any) => c.status === 'active'));
        if (backdrop) setBackdropUrl(backdrop.imageUrl || '');
        if (hero) {
          setHeroUrl(hero.imageUrl || '');
          setHeroText(hero.title || '');
        }
        setLoading(false);
      }).catch(err => console.error(err));
    });
  }, []);

  const displayProducts = liveProducts.filter(p => {
    if (activeFilter === "SPECIAL" && !p.isSeasonal) return false;
    if (activeFilter === "BEST SELLER" && (p.rating || 0) < 4.8) return false;
    if (activeFilter === "FEATURED PRODUCTS" && ((p.stock || 0) <= 0 || (p.rating || 0) < 4.5)) return false;
    if (activeFilter === "DISCOUNT" && (!p.mrp || p.mrp <= p.price)) return false;

    if (activeGender || activeType) {
      const searchString = `${p.category || ''} ${p.subcategory || ''} ${p.name || ''}`.toLowerCase();
      if (activeGender && !searchString.includes(activeGender.toLowerCase())) return false;
      if (activeType && !searchString.includes(activeType.toLowerCase().replace('-', ''))) return false;
    } else if (activeFilter !== "ALL" && !["SPECIAL", "BEST SELLER", "FEATURED PRODUCTS", "NEW ARRIVAL", "DISCOUNT"].includes(activeFilter)) {
      if (p.category?.toLowerCase() !== activeFilter.toLowerCase()) return false;
    }
    return true;
  }).sort((a, b) => {
    // Force SpeedSuit items to the very top
    const aIsSpeed = (a.category || '').toLowerCase() === 'speedsuit' || (a.name || '').toLowerCase().includes('speedsuit');
    const bIsSpeed = (b.category || '').toLowerCase() === 'speedsuit' || (b.name || '').toLowerCase().includes('speedsuit');
    if (aIsSpeed && !bIsSpeed) return -1;
    if (!aIsSpeed && bIsSpeed) return 1;
    return 0;
  });

  return (
    <div className={styles.shopContainer}>

      {/* 1. Hero Banner */}
      <section className={styles.halfScreenHero}>
        <img
          src={heroUrl || "https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?q=80&w=2600&auto=format&fit=crop"}
          alt="Shop Collection"
        />
        <div className={styles.halfScreenOverlay}></div>
        <div className={styles.halfScreenText}>
          <h2>{heroText || "ELEVATE YOUR PERFORMANCE"}</h2>
        </div>
      </section>

      <SeoIntroBlock
        h1="Explore the Best Premium Activewear in India"
        h2="Unrivaled Luxury Athleisure and Performance Gear"
        paragraphs={[
          <React.Fragment key="1">
            Discover the absolute pinnacle of athletic fashion with DualDeer&apos;s extensive shop collection. As India&apos;s premier destination for high-performance activewear and luxury athleisure, featuring our signature <Link href="/speedsuit" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>SpeedSuit collection</Link>, our meticulously curated catalog caters to both dedicated professional athletes and style-conscious individuals who absolutely refuse to compromise. Each individual piece within our collection is developed using revolutionary, state-of-the-art fabrications—offering unprecedented moisture management, highly advanced kinetic stretch capabilities, and unparalleled long-term durability. From rigorous, high-intensity interval training sessions to refined, sophisticated casual outings, our elite performance gear guarantees that you remain entirely comfortable, incredibly confident, and visually striking at all times.
          </React.Fragment>,
          <React.Fragment key="2">
            Whether you are actively searching for dynamic compression garments that stabilize core muscles during heavy lifts, ultralight breathable tops precisely engineered to dramatically enhance airflow, or extremely sleek outerwear designed to flawlessly combat unpredictable elements in unmistakable style, you will find it right here. We strictly and systematically source all of our premium materials to thoroughly guarantee that every single reinforced seam and intelligently contoured panel powerfully supports elite physical exertion. Our revolutionary contemporary designs not only elevate your visual presence but proactively and efficiently assist in allowing you to aggressively push past your perceived physical limits. Feel the remarkable difference of intelligent, responsive sportswear that intuitively adapts directly to your unique needs.
          </React.Fragment>,
          <React.Fragment key="3">
            By seamlessly marrying modern, fashion-forward silhouettes with hardcore technical functionality and utility, <Link href="/shop?category=speedsuit" style={{ textDecoration: 'underline', color: 'var(--color-text)', textUnderlineOffset: '4px', fontWeight: 500 }}>DualDeer</Link> has firmly established itself as the very best premium activewear brand available on the market today. When you consciously choose to invest in our meticulously tailored, luxury garments, you are actively investing in peak physiological performance and an inherently superior, commanding aesthetic. Browse our incredibly diverse range of specialized athletic categories to find the exact performance lifestyle pieces necessary to flawlessly complete your luxury training wardrobe. Fully embrace the unmatched power, supreme physical resilience, and truly distinctive look that only DualDeer can provide—because achieving true greatness inherently requires gear that is equally exceptional.
          </React.Fragment>
        ]}
      />

      {/* 2. Category Strip */}
      <section className={styles.categoryStrip}>
        <div className={styles.categoryGrid}>
          {liveCategories.slice(0, 3).map((cat, i) => {
            const fallbackImages = [
              'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop',
              'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop',
            ];
            return (
              <motion.div
                key={cat.id || i}
                className={styles.catCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <img src={cat.image || fallbackImages[i % 3]} alt={cat.name} />
                <div className={styles.catOverlay}>
                   <h3>{cat.name.toUpperCase()}</h3>
                   <p>EXPLORE NOW</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Filter Navigation */}
      <section className={styles.filterSection} id="collection">
        <ul className={styles.filterList}>
          {filters.map(filter => (
            <li key={filter}>
              <button
                className={`${styles.filterBtn} ${activeFilter === filter && !activeGender ? styles.active : ''}`}
                onClick={() => {
                  setActiveFilter(filter);
                  if (["ALL", "SPECIAL", "BEST SELLER", "FEATURED PRODUCTS"].includes(filter)) {
                    setActiveGender(null);
                    setActiveType(null);
                  }
                }}
              >
                {filter}
              </button>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Product Grid + Sidebar */}
      <section className={styles.shopLayoutSection}>
        <div
          className={styles.shopLayoutBackdrop}
          style={backdropUrl ? { backgroundImage: `url(${backdropUrl})` } : {}}
        />

        <div className={styles.shopLayoutContainer}>
          {/* Mobile Filter Header */}
          <div className={styles.mobileFilterHeader}>
            <button className={styles.mobileFilterBtn} onClick={() => setIsMobileFilterOpen(true)}>
              <Filter size={16} strokeWidth={2} />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className={styles.mobileFilterBadge}>{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Sidebar */}
          <>
            {isMobileFilterOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={styles.mobileFilterBackdrop}
                onClick={() => setIsMobileFilterOpen(false)}
              />
            )}
            <aside className={`${styles.filterSidebar} ${isMobileFilterOpen ? styles.mobileFilterSidebarOpen : ''}`}>
              <div className={styles.glassPanel}>
                <div className={styles.sidebarHeader}>
                  <h3>Filter by Category</h3>
                  {isMobileFilterOpen && (
                    <button className={styles.closeFilterBtn} onClick={() => setIsMobileFilterOpen(false)}>
                      <X size={24} strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <ul className={styles.filterTree}>
                  <li
                    className={(!activeGender && !activeType && activeFilter === 'ALL') ? styles.activeFilter : styles.subItem}
                    onClick={() => { setActiveGender(null); setActiveType(null); setActiveFilter('ALL'); }}
                    style={{ fontWeight: 600, cursor: 'pointer', marginBottom: '1.5rem', marginLeft: 0 }}
                  >
                    All Products <span className={styles.badge}>{liveProducts.length}</span>
                  </li>
                  {liveCategories.map((cat) => (
                    <div key={cat.id || cat.name} style={{ marginBottom: '1.2rem' }}>
                      <div
                        className={activeGender === cat.name && !activeType ? styles.activeFilter : styles.groupTitle}
                        onClick={() => {
                          setActiveGender(activeGender === cat.name && !activeType ? null : cat.name);
                          setActiveType(null);
                          setActiveFilter('ALL');
                        }}
                        style={{ fontWeight: activeGender === cat.name ? 700 : 500 }}
                      >
                        {activeGender === cat.name ? '▾ ' : '▸ '}{cat.name}
                      </div>
                      {cat.subcategories && cat.subcategories.length > 0 && (
                        <div style={{ marginLeft: '0.2rem', display: activeGender === cat.name ? 'block' : 'none', marginTop: '0.8rem' }}>
                          {cat.subcategories.map((sub: string) => (
                            <li
                              key={sub}
                              className={activeType === sub ? styles.activeFilter : styles.subItem}
                              onClick={() => { setActiveGender(cat.name); setActiveType(sub); setActiveFilter('ALL'); }}
                              style={{ cursor: 'pointer', opacity: activeType === sub ? 1 : 0.6, marginBottom: '0.8rem', whiteSpace: 'nowrap' }}
                            >
                              {sub}
                            </li>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </ul>
                <ul className={styles.filterTree} style={{ marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                  <li onClick={() => { setActiveFilter('NEW ARRIVAL'); setActiveGender(null); setActiveType(null); }} className={activeFilter === 'NEW ARRIVAL' ? styles.activeFilter : ''} style={{ cursor: 'pointer' }}><span>🔍</span> New Arrival</li>
                  <li onClick={() => { setActiveFilter('BEST SELLER'); setActiveGender(null); setActiveType(null); }} className={activeFilter === 'BEST SELLER' ? styles.activeFilter : ''} style={{ cursor: 'pointer' }}><span>★</span> Best Seller</li>
                  <li onClick={() => { setActiveFilter('DISCOUNT'); setActiveGender(null); setActiveType(null); }} className={activeFilter === 'DISCOUNT' ? styles.activeFilter : ''} style={{ cursor: 'pointer' }}><span>%</span> On Discount</li>
                </ul>
              </div>
            </aside>
          </>

          {/* Product Grid */}
          <div className={styles.productGrid}>
            <AnimatePresence>
              {loading ? (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#fff' }}>Loading real-time inventory...</div>
              ) : displayProducts.length === 0 ? (
                <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '40px', color: '#fff' }}>No products matching this filter.</div>
              ) : displayProducts.map((product, i) => {
                if (i % 7 === 6) {
                  return (
                    <motion.div
                      key={`featured-${product.id || i}`}
                      className={styles.featuredCard}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
                    >
                      <Link href={`/product/${product.id}`} className={styles.featuredImageWrap}>
                        <img src={product.image} alt={product.name} className={styles.featuredImg} />
                      </Link>
                      <div className={styles.featuredInfo}>
                        <p className={styles.featuredLabel}>★ FEATURED PICK</p>
                        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h3 className={styles.featuredName}>{product.name}</h3>
                        </Link>
                        {product.description && (
                          <p className={styles.featuredDesc}>
                            {product.description.slice(0, 140)}{product.description.length > 140 ? '…' : ''}
                          </p>
                        )}
                        <div className={styles.featuredRating} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <div style={{ display: 'flex', gap: '1px' }}>
                            {[1, 2, 3, 4, 5].map(star => (
                              <span 
                                key={star} 
                                className={styles.star}
                                style={{ 
                                  opacity: star <= Math.round(product.rating || 5) ? 1 : 0.2,
                                  fontSize: '0.8rem'
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span style={{ fontWeight: 800 }}>{(product.rating || 5.0).toFixed(1)}</span>
                          <span style={{ opacity: 0.5, marginLeft: '0.3rem', fontSize: '0.7rem' }}>(Verified Client)</span>
                        </div>
                        <div className={styles.featuredPricing}>
                          {product.mrp && product.mrp > product.price && (
                            <del className={styles.featuredMrp}>₹{product.mrp.toFixed(2)}</del>
                          )}
                          <span className={styles.featuredPrice}>₹{product.price.toFixed(2)}</span>
                        </div>
                        {product.colors && product.colors.length > 0 && (
                          <div className={styles.colorSwatches} style={{ marginBottom: '1.2rem' }}>
                            {product.colors.map((color: string, idx: number) => (
                              <div key={idx} className={styles.colorCircle} style={{ backgroundColor: color }} title={color} />
                            ))}
                          </div>
                        )}
                        <div className={styles.featuredActions}>
                          <AnimatedCartButton
                            onAdd={() => addToCart({
                              id: product.id as string,
                              name: product.name,
                              price: product.price,
                              mrp: product.mrp,
                              image: product.image,
                              size: 'M',
                              quantity: 1,
                            })}
                            label="Add To Cart"
                          />
                          <button
                            className={styles.featuredBuyNow}
                            onClick={(e) => { e.preventDefault(); router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`); }}
                          >
                            Buy Now
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                }

                return (
                  <motion.div
                    key={product.id || i}
                    className={styles.glassCard}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: (i % 3) * 0.06, duration: 0.4 }}
                  >
                    <Link href={`/product/${product.id}`} className={styles.productImageGlass}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className={styles.primaryImg}
                      />
                      <img
                        src={(product.images && product.images.length > 1) ? product.images[1] : (product.images && product.images[0]) || product.image}
                        alt={`${product.name} alternate`} 
                        className={styles.secondaryImg} 
                      />
                    </Link>
                    <div className={styles.productInfoGlass}>
                      <div className={styles.infoTop}>
                        <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          <h4>{product.name}</h4>
                        </Link>
                        <p className={styles.priceContainer}>
                          {product.mrp && product.mrp > product.price && <del className={styles.mrp}>₹{product.mrp.toFixed(2)}</del>}
                          <span className={styles.price}>₹{product.price.toFixed(2)}</span>
                        </p>
                      </div>
                      {product.colors && product.colors.length > 0 && (
                        <div className={styles.colorSwatches}>
                          {product.colors.map((color: string, idx: number) => (
                            <div key={idx} className={styles.colorCircle} style={{ backgroundColor: color }} title={color} />
                          ))}
                        </div>
                      )}
                      <div className={styles.rating} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <div style={{ display: 'flex', gap: '1px' }}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <span 
                              key={star} 
                              className={styles.star}
                              style={{ 
                                opacity: star <= Math.round(product.rating || 5) ? 1 : 0.2,
                                fontSize: '0.85rem'
                              }}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span style={{ fontWeight: 800, marginLeft: '2px' }}>{(product.rating || 5.0).toFixed(1)}</span>
                        <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(Verified Client)</span>
                      </div>
                      <div className={styles.cardActionsGlass}>
                        <AnimatedCartButton
                          size="small"
                          className={styles.addToCartBtnGlass}
                          onAdd={() => addToCart({
                            id: product.id as string,
                            name: product.name,
                            price: product.price,
                            mrp: product.mrp,
                            image: product.image,
                            size: 'M',
                            quantity: 1,
                          })}
                        />
                        <button
                          className={styles.buyNowBtnGlass}
                          onClick={(e) => { e.preventDefault(); router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`); }}
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* 5. Benefits Bar */}
      <section className={styles.benefitsBar}>
        <div className={styles.benefit}>
          <h4>FREE INTERNATIONAL DELIVERY</h4>
          <p>On all orders over $150.00</p>
        </div>
        <div className={styles.benefit}>
          <h4>50% OFF MEN&apos;S SUITS</h4>
          <p>Applies only to selected items marked down on site</p>
        </div>
      </section>

      {/* 6. Recommendations Slider */}
      <section className={styles.recommendationsSection}>
        <div className={styles.recHeader}>
          <h2>Explore our recommendations</h2>
          <div className={styles.recArrows}>
            <button aria-label="Previous" className={styles.arrowBtn} onClick={() => scrollSlider('left')}><ChevronLeft size={20} strokeWidth={1} /></button>
            <button aria-label="Next" className={styles.arrowBtn} onClick={() => scrollSlider('right')}><ChevronRight size={20} strokeWidth={1} /></button>
          </div>
        </div>
        <div className={styles.infinitySliderContainer}>
          <div className={styles.infinitySliderTrack} ref={sliderRef}>
            {liveProducts.slice(0, 16).map((product, i) => (
              <div key={`rec-${product.id || i}-${i}`} className={styles.glassCard}>
                <div className={styles.productImageGlass}>
                  <Link href={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%', position: 'relative' }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      className={styles.primaryImg}
                    />
                    <img
                      src={(product.images && product.images.length > 1) ? product.images[1] : (product.images && product.images[0]) || product.image}
                      alt={`${product.name} alternate view`} 
                      className={styles.secondaryImg} 
                    />
                  </Link>
                </div>
                <div className={styles.productInfoGlass}>
                  <div className={styles.infoTop}>
                    <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <h4>{product.name}</h4>
                    </Link>
                    <p className={styles.priceContainer}>
                      {product.mrp && product.mrp > product.price && <del className={styles.mrp}>₹{product.mrp.toFixed(2)}</del>}
                      <span className={styles.price}>₹{product.price.toFixed(2)}</span>
                    </p>
                  </div>
                  {product.colors && product.colors.length > 0 && (
                    <div className={styles.colorSwatches}>
                      {product.colors.map((color: string, idx: number) => (
                        <div key={idx} className={styles.colorCircle} style={{ backgroundColor: color }} title={color} />
                      ))}
                    </div>
                  )}
                  <div className={styles.rating} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '1px' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className={styles.star}
                          style={{ 
                            opacity: star <= Math.round(product.rating || 5) ? 1 : 0.2,
                            fontSize: '0.85rem'
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span style={{ fontWeight: 800, marginLeft: '2px' }}>{(product.rating || 5.0).toFixed(1)}</span>
                    <span style={{ opacity: 0.5, fontSize: '0.75rem' }}>(Verified Client)</span>
                  </div>
                  <div className={styles.cardActionsGlass}>
                    <AnimatedCartButton
                      size="small"
                      className={styles.addToCartBtnGlass}
                      onAdd={() => addToCart({
                        id: product.id as string,
                        name: product.name,
                        price: product.price,
                        mrp: product.mrp,
                        image: product.image,
                        size: 'M',
                        quantity: 1,
                      })}
                    />
                    <button
                      className={styles.buyNowBtnGlass}
                      onClick={(e) => { e.preventDefault(); router.push(`/checkout?buyNow=${product.id}&size=M&qty=1`); }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
