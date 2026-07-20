import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Heart, Star, ArrowRight, Activity, User, Leaf, Venus, Mars, Baby, Users, Shirt, Tag, Crown, Droplets, Wind } from 'lucide-react';
import styles from './ProductCard.module.css';

interface ProductCardProps {
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

export default function ProductCard({
  product,
  i = 0,
  wishlist = [],
  toggleWishlist,
  renderPrice
}: ProductCardProps) {
  const router = useRouter();
  
  const images = (product.images && product.images.length > 0)
    ? (product.images.includes(product.image) ? product.images : [product.image, ...product.images])
    : [product.image];

  const inWishlist = wishlist.includes(product.id || '');

  return (
    <motion.div 
      className={styles.card}
      onClick={() => router.push(`/product/${product.slug}`)}
      style={{ cursor: 'pointer' }}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: i * 0.05 }}
    >
      <div className={styles.imageSection}>
        <div className={styles.imageLink}>
          <img 
            src={images[0]} 
            alt={product.name} 
            className={styles.primaryImage}
          />
          <img 
            src={images.length > 1 ? images[1] : images[0]} 
            alt={`${product.name} alternate view`} 
            className={styles.hoverImage} 
            loading="lazy"
          />
        </div>
        
        {toggleWishlist && (
          <button 
            className={`${styles.wishlistBtn} ${inWishlist ? styles.active : ''}`}
            onClick={(e) => toggleWishlist(e, product.id)}
            aria-label="Toggle wishlist"
          >
            <Heart size={20} fill={inWishlist ? "currentColor" : "none"} />
          </button>
        )}
        
        <div className={styles.imageRating}>
          <div className={styles.rating}>
            <Star size={12} className={styles.starIcon} fill="currentColor" />
            <span>{(product.rating || 5.0).toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className={styles.detailsWrapper}>
        <div className={styles.detailsSection}>
          <div className={styles.headerRow}>
            <div className={styles.titleArea}>
              <h3 className={styles.title}>{product.name?.toUpperCase() || ''}</h3>
              <span className={styles.mobileSubtitle}>{getCategoryInfo(product.category).label}</span>
            </div>
          </div>

          <hr className={styles.divider} />

          <div className={styles.featuresRow}>
            {getSubcategoryInfo(product.subcategory || product.fit) && (
              <>
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>{getSubcategoryInfo(product.subcategory || product.fit)?.icon}</div>
                  <span>{getSubcategoryInfo(product.subcategory || product.fit)?.label}</span>
                </div>
                <div className={styles.featureDivider} />
              </>
            )}
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>{getCategoryInfo(product.category).icon}</div>
              <span>{getCategoryInfo(product.category).label}</span>
            </div>
            {getThirdFeature(product) && (
              <div className={styles.thirdFeatureWrap}>
                <div className={styles.featureDivider} />
                <div className={styles.featureItem}>
                  <div className={styles.featureIcon}>{getThirdFeature(product)?.icon}</div>
                  <span>{getThirdFeature(product)?.label}</span>
                </div>
              </div>
            )}
          </div>

          <hr className={styles.divider} />

          <div className={styles.bottomRow}>
            <div className={styles.priceArea}>
              <span className={styles.mobilePriceLabel}>PRICE</span>
              <span className={styles.price}>{renderPrice(product.price)}</span>
              <span className={styles.mobileTaxLabel}>Inclusive of all taxes</span>
            </div>
            <button className={styles.actionButton} aria-label="View Product Details">
              <span>VIEW DETAILS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
