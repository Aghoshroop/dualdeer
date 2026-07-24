"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Product, getReviews, Review, addReview, checkInWishlist, addToWishlist, removeFromWishlist, updateReview, deleteReview, addProductNotification, checkIfAlreadyNotified } from '@/lib/firebaseUtils';
import { useAuthToast } from '@/context/AuthToastContext';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import { Heart, CheckCircle, ChevronDown, Star, ChevronLeft, X, Share2, ImagePlus, Edit2, Trash2, User, ArrowRight, ShieldCheck, Award, Gem, Users, Quote, Bell, Play } from 'lucide-react';
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

const getColorHex = (colorName: string) => {
  if (!colorName) return '#a855f7';
  const c = colorName.toLowerCase();
  if (c.includes('red')) return '#ef4444';
  if (c.includes('blue')) return '#3b82f6';
  if (c.includes('green')) return '#10b981';
  if (c.includes('purple')) return '#a855f7';
  if (c.includes('black')) return '#333333';
  if (c.includes('white')) return '#f9fafb';
  if (c.includes('grey') || c.includes('gray')) return '#6b7280';
  if (c.includes('pink')) return '#ec4899';
  if (c.includes('yellow')) return '#eab308';
  if (c.includes('orange')) return '#f97316';
  return '#a855f7';
};

interface ProductClientProps {
  initialProduct: Product;
  initialReviews: Review[];
}

export default function ProductClient({ initialProduct, initialReviews }: ProductClientProps) {
  const [reviewCount, setReviewCount] = useState(0);

  const { addToCart, cart } = useCart();
  const { formatPrice, renderPrice } = useCurrency();
  const { showAuthToast } = useAuthToast();
  const router = useRouter();
  const [product, setProduct] = useState<Product>(initialProduct);
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const [mainImage, setMainImage] = useState<string>(initialProduct?.image || '');
  const [quantity, setQuantity] = useState(1);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(initialProduct?.sizes?.[0] || 'OSFA');
  const [selectedColor, setSelectedColor] = useState<string>(initialProduct?.colors?.[0] || '');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  
  const [activeAccordion, setActiveAccordion] = useState<string | null>('details');
  const [showToast, setShowToast] = useState(false);
  const [toastData, setToastData] = useState<{name: string, location: string} | null>(null);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      const locations = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad"];
      const loc = locations[Math.floor(Math.random() * locations.length)];
      setToastData({ name: "Someone", location: loc });
      setShowToast(true);
      
      setTimeout(() => setShowToast(false), 4000);
    }, 5000);
    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 600) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');
  const [isNotifying, setIsNotifying] = useState(false);
  const [notifySuccess, setNotifySuccess] = useState(false);

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
    if (!currentUser) {
      showAuthToast("Please log in to manage your wishlist.");
      return;
    }
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
    if (!currentUser) {
      showAuthToast("Please log in to submit a review.");
      return;
    }
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

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product?.id) return;
    setIsNotifying(true);
    try {
      const emailToUse = currentUser?.email || notifyEmail;
      if (!emailToUse) {
        alert("Please provide an email address.");
        setIsNotifying(false);
        return;
      }

      const alreadyNotified = await checkIfAlreadyNotified(product.id, emailToUse);
      if (alreadyNotified) {
        setNotifySuccess(true);
        setShowNotifyForm(false);
        showAuthToast("You're already on the waitlist for this product!");
        setIsNotifying(false);
        return;
      }

      const userId = currentUser?.uid || 'guest';
      await addProductNotification(product.id, userId, emailToUse);
      setNotifySuccess(true);
      setShowNotifyForm(false);
      showAuthToast("You will be notified when this is back in stock!");
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit request.");
    }
    setIsNotifying(false);
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

  const activeHex = getColorHex(selectedColor);

  return (
    <>
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
             <div className={styles.thumbnailList}>
               {alternateImages.slice(0, showAllImages ? alternateImages.length : 5).map((img, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.thumbnail} ${mainImage === img ? styles.activeThumb : ''}`}
                    onClick={() => setMainImage(img as string)}
                  >
                    <img src={img as string} alt={`${product.name} angle ${idx+1} - premium activewear`} loading="lazy" decoding="async" />
                  </div>
               ))}
               {product.videoUrl && (
                  <div 
                    className={`${styles.thumbnail} ${mainImage === product.videoUrl ? styles.activeThumb : ''}`}
                    onClick={() => setMainImage(product.videoUrl as string)}
                    style={{ position: 'relative', overflow: 'hidden' }}
                  >
                    <video src={product.videoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                      <Play size={20} color="white" fill="white" />
                    </div>
                  </div>
               )}
               {alternateImages.length > 5 && !showAllImages && (
                 <button className={styles.moreThumbBtn} onClick={() => setShowAllImages(true)}>
                   <ChevronDown size={20} /><br/>MORE
                 </button>
               )}
             </div>

             <div className={styles.mainImageContainer} onClick={() => { if(mainImage !== product.videoUrl) setIsZoomed(true); }} style={{ cursor: mainImage === product.videoUrl ? 'default' : 'zoom-in' }}>
               {mainImage === product.videoUrl ? (
                 <video src={product.videoUrl} autoPlay loop muted playsInline className={styles.mainImage} style={{ objectFit: 'cover' }} />
               ) : (
                 <img src={mainImage} alt={`${product.name} - top rated gym wear in India`} className={styles.mainImage} />
               )}
               
               {/* Feature Strip Overlay */}
               <div className={styles.featureStrip}>
                 <div className={styles.featureItem}>
                   <div className={styles.featureIcon}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16M12 4v16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4M12 4L8 8M12 4l4 4M12 20l-4-4M12 20l4-4"/></svg>
                   </div>
                   <div className={styles.featureText}>
                     <strong>4-WAY STRETCH</strong>
                     <span>Maximum mobility</span>
                   </div>
                 </div>
                 <div className={styles.featureItem}>
                   <div className={styles.featureIcon}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 16v-4m0-4h.01" strokeWidth="2" strokeLinecap="round"/></svg>
                   </div>
                   <div className={styles.featureText}>
                     <strong>SWEAT WICKING</strong>
                     <span>Stay dry always</span>
                   </div>
                 </div>
                 <div className={styles.featureItem}>
                   <div className={styles.featureIcon}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12"/><path d="M8 3L4 7l4 4M4 7h12M16 21l4-4-4-4M20 17H8"/></svg>
                   </div>
                   <div className={styles.featureText}>
                     <strong>BREATHABLE FABRIC</strong>
                     <span>All day comfort</span>
                   </div>
                 </div>
                 <div className={styles.featureItem}>
                   <div className={styles.featureIcon}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
                   </div>
                   <div className={styles.featureText}>
                     <strong>COMPRESSION FIT</strong>
                     <span>Support & shape</span>
                   </div>
                 </div>
                 <div className={styles.featureItem}>
                   <div className={styles.featureIcon}>
                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9M12 12l8-8"/></svg>
                   </div>
                   <div className={styles.featureText}>
                     <strong>LIGHTWEIGHT</strong>
                     <span>Feather feel</span>
                   </div>
                 </div>
               </div>
             </div>
           </div>

           {/* Mobile Swipeable Gallery */}
           <div className={styles.mobileGallery}>
             <MobileProductGallery 
               images={product.videoUrl ? [...alternateImages, product.videoUrl] as string[] : alternateImages as string[]}
               productName={product.name}
               onImageTap={(idx) => {
                 const target = product.videoUrl ? [...alternateImages, product.videoUrl][idx] : alternateImages[idx];
                 setMainImage(target as string);
                 if (target !== product.videoUrl) {
                   setIsZoomed(true);
                 }
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
            <div className={styles.productBadges}>
              <span className={styles.badgeOutline}>🔥 POPULAR CHOICE</span>
              <span className={styles.badgeOutline}>⚡ PERFORMANCE GEAR</span>
              <span className={styles.badgeOutline}>✓ INDIAN CLIMATE TESTED</span>
              {(product.name.toLowerCase().includes('greninja') || product.name.toLowerCase().includes('blue horizon')) && (
                <span className={styles.badgeFilled}>🎁 DUO PACK ELIGIBLE</span>
              )}
            </div>
            
            <div className={styles.titleRow}>
              <h1 className={styles.productTitle}>{product.name}</h1>
              {isRestocking ? (
                <span className={styles.stockBadge} style={{ background: '#ff3333', animation: 'pulse 2s infinite' }}>
                  Restocking in {formattedTime}
                </span>
              ) : !isOutOfStock ? (
                <span className={styles.stockBadge}>
                   {displayStock} IN STOCK ({selectedSize})
                </span>
              ) : (
                <span className={styles.stockBadge} style={{ background: '#ff3333' }}>Out of Stock</span>
              )}
            </div>
            <p className={styles.subtitle}>
              {product.category === 'Men' ? "Men's" : product.category === 'Women' ? "Women's" : product.category} Performance Compression Tee
            </p>
          </div>

          <div className={styles.accordionsWrapper} style={{ marginTop: '-0.5rem', marginBottom: '1rem', borderTop: 'none' }}>
            {[
              { id: 'details', title: 'Product Details & Specs', content: product.description || "Elite performance wear crafted for maximum aerodynamic efficiency." },
            ].map(acc => (
              <div key={acc.id} className={styles.accordionItem}>
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                >
                  {acc.title}
                  <ChevronDown size={18} style={{ transform: activeAccordion === acc.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                <AnimatePresence>
                  {activeAccordion === acc.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.accordionContent}
                    >
                      <div className={styles.accordionText}>{acc.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
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


          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorSelector}>
              <h4>COLOR: <span style={{ fontWeight: 'normal', color: '#ccc' }}>{selectedColor}</span></h4>
              <div className={styles.colorOptions}>
                {product.colors.map(color => (
                  <div key={color} className={`${styles.colorBtnWrapper} ${selectedColor === color ? styles.activeColorWrapper : ''}`}>
                    <button
                      className={styles.colorBtn}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      title={color}
                      aria-label={`Select color ${color}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={styles.sizeSelector}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
              <h4>SIZE:</h4>
              <button className={styles.sizeGuideBtn}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12H3m0 0l4-4m-4 4l4 4"/></svg> Size Guide</button>
            </div>
            <div className={styles.sizeOptions}>
              {(product.sizes && product.sizes.length > 0 ? product.sizes : ['OSFA']).map(size => {
                const stockLeft = getAvailableStock(size);
                const disabled = product.sizes && product.sizes.length > 0 ? stockLeft <= 0 : false;
                return (
                  <button 
                    key={size}
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
                );
              })}
            </div>
          </div>

          <div className={styles.actionsBox}>
            {isOutOfStock ? (
              <div className={styles.notifySection} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {notifySuccess ? (
                  <div style={{ textAlign: 'center', color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle size={32} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>You're on the list!</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>We'll email you the moment {product.name} is restocked.</p>
                  </div>
                ) : showNotifyForm ? (
                  <form onSubmit={handleNotifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Get Restock Alerts</h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Don't miss out next time. Enter your email below.</p>
                    <input 
                      type="email" 
                      required 
                      placeholder="Enter your email address" 
                      value={notifyEmail}
                      onChange={e => setNotifyEmail(e.target.value)}
                      style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', color: '#fff', fontSize: '1rem' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        type="submit" 
                        disabled={isNotifying}
                        className={styles.buyNowBtn} 
                        style={{ flex: 1, padding: '12px' }}
                      >
                        {isNotifying ? 'Submitting...' : 'Notify Me'}
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setShowNotifyForm(false)}
                        style={{ padding: '12px 20px', borderRadius: '12px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#ff4444' }}>Currently Unavailable</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>This product is sold out globally.</p>
                    <button 
                      onClick={(e) => {
                        if (currentUser?.email) {
                          handleNotifySubmit(e as any);
                        } else {
                          setShowNotifyForm(true);
                        }
                      }}
                      disabled={isNotifying}
                      className={styles.buyNowBtn}
                      style={{ background: 'var(--color-primary)', color: 'var(--color-background)', border: 'none' }}
                    >
                      <Bell size={18} style={{ marginRight: '8px', display: 'inline' }} /> {isNotifying ? 'Registering...' : 'Notify Me When Available'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ROW 1: Quantity + Add to Bag */}
                <div className={styles.actionRowPrimary}>
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
                      label={!currentUser ? "Sign In to Buy" : isRestocking ? `RESTOCKING ${formattedTime}` : isMaxInCart ? "Max in Cart" : `ADD TO BAG | ${formatPrice(product.price)}`}
                      className={styles.primaryAddBtn}
                    />
                  </div>
                </div>

                {/* ROW 2: Buy Now */}
                <div className={styles.actionRowSecondary}>
                  <button 
                    className={styles.buyNowBtnDark}
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
                    ⚡ {!currentUser ? "Sign In to Checkout" : !canPerformAction ? (isRestocking ? `WAIT ${formattedTime}` : 'Limit Reached') : 'BUY IT NOW'}
                  </button>
                </div>

                {/* Trust Badges */}
                <div className={styles.trustBadges}>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg></div>
                    <div className={styles.trustText}>
                      <strong>FREE SHIPPING</strong>
                      <span>On all orders</span>
                    </div>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg></div>
                    <div className={styles.trustText}>
                      <strong>7 DAY RETURNS</strong>
                      <span>Easy returns</span>
                    </div>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg></div>
                    <div className={styles.trustText}>
                      <strong>SECURE PAYMENT</strong>
                      <span>100% protected</span>
                    </div>
                  </div>
                  <div className={styles.trustItem}>
                    <div className={styles.trustIcon}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>
                    <div className={styles.trustText}>
                      <strong>ATHLETE APPROVED</strong>
                      <span>Trusted by pros</span>
                    </div>
                  </div>
                </div>
              </>
            )}

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

          <div className={styles.accordionsWrapper}>
            {[
              { id: 'materials', title: 'Materials & Care', content: "Made from 88% Premium Polyester and 12% Spandex. Machine wash cold, tumble dry low. Do not bleach or iron." },
              { id: 'shipping', title: 'Shipping & Returns', content: "Free shipping across India on all orders. 7-day hassle-free returns with doorstep pickup." }
            ].map(acc => (
              <div key={acc.id} className={styles.accordionItem}>
                <button 
                  className={styles.accordionHeader} 
                  onClick={() => setActiveAccordion(activeAccordion === acc.id ? null : acc.id)}
                >
                  {acc.title}
                  <ChevronDown size={18} style={{ transform: activeAccordion === acc.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>
                <AnimatePresence>
                  {activeAccordion === acc.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.accordionContent}
                    >
                      <div className={styles.accordionText}>{acc.content}</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
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

      <AnimatePresence>
        {isSticky && !isOutOfStock && canPerformAction && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={styles.stickyCartBar}
          >
            <div className={styles.stickyCartContent}>
              <div className={styles.stickyCartInfo}>
                <img src={product.image} alt="Thumbnail" />
                <div>
                  <h4>{product.name}</h4>
                  <span>{renderPrice(product.price)}</span>
                </div>
              </div>
              <button 
                className={styles.stickyAddBtn}
                onClick={() => {
                  addToCart({
                    id: product.id as string,
                    name: product.name,
                    price: product.price,
                    mrp: product.mrp,
                    image: product.image,
                    size: selectedSize,
                    color: selectedColor || undefined,
                    quantity: 1
                  });
                }}
              >
                ADD TO BAG
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showToast && toastData && (
          <motion.div 
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.socialProofToast}
          >
            <CheckCircle size={16} color="#10b981" />
            <span><strong>{toastData.name}</strong> in {toastData.location} just bought this!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
