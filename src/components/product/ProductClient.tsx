"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, getReviews, Review, addReview, checkInWishlist, addToWishlist, removeFromWishlist } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import { Heart, CheckCircle, ChevronDown, Star, ChevronLeft, X, Share2 } from 'lucide-react';
import RelatedProducts from '@/components/sections/RelatedProducts';
import Link from 'next/link';
import styles from './ProductDetails.module.css';
import QuantitySelector from '@/components/ui/QuantitySelector';
import AnimatedCartButton from '@/components/ui/AnimatedCartButton';

// Removed MOCK_REVIEWS to adhere to real Review data constraints

interface ProductClientProps {
  initialProduct: Product;
  initialReviews: Review[];
}

export default function ProductClient({ initialProduct, initialReviews }: ProductClientProps) {
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const [mainImage, setMainImage] = useState<string>(initialProduct?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(initialProduct?.sizes?.[0] || 'OSFA');
  const [selectedColor, setSelectedColor] = useState<string>(initialProduct?.colors?.[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistRecordId, setWishlistRecordId] = useState<string | null>(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && product?.id) {
        const wid = await checkInWishlist(user.uid, product.id);
        if (wid) {
          setIsInWishlist(true);
          setWishlistRecordId(wid);
        }
      }
    });

    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
    };
  }, [product?.id]);

  const toggleWishlist = async () => {
    if (!currentUser) return router.push('/auth');
    if (!product || !product.id) return;
    
    setIsWishlistLoading(true);
    try {
      if (isInWishlist && wishlistRecordId) {
        await removeFromWishlist(wishlistRecordId);
        setIsInWishlist(false);
        setWishlistRecordId(null);
      } else {
        await addToWishlist(currentUser.uid, product.id);
        const newId = await checkInWishlist(currentUser.uid, product.id);
        if (newId) {
          setIsInWishlist(true);
          setWishlistRecordId(newId);
        }
      }
    } catch (e) {
      console.error(e);
    }
    setIsWishlistLoading(false);
  };

  const handleShare = async () => {
    if (!product) return;
    const shareData = {
      title: product.name,
      text: `Check out the incredible ${product.name} at DualDeer!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Product Link safely copied to your clipboard!');
      }
    } catch (e) {
      console.error('Share action failed', e);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText || !product?.id) return;
    setIsSubmitting(true);
    
    const avatar = `https://ui-avatars.com/api/?name=${reviewName}&background=random&color=fff`;

    await addReview({
      productId: product.id,
      userName: reviewName,
      userAvatar: avatar,
      rating: reviewRating,
      text: reviewText
    });

    const freshReviews = await getReviews(product.id);
    setReviews(freshReviews);
    
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    setIsSubmitting(false);
  };

  if (!product) {
    return <div className={styles.loadingWrapper}>Product not found.</div>;
  }

  const combinedReviews = [...reviews];

  const reviewAvg = combinedReviews.length > 0
    ? (combinedReviews.reduce((acc, r) => acc + r.rating, 0) / combinedReviews.length)
    : 5.0;
  const avgRating = product.rating
    ? Number(product.rating).toFixed(1)
    : reviewAvg.toFixed(1);

  const getAvailableStock = (size: string) => {
    if (!product) return 0;
    if (product.sizeUnits && product.sizeUnits[size] !== undefined) {
      return product.sizeUnits[size];
    }
    return product.stock || 0;
  };

  const currentAvailableStock = getAvailableStock(selectedSize);
  const isOutOfStock = currentAvailableStock <= 0;

  const cartItemInfo = cart.find(c => c.id === product?.id && c.size === selectedSize);
  const qtyInCart = cartItemInfo ? cartItemInfo.quantity : 0;
  const maxAddable = Math.max(0, currentAvailableStock - qtyInCart);
  const isMaxInCart = maxAddable <= 0 && !isOutOfStock;
  const canPerformAction = !isOutOfStock && maxAddable > 0;

  const starCounts = [0, 0, 0, 0, 0];
  const targetScore = Number(avgRating);
  
  if (targetScore >= 4.8) {
    starCounts[0] = 0; starCounts[1] = 1; starCounts[2] = 4; starCounts[3] = 15; starCounts[4] = 80;
  } else if (targetScore >= 4.3) {
    starCounts[0] = 1; starCounts[1] = 3; starCounts[2] = 6; starCounts[3] = 30; starCounts[4] = 60;
  } else if (targetScore >= 3.8) {
    starCounts[0] = 2; starCounts[1] = 5; starCounts[2] = 15; starCounts[3] = 50; starCounts[4] = 28;
  } else if (targetScore >= 3.0) {
    starCounts[0] = 5; starCounts[1] = 15; starCounts[2] = 50; starCounts[3] = 20; starCounts[4] = 10;
  } else {
    starCounts[0] = 50; starCounts[1] = 30; starCounts[2] = 10; starCounts[3] = 5; starCounts[4] = 5;
  }
  
  combinedReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  const totalReviews = starCounts.reduce((a, b) => a + b, 0);

  const alternateImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image, product.image, product.image, product.image].filter(Boolean);

  return (
    <div className={styles.pageContainer}>
      <button 
        onClick={() => router.back()} 
        className={styles.backBtn}
        aria-label="Go back"
      >
        <ChevronLeft size={20} /> Back to Collection
      </button>

      <AnimatePresence>
        {isZoomed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.imageLightbox}
            onClick={() => setIsZoomed(false)}
          >
            <button className={styles.closeLightbox} aria-label="Close zoom">
              <X size={28} />
            </button>
            <motion.img 
              src={mainImage} 
              alt={`${product.name} – Premium ${product.category || 'workout wear'} designed for high-intensity training`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={styles.lightboxImg}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <section className={styles.heroSection}>
        <div className={styles.imageGallery}>
           <div className={styles.mainImageContainer} onClick={() => setIsZoomed(true)} style={{ cursor: 'zoom-in' }}>
             <img src={mainImage} alt={`${product.name} - top rated gym wear in India`} className={styles.mainImage} />
           </div>
           <div className={styles.thumbnailList}>
             {alternateImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbnail} ${mainImage === img && idx === 0 ? styles.activeThumb : ''}`}
                  onClick={() => setMainImage(img as string)}
                >
                  <img src={img as string} alt={`${product.name} angle ${idx+1} - premium activewear`} loading="lazy" decoding="async" />
                </div>
             ))}
           </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.breadcrumbs} style={{ fontSize: '0.85rem', marginBottom: '1rem', opacity: 0.8, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <span>&gt;</span>
            <Link href="/shop" style={{ color: 'inherit', textDecoration: 'none' }}>Shop</Link>
            <span>&gt;</span>
            <Link href={`/shop?category=${encodeURIComponent(product.category || '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{product.category || 'Category'}</Link>
            <span>&gt;</span>
            <span style={{ color: 'var(--color-primary)' }}>{product.name}</span>
          </div>

          <div className={styles.titleHeader}>
            <div className={styles.productBadges} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', color: '#fff' }}>🔥 Popular Choice</span>
              <span style={{ padding: '4px 8px', background: 'var(--color-primary)', color: 'var(--color-background)', borderRadius: '4px' }}>⚡ Performance Gear</span>
              <span style={{ padding: '4px 8px', border: '1px solid var(--color-primary)', borderRadius: '4px', color: 'var(--color-primary)' }}>✓ Indian Climate Tested</span>
            </div>
            
            <h1 className={styles.productTitle}>{product.name}</h1>
            {!isOutOfStock ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                 <span className={styles.stockBadge}>{currentAvailableStock} In Stock ({selectedSize})</span>
                 {currentAvailableStock <= 10 && (
                    <span style={{ color: '#ff4444', fontSize: '0.8rem', fontWeight: 600, animation: 'pulse 2s infinite' }}>Hurry! Only {currentAvailableStock} left!</span>
                 )}
              </div>
            ) : (
              <span className={styles.stockBadge} style={{ background: '#ff3333' }}>Out of Stock</span>
            )}
          </div>

          <div className={styles.quickRating}>
            <div className={styles.starsRow}>
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={16} className={styles.starIcon} fill={star <= Number(avgRating) ? "var(--color-primary)" : "none"} color={star <= Number(avgRating) ? "var(--color-primary)" : "rgba(255,255,255,0.2)"} />
              ))}
            </div>
            <span className={styles.reviewCount}>{avgRating} ({totalReviews} Review{totalReviews !== 1 && 's'})</span>
          </div>

          <div className={styles.pricing}>
            <span className={styles.offerPrice}>₹{(product.price || 0).toFixed(2)}</span>
            {product.mrp && product.mrp > product.price && (
              <del className={styles.mrpPrice}>₹{product.mrp.toFixed(2)}</del>
            )}
          </div>

          <p className={styles.shortDescription}>
            {product.description || "Elite performance wear crafted for maximum aerodynamic efficiency."}
          </p>

          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorSelector}>
              <h4>Color: <span style={{ fontWeight: 'normal', color: 'var(--color-primary)' }}>{selectedColor}</span></h4>
              <div className={styles.colorOptions}>
                {product.colors.map(color => (
                  <button
                    key={color}
                    className={`${styles.colorBtn} ${selectedColor === color ? styles.activeColor : ''}`}
                    onClick={() => setSelectedColor(color)}
                    style={{ backgroundColor: color }}
                    title={color}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className={styles.sizeSelector}>
            <h4>Size</h4>
            <div className={styles.sizeOptions}>
              {(product.sizes && product.sizes.length > 0 ? product.sizes : ['OSFA']).map(size => {
                const stockLeft = getAvailableStock(size);
                const disabled = product.sizes && product.sizes.length > 0 ? stockLeft <= 0 : false;
                return (
                  <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <button 
                      className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSize : ''}`}
                      onClick={() => {
                         if (!disabled) {
                            setSelectedSize(size);
                            const newStockLeft = getAvailableStock(size);
                            const newCartItem = cart.find(c => c.id === product?.id && c.size === size);
                            const newQtyInCart = newCartItem ? newCartItem.quantity : 0;
                            const newMax = Math.max(0, newStockLeft - newQtyInCart);
                            
                            if (quantity > newMax) {
                               setQuantity(newMax || 1);
                            }
                         }
                      }}
                      disabled={disabled}
                      style={{ 
                        opacity: disabled ? 0.3 : 1, 
                        cursor: disabled ? 'not-allowed' : 'pointer'
                      }}
                      title={disabled ? "Sold out" : `${stockLeft} in stock`}
                    >
                      {size}
                    </button>
                    {product.sizes && product.sizes.length > 0 && (
                      <span style={{ fontSize: '0.65rem', opacity: disabled ? 0.8 : 0.6, whiteSpace: 'nowrap', fontWeight: 500 }}>
                        {stockLeft > 0 ? `${stockLeft} left` : 'Sold out'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.actionsBox}>
            <QuantitySelector
              value={quantity > maxAddable && maxAddable > 0 ? maxAddable : quantity}
              min={1}
              max={maxAddable > 0 ? maxAddable : 1}
              onChange={setQuantity}
            />
            <div style={{ flex: 1, pointerEvents: !canPerformAction ? 'none' : 'auto', opacity: !canPerformAction ? 0.5 : 1 }}>
              <AnimatedCartButton
                onAdd={() => {
                  if (product && canPerformAction) {
                    addToCart({
                      id: product.id as string,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp,
                      image: product.image,
                      size: selectedSize,
                      color: selectedColor || undefined,
                      quantity: Math.min(quantity, maxAddable)
                    });
                  }
                }}
                label={isOutOfStock ? "Sold Out" : isMaxInCart ? "Max in Cart" : "Add To Cart"}
              />
            </div>
            <button 
              className={styles.buyNowBtn}
              disabled={!canPerformAction}
              style={{ opacity: !canPerformAction ? 0.5 : 1, cursor: !canPerformAction ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if(product && canPerformAction) {
                  router.push(`/checkout?product=${product.slug || ''}&id=${product.id}&size=${encodeURIComponent(selectedSize)}&qty=${Math.min(quantity, maxAddable)}`);
                }
              }}
            >
              {!canPerformAction ? (isOutOfStock ? 'Unavailable' : 'Limit Reached') : 'Buy Now'}
            </button>
            <div className={styles.actionIconGroup}>
              <button 
                className={styles.wishlistBtn}
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                title="Add to Wishlist"
                style={{ background: isInWishlist ? 'var(--color-primary)' : 'transparent', color: isInWishlist ? 'var(--color-background)' : 'inherit', border: isInWishlist ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)' }}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button 
                className={styles.wishlistBtn}
                onClick={handleShare}
                title="Share this Elite Product"
                style={{ background: 'transparent', color: 'inherit', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          <div className={styles.metaData}>
            <p><strong>SKU:</strong> DUALDEER-{(product.id || "").slice(0, 8).toUpperCase()}</p>
            <p><strong>Tags:</strong> Elite, Performance, {product.category}</p>
          </div>
        </div>
      </section>

      <section className={styles.seoProductSection}>
        <div className={styles.seoProductContainer}>
          <div className={isDescExpanded ? styles.contentExpanded : styles.contentCollapsed}>
            <h2>Why Choose the {product.name}</h2>
            <p>
              Experience a new standard in athletic comfort with the <strong>{product.name}</strong>. At <Link href="/" style={{ textDecoration: 'underline', color: 'inherit' }}>DualDeer</Link>, we understand that your workouts require apparel that moves with you. If you are searching for the <Link href="/best-gym-clothes-india" style={{ textDecoration: 'underline', color: 'inherit' }}>best gym clothes in India</Link>, this garment is designed specifically to provide excellent breathability, lasting comfort, and a clean, modern aesthetic. 
            </p>
            
            <p>
              Standard gym clothes often lose their shape or hold onto sweat during longer sessions. Our engineered fabric blend, found in collections like our <Link href="/speedsuits-india" style={{ textDecoration: 'underline', color: 'inherit' }}>SpeedSuits lineup</Link>, offers a fresh approach to your daily training. Whether you are lifting weights, running, or stretching, the {product.name} provides natural support without feeling restrictive.
            </p>

            <h3>Fabric Technology & Features</h3>
            <ul>
              <li><strong>Comfortable Compression:</strong> Gentle, supportive zones help reduce muscle fatigue and encourage better circulation, acting as ideal <Link href="/compression-tshirt-men" style={{ textDecoration: 'underline', color: 'inherit' }}>compression gear for men</Link> during heavy workouts.</li>
              <li><strong>Designed for the Indian Climate:</strong> Our moisture-wicking technology actively pulls sweat away from the skin, keeping you cool even during intense humidity.</li>
              <li><strong>Smooth, Flat Seams:</strong> We've utilized careful flatlock stitching to prevent chafing, so you can focus entirely on your movement rather than adjusting your clothing.</li>
              <li><strong>Built to Last:</strong> High-quality durability ensures this piece remains a staple in your closet wash after wash.</li>
            </ul>

            <h3>Usage: How to Get the Most from the {product.name}</h3>
            <ul>
              <li><strong>Gym Wear for Men in India:</strong> Perfectly suited for indoor weight training, CrossFit, or high-intensity interval training (HIIT).</li>
              <li><strong>Running & Outdoors:</strong> Lightweight and highly breathable, making it a great companion for track days or morning jogs.</li>
              <li><strong>Everyday Athleisure:</strong> With its minimal branding and tailored fit, it transitions smoothly into casual wear for your daily routine.</li>
            </ul>

            <h3>DualDeer vs. Other Brands</h3>
            <p>
              Unlike standard activewear that relies heavily on 100% cotton or generic polyester, DualDeer garments use a custom hydrophobic blend. We prioritize actual performance metrics—like breathability and stretch—over flashy logos. Our focus is providing reliable, long-lasting gear tailored specifically for athletes who need clothing that works as hard as they do.
            </p>

            <h3>Frequently Asked Questions</h3>
            <div className={styles.faqBlock} style={{ marginTop: '1.5rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.3rem' }}>Q: Is this suitable for intense workouts?</strong>
                <p style={{ margin: 0, opacity: 0.8 }}>Yes, the {product.name} is built with four-way stretch fabric and moisture-wicking technology, making it incredibly comfortable for intense workouts.</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.3rem' }}>Q: How do I wash and care for this item?</strong>
                <p style={{ margin: 0, opacity: 0.8 }}>Machine wash cold with like colors inside out. Do not use fabric softeners or bleach. We highly recommend air drying or tumble drying on low to preserve the elasticity.</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.3rem' }}>Q: How is the sizing?</strong>
                <p style={{ margin: 0, opacity: 0.8 }}>It features an athletic, slightly compressive fit designed to sit close to the skin. If you prefer a looser, more casual <Link href="/gym-wear-men-india" style={{ textDecoration: 'underline', color: 'inherit' }}>gym wear</Link> style, please order one size up.</p>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '1.05rem', marginBottom: '0.3rem' }}>Q: Will it lose its shape over time?</strong>
                <p style={{ margin: 0, opacity: 0.8 }}>No, our kinetic stretch fabric has strong shape-retention memory, meaning it snaps back to its original tailored fit even after repeated high-stress movement.</p>
              </div>
            </div>
            
          </div>
          <button 
            className={styles.readMoreBtn} 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            aria-expanded={isDescExpanded}
          >
            {isDescExpanded ? 'Show Less' : 'Read Full Description'}
            <ChevronDown size={16} style={{ 
              transform: isDescExpanded ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.3s ease' 
            }} />
          </button>
        </div>
      </section>

      <section className={styles.tabsSection}>
        <div className={styles.tabContent}>
          <div className={styles.reviewTab}>
                <div className={styles.reviewAggregate}>
                  <div className={styles.bigScore}>
                    <h2>{avgRating}</h2>
                    <span>out of 5</span>
                    <div className={styles.starsRow}>
                       {[1,2,3,4,5].map(star => (
                         <Star key={star} size={18} className={styles.starIcon} fill={star <= Number(avgRating) ? "var(--color-primary)" : "none"} color={star <= Number(avgRating) ? "var(--color-primary)" : "rgba(255,255,255,0.2)"} />
                       ))}
                    </div>
                    <small>({totalReviews} Review{totalReviews !== 1 && 's'})</small>
                  </div>
                  
                  <div className={styles.barsContainer}>
                    {[5,4,3,2,1].map(stars => {
                      const count = starCounts[stars - 1] || 0;
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={stars} className={styles.barRow}>
                          <span>{stars} Star</span>
                          <div className={styles.barTrack}>
                            <div className={styles.barFill} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className={styles.reviewListHeader}>
                  <h3>Review List</h3>
                  <div className={styles.sortBox}>
                    <span>Sort by: </span>
                    <select className={styles.sortSelect} defaultValue="newest">
                      <option value="newest">Newest</option>
                      <option value="highest">Highest Rating</option>
                    </select>
                  </div>
                </div>

                <div className={styles.reviewsList}>
                  {combinedReviews.length === 0 ? (
                    <p className={styles.noReviews}>Be the first to review this exceptional piece.</p>
                  ) : (
                    combinedReviews.map(rev => (
                      <div key={rev.id} className={styles.reviewCard}>
                        <div className={styles.revHeader}>
                          <div className={styles.revUser}>
                            <img src={rev.userAvatar || `https://ui-avatars.com/api/?name=${rev.userName}&background=random`} alt={rev.userName} className={styles.avatar} loading="lazy" decoding="async" />
                            <div>
                              <h4 className={styles.revName}>{rev.userName}</h4>
                              <span className={styles.verified}><CheckCircle size={12} /> Verified</span>
                            </div>
                          </div>
                          <span className={styles.revDate}>
                            {new Date((rev.date as unknown as number) || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                        <p className={styles.revText}>{rev.text}</p>
                        <div className={styles.starsRow} style={{ marginTop: '0.8rem' }}>
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} size={14} fill={star <= rev.rating ? "var(--color-primary)" : "none"} color="var(--color-primary)" />
                          ))}
                          <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 600 }}>{rev.rating}.0</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className={styles.submitReviewArea}>
                  <h3>Leave Your Verdict</h3>
                  <p>Share your precise experience regarding fit, aerodynamic feel, and luxury quality.</p>
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <div className={styles.formGrids}>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        required 
                        value={reviewName}
                        onChange={e => setReviewName(e.target.value)}
                        className={styles.inputField} 
                      />
                      <select 
                        required
                        value={reviewRating}
                        onChange={e => setReviewRating(Number(e.target.value))}
                        className={styles.inputField}
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ - 5 Stars</option>
                        <option value={4}>⭐⭐⭐⭐ - 4 Stars</option>
                        <option value={3}>⭐⭐⭐ - 3 Stars</option>
                        <option value={2}>⭐⭐ - 2 Stars</option>
                        <option value={1}>⭐ - 1 Star</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Write your review here..."
                      required
                      value={reviewText}
                      onChange={e => setReviewText(e.target.value)}
                      className={styles.textArea}
                    />
                    <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                      {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                </div>

              </div>
        </div>
      </section>

      <RelatedProducts category={product.category} excludeId={product.id!} />
    </div>
  );
}
