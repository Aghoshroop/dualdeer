"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, getReviews, Review, addReview, checkInWishlist, addToWishlist, removeFromWishlist, updateReview, deleteReview } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import { Heart, CheckCircle, ChevronDown, Star, ChevronLeft, X, Share2, ImagePlus, Edit2, Trash2, User, ArrowRight, ShieldCheck, Award, Gem, Users, Quote } from 'lucide-react';
import RelatedProducts from '@/components/sections/RelatedProducts';
import Link from 'next/link';
import styles from './ProductDetails.module.css';
import QuantitySelector from '@/components/ui/QuantitySelector';
import AnimatedCartButton from '@/components/ui/AnimatedCartButton';
import { useFomoStock } from '@/hooks/useFomoStock';
import MobileProductGallery from './MobileProductGallery';
import BrandProductDetails from './BrandProductDetails';
import RelatedGuides from './RelatedGuides';

import { useCurrency } from '@/context/CurrencyContext';
import Breadcrumb from '@/components/ui/Breadcrumb';
import * as metaPixel from '@/lib/metaPixel';

interface ProductClientProps {
  initialProduct: Product;
  initialReviews: Review[];
}

export default function ProductClient({ initialProduct, initialReviews }: ProductClientProps) {
  const [reviewCount, setReviewCount] = useState(0);

  const { addToCart, cart } = useCart();
  const { formatPrice, renderPrice } = useCurrency();
  const router = useRouter();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const [mainImage, setMainImage] = useState<string>(initialProduct?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(initialProduct?.sizes?.[0] || 'OSFA');
  const [selectedColor, setSelectedColor] = useState<string>(initialProduct?.colors?.[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [isShortDescExpanded, setIsShortDescExpanded] = useState(false);
  
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewImage, setReviewImage] = useState<File | null>(null);
  const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mobileSlideIdx, setMobileSlideIdx] = useState(0);
  
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editReviewText, setEditReviewText] = useState('');
  const [editReviewRating, setEditReviewRating] = useState(5);

  const [authLoading, setAuthLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistRecordId, setWishlistRecordId] = useState<string | null>(null);
  const [isWishlistLoading, setIsWishlistLoading] = useState(false);
  useEffect(() => {
    if (product?.id) {
      metaPixel.event('ViewContent', {
        content_name: product.name,
        content_ids: [product.id],
        content_category: product.category || 'Apparel',
        content_type: 'product',
        value: product.price === 0 && product.mrp ? product.mrp : product.price,
        currency: 'INR'
      });
    }
  }, [product?.id]);

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
    if (!product?.id) return;
    setIsSubmitting(true);

    let imageUrl = '';
    if (reviewImage) {
      try {
        const formData = new FormData();
        formData.append('image', reviewImage);
        
        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        if (!imgbbKey) throw new Error("ImgBB API key is missing");

        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formData
        });
        
        const data = await res.json();
        
        if (data.success) {
          imageUrl = data.data.url;
        } else {
          throw new Error(data.error?.message || "Unknown ImgBB Error");
        }
      } catch (err: any) {
        console.error("Error uploading review image", err);
        alert(`Could not upload image: ${err.message}. Please try again.`);
        setIsSubmitting(false);
        return; // Stop submission if image upload fails
      }
    }

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(reviewName)}&background=random&color=fff`;

    const newReview: Omit<Review, 'id' | 'date'> = {
      productId: product.id,
      userName: reviewName,
      userAvatar: avatar,
      ...(currentUser?.uid ? { userId: currentUser.uid } : {}),
      rating: reviewRating,
      text: reviewText,
      ...(imageUrl ? { image: imageUrl } : {})
    };

    try {
      const id = await addReview(newReview);
      
      const submittedReview: Review = {
        id,
        ...newReview,
        date: { toMillis: () => Date.now() } as any
      };

      setReviews([submittedReview, ...reviews]);
      setReviewName('');
      setReviewText('');
      setReviewRating(5);
      setReviewImage(null);
      setReviewImagePreview(null);
    } catch (err: any) {
      console.error("Failed to add review to Firestore", err);
      alert(`Could not submit review: ${err.message}. Please check your Firestore rules.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (window.confirm("Are you sure you want to delete your review?")) {
      try {
        await deleteReview(id);
        setReviews(reviews.filter(r => r.id !== id));
      } catch (err: any) {
        console.error("Failed to delete review", err);
        alert("Could not delete review: " + err.message);
      }
    }
  };

  const startEditReview = (rev: Review) => {
    setEditingReviewId(rev.id || null);
    setEditReviewText(rev.text);
    setEditReviewRating(rev.rating);
  };

  const handleUpdateReview = async (id: string) => {
    try {
      await updateReview(id, { text: editReviewText, rating: editReviewRating });
      setReviews(reviews.map(r => r.id === id ? { ...r, text: editReviewText, rating: editReviewRating } : r));
      setEditingReviewId(null);
    } catch (err: any) {
      console.error("Failed to update review", err);
      alert("Could not update review: " + err.message);
    }
  };

  if (!product) {
    return <div className={styles.loadingWrapper}>Product not found.</div>;
  }

  const combinedReviews = [...reviews];
  const reviewsWithImages = combinedReviews.filter(r => r.image);

  const openLightbox = (reviewId: string) => {
    const idx = reviewsWithImages.findIndex(r => r.id === reviewId);
    if (idx !== -1) setLightboxIndex(idx);
  };

  const nextLightboxImage = () => {
    if (lightboxIndex !== null && lightboxIndex < reviewsWithImages.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    }
  };

  const prevLightboxImage = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    }
  };

  const reviewAvg = combinedReviews.length > 0
    ? (combinedReviews.reduce((acc, r) => acc + r.rating, 0) / combinedReviews.length)
    : 5.0;
  const avgRating = product.rating
    ? Number(product.rating).toFixed(1)
    : reviewAvg.toFixed(1);

  const getAvailableStock = (size: string) => {
    if (!product) return 0;
    if (product.sizes && product.sizes.length > 0) {
      if (product.sizeUnits && product.sizeUnits[size] !== undefined) {
        return product.sizeUnits[size];
      }
      return 0;
    }
    return product.stock || 0;
  };

  const currentAvailableStock = getAvailableStock(selectedSize);

  // FOMO Logic overriding the stock display
  const { fomoStock, totalBought, isRestocking, formattedTime } = useFomoStock(product?.id, currentAvailableStock);
  const displayStock = fomoStock;

  const isOutOfStock = product.isSoldOut || currentAvailableStock <= 0 || isRestocking || displayStock <= 0;

  const cartItemInfo = cart.find(c => c.id === product?.id && c.size === selectedSize);
  const qtyInCart = cartItemInfo ? cartItemInfo.quantity : 0;
  const effectiveStock = Math.min(currentAvailableStock, displayStock);
  const maxAddable = Math.max(0, effectiveStock - qtyInCart);
  const isMaxInCart = maxAddable <= 0 && !isOutOfStock;
  const canPerformAction = !isOutOfStock && maxAddable > 0 && !isRestocking;

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
           {/* Desktop Gallery */}
           <div className={styles.desktopGallery}>
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

           {/* Mobile Swipeable Gallery */}
           <div className={styles.mobileGallery}>
             <MobileProductGallery 
               images={alternateImages as string[]}
               productName={product.name}
               onImageTap={(idx) => {
                 setMainImage(alternateImages[idx] as string);
                 setIsZoomed(true);
               }}
             />
           </div>
        </div>

        <div className={styles.productInfo}>
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Shop', href: '/shop' },
            { label: product.category || 'Category', href: `/shop?category=${encodeURIComponent(product.category || '')}` },
            { label: product.name }
          ]} />

          <div className={styles.titleHeader}>
            <div className={styles.productBadges} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.5px' }}>
              <span style={{ padding: '4px 8px', background: 'rgba(var(--foreground-rgb), 0.1)', borderRadius: '4px', color: 'var(--color-text)' }}>🔥 Popular Choice</span>
              <span style={{ padding: '4px 8px', background: 'var(--color-primary)', color: 'var(--color-background)', borderRadius: '4px' }}>⚡ Performance Gear</span>
              <span style={{ padding: '4px 8px', border: '1px solid var(--color-primary)', borderRadius: '4px', color: 'var(--color-primary)' }}>✓ Indian Climate Tested</span>
              {(product.name.toLowerCase().includes('greninja') || product.name.toLowerCase().includes('blue horizon')) && (
                <span style={{ padding: '4px 8px', background: 'linear-gradient(45deg, var(--color-primary), #333)', color: 'var(--color-background)', borderRadius: '4px' }}>🎁 Duo Pack Eligible</span>
              )}
            </div>
            
            <h1 className={styles.productTitle}>{product.name}</h1>
            {isRestocking ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                <span className={styles.stockBadge} style={{ background: '#ff3333', animation: 'pulse 2s infinite' }}>
                  Restocking in {formattedTime}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#ff3333', fontWeight: 600 }}>All stock sold out globally.</span>
              </div>
            ) : !isOutOfStock ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                 <div className={styles.stockBadge} style={{ background: displayStock < 100 ? '#ff3333' : 'var(--color-primary)', transition: 'background 0.3s ease' }}>
                   <motion.span 
                      key={displayStock}
                      initial={{ opacity: 0.5, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`${styles.fomoNumber} ${displayStock % 2 === 0 ? styles.flashing : ''}`}
                   >
                     {displayStock}
                   </motion.span>
                   {' '}In Stock ({selectedSize})
                 </div>
                 {displayStock < 800 && (
                    <span style={{ color: '#ff4444', fontSize: '0.8rem', fontWeight: 600, animation: 'pulse 2s infinite' }}>
                      🔥 Selling fast! Hurry, stock will remove soon!
                    </span>
                 )}
              </div>
            ) : (
              <span className={styles.stockBadge} style={{ background: '#ff3333' }}>Out of Stock</span>
            )}
          </div>

          <div className={styles.quickRating}>
            <div className={styles.starsRow}>
              {[1,2,3,4,5].map(star => (
                <Star key={star} size={16} className={styles.starIcon} fill={star <= Number(avgRating) ? "var(--color-primary)" : "none"} color={star <= Number(avgRating) ? "var(--color-primary)" : "rgba(var(--foreground-rgb), 0.2)"} />
              ))}
            </div>
            <span className={styles.reviewCount}>{avgRating} ({totalReviews} Review{totalReviews !== 1 && 's'})</span>
          </div>

          <div className={styles.pricing}>
            <span className={styles.offerPrice}>{renderPrice(product.price === 0 && product.mrp ? product.mrp : product.price)}</span>
            {product.mrp && product.price > 0 && product.mrp > product.price && (
              <del className={styles.mrpPrice}>{renderPrice(product.mrp)}</del>
            )}
          </div>

          {!isRestocking && displayStock > 0 && displayStock < 1000 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={styles.fomoBanner}
            >
              <div className={styles.pulseIcon}>⚡</div>
              <p>High Demand: <strong>{totalBought.toLocaleString()}</strong> bought this from all over india. Buy fast!</p>
            </motion.div>
          )}

          {isRestocking && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.fomoBanner}
              style={{ background: 'rgba(255, 51, 51, 0.1)', borderLeft: '4px solid #ff3333' }}
            >
              <div className={styles.pulseIcon}>⏳</div>
              <div>
                <p style={{ color: '#ff3333', fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>SOLD OUT GLOBALLY</p>
                <p style={{ fontSize: '0.85rem', margin: '4px 0 0 0' }}>Next drop releases in <strong style={{fontSize:'1rem'}}>{formattedTime}</strong>.</p>
              </div>
            </motion.div>
          )}

          {(() => {
            const desc = product.description || "Elite performance wear crafted for maximum aerodynamic efficiency.";
            const isLong = desc.length > 150;
            return (
              <div style={{ marginBottom: '1.5rem' }}>
                <p className={styles.shortDescription} style={{ marginBottom: isLong ? '4px' : 'inherit' }}>
                  {isLong && !isShortDescExpanded ? `${desc.substring(0, 150)}...` : desc}
                </p>
                {isLong && (
                  <button 
                    onClick={() => setIsShortDescExpanded(!isShortDescExpanded)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', padding: 0, fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {isShortDescExpanded ? 'Read Less' : 'Read More'}
                    <ChevronDown size={14} style={{ transform: isShortDescExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                )}
              </div>
            );
          })()}

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
                      title={disabled ? "Sold out" : "Select size"}
                    >
                      {size}
                    </button>
                    {product.sizes && product.sizes.length > 0 && disabled && (
                      <span style={{ fontSize: '0.65rem', opacity: 0.8, whiteSpace: 'nowrap', fontWeight: 500 }}>
                        Sold out
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.actionsBox}>
            {/* ROW 1: Quantity + Add to Bag */}
            <div className={styles.actionRowPrimary}>
              <QuantitySelector
                value={quantity > maxAddable && maxAddable > 0 ? maxAddable : quantity}
                min={1}
                max={maxAddable > 0 ? maxAddable : 1}
                onChange={setQuantity}
              />
              <div style={{ flex: 1, pointerEvents: !canPerformAction && currentUser ? 'none' : 'auto', opacity: !canPerformAction && currentUser ? 0.5 : 1 }}>
                <AnimatedCartButton
                  onAdd={() => {
                    if (!currentUser) {
                      sessionStorage.setItem('dualdeer_return_url', window.location.pathname);
                      router.push('/auth');
                      return;
                    }
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
                  label={!currentUser ? "Sign In to Buy" : isRestocking ? `RESTOCKING ${formattedTime}` : isOutOfStock ? "Sold Out" : isMaxInCart ? "Max in Cart" : "Add To Bag"}
                />
              </div>
            </div>

            {/* ROW 2: Buy Now */}
            <div className={styles.actionRowSecondary}>
              <button 
                className={styles.buyNowBtn}
                disabled={!canPerformAction && currentUser !== null}
                style={{ opacity: !canPerformAction && currentUser ? 0.5 : 1, cursor: (!canPerformAction && currentUser) ? 'not-allowed' : 'pointer' }}
                onClick={() => {
                  if (!currentUser) {
                    sessionStorage.setItem('dualdeer_return_url', window.location.pathname);
                    router.push('/auth');
                    return;
                  }
                  if(product && canPerformAction) {
                    router.push(`/checkout?product=${product.slug || ''}&id=${product.id}&size=${encodeURIComponent(selectedSize)}&qty=${Math.min(quantity, maxAddable)}`);
                  }
                }}
              >
                {!currentUser ? "Sign In to Checkout" : !canPerformAction ? (isRestocking ? `WAIT ${formattedTime}` : isOutOfStock ? 'Unavailable' : 'Limit Reached') : 'Buy Now'}
              </button>
            </div>

            {/* ROW 3: Wishlist & Share */}
            <div className={styles.actionIconGroup}>
              <button 
                className={styles.wishlistBtn}
                onClick={toggleWishlist}
                disabled={isWishlistLoading}
                title="Add to Wishlist"
                style={{ background: isInWishlist ? 'var(--color-primary)' : 'rgba(255,255,255,0.03)', color: isInWishlist ? 'var(--color-background)' : 'inherit' }}
              >
                <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
              </button>
              <button 
                className={styles.wishlistBtn}
                onClick={handleShare}
                title="Share this Elite Product"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'inherit' }}
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

      <BrandProductDetails product={product} />
      <RelatedGuides category={product.category} name={product.name} />

      <section className={styles.tabsSection}>
        <div className={styles.tabContent}>
          <div className={styles.reviewTab}>
                <div className={styles.reviewAggregate}>
                  <div className={styles.bigScore}>
                    <h2>{avgRating}</h2>
                    <span>out of 5</span>
                    <div className={styles.starsRow}>
                       {[1,2,3,4,5].map(star => (
                         <Star key={star} size={18} className={styles.starIcon} fill={star <= Number(avgRating) ? "var(--color-primary)" : "none"} color={star <= Number(avgRating) ? "var(--color-primary)" : "rgba(var(--foreground-rgb), 0.2)"} />
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
                    <>
                      {combinedReviews.slice(0, visibleReviewsCount).map(rev => (
                        <div key={rev.id} className={styles.reviewCard}>
                        <div className={styles.revHeader}>
                          <div className={styles.revUser}>
                            <img src={rev.userAvatar || `https://ui-avatars.com/api/?name=${rev.userName}&background=random`} alt={rev.userName} className={styles.avatar} loading="lazy" decoding="async" />
                            <div>
                              <h4 className={styles.revName}>{rev.userName}</h4>
                              <span className={styles.verified}><CheckCircle size={12} /> Verified</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span className={styles.revDate}>
                              {new Date((rev.date as unknown as number) || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </span>
                            {currentUser?.uid && currentUser.uid === rev.userId && (
                              <div className={styles.reviewActions}>
                                <button onClick={() => startEditReview(rev)} title="Edit Review"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteReview(rev.id!)} title="Delete Review" style={{ color: '#ff3333' }}><Trash2 size={14} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                        {editingReviewId === rev.id ? (
                          <div className={styles.editReviewForm} style={{ marginTop: '1rem' }}>
                            <select value={editReviewRating} onChange={e => setEditReviewRating(Number(e.target.value))} className={styles.inputField} style={{ marginBottom: '0.8rem', width: 'auto', padding: '0.4rem' }}>
                              <option value={5}>⭐⭐⭐⭐⭐ - 5 Stars</option>
                              <option value={4}>⭐⭐⭐⭐ - 4 Stars</option>
                              <option value={3}>⭐⭐⭐ - 3 Stars</option>
                              <option value={2}>⭐⭐ - 2 Stars</option>
                              <option value={1}>⭐ - 1 Star</option>
                            </select>
                            <textarea value={editReviewText} onChange={e => setEditReviewText(e.target.value)} className={styles.textArea} style={{ marginBottom: '0.8rem', minHeight: '80px' }} />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button onClick={() => handleUpdateReview(rev.id!)} className={styles.submitBtn} style={{ padding: '0.5rem 1rem', width: 'auto' }}>Save</button>
                              <button onClick={() => setEditingReviewId(null)} className={styles.uploadBtn} style={{ border: '1px solid var(--color-primary)' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className={styles.revText}>{rev.text}</p>
                            {rev.image && (
                              <img 
                                src={rev.image} 
                                alt="Review attachment" 
                                className={styles.reviewAttachedImage} 
                                loading="lazy" 
                                onClick={() => openLightbox(rev.id!)}
                                style={{ cursor: 'zoom-in' }}
                              />
                            )}
                            <div className={styles.starsRow} style={{ marginTop: '0.8rem' }}>
                              {[1,2,3,4,5].map(star => (
                                <Star key={star} size={14} fill={star <= rev.rating ? "var(--color-primary)" : "none"} color="var(--color-primary)" />
                              ))}
                              <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', fontWeight: 600 }}>{rev.rating}.0</span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                    </>
                  )}
                  {combinedReviews.length > visibleReviewsCount && (
                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                      <button 
                        onClick={() => setVisibleReviewsCount(prev => prev + 3)} 
                        className={styles.readMoreBtn}
                      >
                        Show More Reviews
                      </button>
                    </div>
                  )}
                </div>

                <div className={styles.submitReviewArea}>
                  {/* Magical Rays Decorative Background */}
                  <div className={styles.magicalRaysContainer}>
                    <div className={styles.magicRay1}></div>
                    <div className={styles.magicRay2}></div>
                    <div className={styles.magicRay3}></div>
                  </div>
                  
                  <div className={styles.reviewFormLogoWrapper}>
                    <img src="/logo.png" alt="DUALDEER" className={styles.reviewFormLogo} />
                  </div>
                  
                  <div className={styles.reviewFormHeader}>
                    <h3 className={styles.reviewTitle}>
                      <span className={styles.titleDark}>SHARE YOUR</span> <span className={styles.highlightText}>EXPERIENCE</span>
                    </h3>
                    <div className={styles.headerLine}></div>
                    <p className={styles.reviewSubtitle}>
                      Your feedback helps us grow and deliver performance-driven<br/>
                      gear you can trust. Be part of the <span className={styles.highlightText}>DUALDEER</span> community.
                    </p>
                  </div>
                  
                  <form onSubmit={handleReviewSubmit} className={styles.reviewForm}>
                    <div className={styles.formGrids}>
                      <div className={styles.inputWrapper}>
                        <User size={20} className={styles.inputIcon} />
                        <input 
                          type="text" 
                          placeholder="Your Name" 
                          required 
                          value={reviewName}
                          onChange={e => setReviewName(e.target.value)}
                          className={styles.inputFieldWithIcon} 
                        />
                      </div>
                      <div className={styles.ratingWrapper}>
                        <div className={styles.ratingLeft}>
                          <span className={styles.ratingLabel}>YOUR RATING</span>
                          <div className={styles.interactiveStars}>
                            {[1,2,3,4,5].map(star => (
                              <Star 
                                key={star} 
                                size={22} 
                                className={styles.ratingStarIcon}
                                fill={star <= reviewRating ? "var(--color-primary)" : "none"}
                                color="var(--color-primary)"
                                strokeWidth={1.5}
                                onClick={() => setReviewRating(star)}
                                style={{ cursor: 'pointer' }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className={styles.ratingDivider}></div>
                        <div className={styles.ratingRight}>
                           <span className={styles.selectRatingText}>Select Rating</span>
                           <ChevronDown size={16} className={styles.ratingChevron} />
                        </div>
                        <select 
                          required
                          value={reviewRating}
                          onChange={e => setReviewRating(Number(e.target.value))}
                          className={styles.hiddenSelect}
                        >
                          <option value={5}>5 Stars</option>
                          <option value={4}>4 Stars</option>
                          <option value={3}>3 Stars</option>
                          <option value={2}>2 Stars</option>
                          <option value={1}>1 Star</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className={styles.textareaWrapper}>
                      <Quote size={24} className={styles.quoteIcon} fill="var(--color-primary)" color="var(--color-primary)" />
                      <textarea 
                        placeholder="Write your review here..."
                        required
                        value={reviewText}
                        onChange={e => setReviewText(e.target.value)}
                        className={styles.textArea}
                        maxLength={1000}
                      />
                      <span className={styles.charCount}>{reviewText.length} / 1000</span>
                    </div>

                    <div className={styles.imageUploadWrapper}>
                      <label className={styles.uploadBtn}>
                        <div className={styles.uploadIconWrapper}>
                          <ImagePlus size={24} className={styles.uploadIcon} />
                        </div>
                        <div className={styles.uploadTextGroup}>
                          <span className={styles.uploadTitle}>ATTACH IMAGE <span className={styles.uploadOptional}>(OPTIONAL)</span></span>
                          <span className={styles.uploadSubtitle}>Add photos to support your review</span>
                        </div>
                        <input 
                          type="file" 
                          accept="image/*" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const file = e.target.files[0];
                              setReviewImage(file);
                              setReviewImagePreview(URL.createObjectURL(file));
                            }
                          }} 
                        />
                      </label>
                      {reviewImagePreview && (
                        <div className={styles.imagePreview}>
                          <img src={reviewImagePreview} alt="Preview" />
                          <button 
                            type="button" 
                            className={styles.removeImageBtn} 
                            onClick={() => {
                              setReviewImage(null);
                              setReviewImagePreview(null);
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.submitActionsRow}>
                      <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                        <ArrowRight size={20} className={styles.submitArrow} />
                        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                      </button>
                      <div className={styles.authTrust}>
                        <ShieldCheck size={28} className={styles.trustIcon} strokeWidth={1.5} />
                        <div className={styles.trustText}>
                          <span>Your review is 100% authentic</span>
                          <span>and helps our community.</span>
                        </div>
                      </div>
                    </div>

                    {currentUser?.email === 'aviroopghosh283@gmail.com' && (
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to delete ALL reviews?")) {
                            setIsSubmitting(true);
                            try {
                              for (const rev of reviews) {
                                if (rev.id) await deleteReview(rev.id);
                              }
                              setReviews([]);
                              alert("All reviews deleted.");
                            } catch (e: any) {
                              alert("Error deleting reviews: " + e.message);
                            } finally {
                              setIsSubmitting(false);
                            }
                          }
                        }}
                        style={{ background: 'red', color: 'white', marginTop: '1rem', width: '100%', padding: '1rem', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ADMIN: Delete All Reviews
                      </button>
                    )}
                  </form>
                  
                  <div className={styles.reviewBadgesRow}>
                    <div className={styles.badgeItem}>
                      <div className={styles.badgeIconWrapper}>
                        <Award size={20} className={styles.badgeIcon} />
                      </div>
                      <div className={styles.badgeTextGroup}>
                        <span className={styles.badgeTitle}>Real Reviews</span>
                        <span className={styles.badgeSub}>From Real Athletes</span>
                      </div>
                    </div>
                    <div className={styles.badgeDivider}></div>
                    <div className={styles.badgeItem}>
                      <div className={styles.badgeIconWrapper}>
                        <Gem size={20} className={styles.badgeIcon} />
                      </div>
                      <div className={styles.badgeTextGroup}>
                        <span className={styles.badgeTitle}>Premium Quality</span>
                        <span className={styles.badgeSub}>Crafted for Performance</span>
                      </div>
                    </div>
                    <div className={styles.badgeDivider}></div>
                    <div className={styles.badgeItem}>
                      <div className={styles.badgeIconWrapper}>
                        <Users size={20} className={styles.badgeIcon} />
                      </div>
                      <div className={styles.badgeTextGroup}>
                        <span className={styles.badgeTitle}>Better Together</span>
                        <span className={styles.badgeSub}>Stronger Community</span>
                      </div>
                    </div>
                    <div className={styles.badgeDivider}></div>
                    <div className={styles.badgeItem}>
                      <div className={styles.badgeIconWrapper}>
                        <Heart size={20} className={styles.badgeIcon} />
                      </div>
                      <div className={styles.badgeTextGroup}>
                        <span className={styles.badgeTitle}>Trusted by Athletes</span>
                        <span className={styles.badgeSub}>Loved Across India</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
        </div>
      </section>

      <RelatedProducts category={product.category} excludeId={product.id!} />

      {/* Lightbox Modal */}
      {lightboxIndex !== null && reviewsWithImages[lightboxIndex] && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxIndex(null)}>
          <button className={styles.lightboxClose} onClick={() => setLightboxIndex(null)}>
            <X size={24} color="#fff" />
          </button>
          
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxImageContainer}>
              <img 
                src={reviewsWithImages[lightboxIndex].image} 
                alt="Review Attachment Full" 
                className={styles.lightboxImage} 
              />
            </div>
            
            <div className={styles.lightboxReviewBox}>
              <div className={styles.lightboxReviewHeader}>
                <div className={styles.revUser}>
                  <img src={reviewsWithImages[lightboxIndex].userAvatar || `https://ui-avatars.com/api/?name=${reviewsWithImages[lightboxIndex].userName}&background=random`} alt={reviewsWithImages[lightboxIndex].userName} className={styles.avatar} style={{ width: '32px', height: '32px' }} />
                  <div>
                    <h4 className={styles.revName} style={{ color: '#fff', fontSize: '0.9rem' }}>{reviewsWithImages[lightboxIndex].userName}</h4>
                    <div className={styles.starsRow}>
                      {[1,2,3,4,5].map(star => (
                        <Star key={star} size={12} fill={star <= reviewsWithImages[lightboxIndex].rating ? "var(--color-primary)" : "none"} color="var(--color-primary)" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <p className={styles.lightboxReviewText} style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.9rem', marginTop: '0.8rem', lineHeight: 1.5 }}>
                "{reviewsWithImages[lightboxIndex].text}"
              </p>
            </div>

            {lightboxIndex > 0 && (
              <button className={styles.lightboxPrev} onClick={(e) => { e.stopPropagation(); prevLightboxImage(); }}>
                <ChevronLeft size={32} color="#fff" />
              </button>
            )}
            
            {lightboxIndex < reviewsWithImages.length - 1 && (
              <button className={styles.lightboxNext} onClick={(e) => { e.stopPropagation(); nextLightboxImage(); }}>
                <ChevronLeft size={32} color="#fff" style={{ transform: 'rotate(180deg)' }} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
