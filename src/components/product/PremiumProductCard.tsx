import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Activity, User, Leaf, Venus, Mars, Baby, Users, Shirt, Tag, Crown, Droplets, Wind } from 'lucide-react';
import styles from './PremiumProductCard.module.css';

interface PremiumProductCardProps {
  product: any;
  i?: number;
  wishlist?: string[];
  toggleWishlist?: (e: React.MouseEvent, productId: string) => void;
  renderPrice: (price: number) => React.ReactNode;
}

const getCategoryInfo = (category: string) => {
  const cat = (category || '').toLowerCase();
  if (cat === 'women') return { label: 'Women', icon: <Venus size={16} /> };
  if (cat === 'men') return { label: 'Men', icon: <Mars size={16} /> };
  if (cat === 'kids') return { label: 'Kids', icon: <Baby size={16} /> };
  if (cat === 'unisex') return { label: 'Unisex', icon: <Users size={16} /> };
  return { label: category || 'Unisex', icon: <User size={16} /> };
};

const getSubcategoryInfo = (subcat: string) => {
  if (!subcat) return null;
  const sub = subcat.toLowerCase();
  if (sub.includes('muscle') || sub.includes('active')) return { label: subcat, icon: <Activity size={16} /> };
  if (sub.includes('shirt') || sub.includes('top') || sub.includes('hoodie')) return { label: subcat, icon: <Shirt size={16} /> };
  return { label: subcat, icon: <Tag size={16} /> };
};

const getThirdFeature = (product: any) => {
  const desc = (product.description || '').toLowerCase();
  if (desc.includes('lightweight')) return { label: 'Lightweight', icon: <Wind size={16} /> };
  if (desc.includes('waterproof') || desc.includes('water resistant') || desc.includes('sweat')) return { label: 'Moisture Wicking', icon: <Droplets size={16} /> };
  if (desc.includes('cotton')) return { label: 'Pure Cotton', icon: <Leaf size={16} /> };
  if (desc.includes('warm') || desc.includes('winter')) return { label: 'Winter Wear', icon: <Leaf size={16} /> };
  if (product.isPremium) return { label: 'Premium Elite', icon: <Crown size={16} /> };
  return null;
};

export default function PremiumProductCard({
  product,
  i = 0,
  wishlist = [],
  toggleWishlist,
  renderPrice
}: PremiumProductCardProps) {
  const images = (product.images && product.images.length > 0)
    ? (product.images.includes(product.image) ? product.images : [product.image, ...product.images])
    : [product.image];
    
  const isWishlisted = wishlist.includes(product.id);
  const router = useRouter();

  return (
    <motion.div 
      className={styles.card}
      onClick={() => router.push(`/product/${product.slug}`)}
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: (i % 12) * 0.08, duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className={styles.imageSection}>
        {/* RIBBON */}
        <div className={styles.ribbon}>
          <img src="/logo.png" alt="DualDeer Logo" className={styles.ribbonIcon} style={{ objectFit: 'contain' }} />
          <span className={styles.ribbonText}>ELITE<span className={styles.desktopOnly}><br/>SERIES</span></span>
        </div>

        {/* SIDEBAR */}
        <div className={styles.sidebar}>
          <div className={styles.verticalText}>
            DUALDEER ELITE COLLECTION
          </div>
          <div className={styles.paginationGroup}>
            <div className={styles.pageNumber}>01<br/><span>OF {images.length.toString().padStart(2, '0')}</span></div>
            <div className={styles.dotsContainer}>
              {images.map((_: any, idx: number) => (
                <div key={idx} className={`${styles.dotIndicator} ${idx === 0 ? styles.activeDotIndicator : ''}`} />
              ))}
            </div>
          </div>
        </div>


        
        {toggleWishlist && (
          <button 
            className={styles.wishlistBtn}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(e, product.id);
            }}
            aria-label="Toggle Wishlist"
          >
            <Heart size={18} fill={isWishlisted ? "white" : "none"} color="white" />
          </button>
        )}

        <div className={styles.imageLink}>
          <img 
            src={images[0]} 
            alt={product.name} 
            className={`${styles.image} ${styles.primaryImage}`}
          />
          {images.length > 1 && (
            <img 
              src={images[1]} 
              alt={`${product.name} alternate view`} 
              className={`${styles.image} ${styles.hoverImage}`}
              loading="lazy"
            />
          )}
        </div>

        <div className={styles.imageRating}>
          <div className={styles.ratingValue}>
            <span className={styles.star}>★</span>
            <span>{(product.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailsWrapper}>
        {/* Bottom Curve Overlay - STROKE ONLY */}
        <svg 
          className={styles.curveOverlay} 
          viewBox="0 0 100 24" 
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="metallicCurveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={styles.glowStop1} />
              <stop offset="35%" className={styles.glowStop2} />
              <stop offset="70%" className={styles.glowStop3} />
              <stop offset="85%" className={styles.glowStop4} />
              <stop offset="100%" className={styles.glowStop5} />
            </linearGradient>
          </defs>
          <path 
            d="M 0,12 C 30,28 70,0 100,5" 
            fill="none" 
            stroke="url(#metallicCurveGlow)" 
            strokeWidth="2" 
            vectorEffect="non-scaling-stroke"
            className={styles.curveStroke} 
          />
        </svg>

        <div className={styles.detailsSection}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <div className={styles.titleLink}>
              <h3 className={styles.title}>{product.name}</h3>
            </div>
          </div>
        </div>

        <div className={styles.featuresRow}>
          {getSubcategoryInfo(product.subcategory || product.fit) && (
            <>
              <div className={styles.feature}>
                {getSubcategoryInfo(product.subcategory || product.fit)?.icon}
                <span>{getSubcategoryInfo(product.subcategory || product.fit)?.label}</span>
              </div>
              <div className={styles.divider} />
            </>
          )}
          <div className={styles.feature}>
            {getCategoryInfo(product.category).icon}
            <span>{getCategoryInfo(product.category).label}</span>
          </div>
          {getThirdFeature(product) && (
            <div className={styles.thirdFeatureWrap}>
              <div className={styles.divider} />
              <div className={styles.feature}>
                {getThirdFeature(product)?.icon}
                <span>{getThirdFeature(product)?.label}</span>
              </div>
            </div>
          )}
        </div>

        <div className={styles.footerRow}>
          <div className={styles.priceArea}>
            <span className={styles.priceLabel}>PRICE</span>
            <div className={styles.priceValue}>
              {renderPrice(product.price === 0 && product.mrp ? product.mrp : product.price)}
            </div>
            <span className={styles.taxLabel}>INCLUSIVE OF ALL TAXES</span>
          </div>
          <div className={styles.viewDetailsBtn}>
            <div className={styles.btnInner}>
              <span>VIEW DETAILS</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </div>
          </div>
        </div>
      </div>
      </div>
    </motion.div>
  );
}
