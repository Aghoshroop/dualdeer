"use client";
import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getProduct, Product, getReviews, Review, addReview, checkInWishlist, addToWishlist, removeFromWishlist } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import { Heart, Minus, Plus, ShoppingBag, CheckCircle, ChevronDown, User, Star, ChevronLeft, Lock, X } from 'lucide-react';
import RelatedProducts from '@/components/sections/RelatedProducts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './ProductDetails.module.css';
import QuantitySelector from '@/components/ui/QuantitySelector';
import AnimatedCartButton from '@/components/ui/AnimatedCartButton';

const MOCK_REVIEWS: Review[] = [
  { id: 'mock1', productId: 'all', userName: 'Rajesh K.', userAvatar: 'https://ui-avatars.com/api/?name=Rajesh+K&background=random', rating: 5, text: 'Absolutely unparalleled craftsmanship. The material feels incredible during high-intensity training.', date: { toMillis: () => Date.now() - 86400000 * 2 } as any },
  { id: 'mock2', productId: 'all', userName: 'Aisha S.', userAvatar: 'https://ui-avatars.com/api/?name=Aisha+S&background=random', rating: 5, text: 'The aerodynamic fit is completely true to size. Delivery was exceptionally fast.', date: { toMillis: () => Date.now() - 86400000 * 5 } as any },
  { id: 'mock3', productId: 'all', userName: 'Vikram Mehta', userAvatar: 'https://ui-avatars.com/api/?name=Vikram+M&background=random', rating: 4, text: 'Very premium feel. It holds up perfectly in all weather conditions.', date: { toMillis: () => Date.now() - 86400000 * 12 } as any },
  { id: 'mock4', productId: 'all', userName: 'Priya Desai', userAvatar: 'https://ui-avatars.com/api/?name=Priya+D&background=random', rating: 5, text: 'I own luxury brands across the globe, and DualDeer easily rivals them in quality and aesthetic.', date: { toMillis: () => Date.now() - 86400000 * 20 } as any },
  { id: 'mock5', productId: 'all', userName: 'Aditya R.', userAvatar: 'https://ui-avatars.com/api/?name=Aditya+R&background=random', rating: 5, text: 'Flawless stitching and compression. Worth every single penny.', date: { toMillis: () => Date.now() - 86400000 * 35 } as any },
  { id: 'mock6', productId: 'all', userName: 'Natasha B.', userAvatar: 'https://ui-avatars.com/api/?name=Natasha+B&background=random', rating: 4, text: 'Stunning design. The packaging alone was an experience.', date: { toMillis: () => Date.now() - 86400000 * 42 } as any },
];

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, cart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // UI State
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isZoomed, setIsZoomed] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  // Review Form State
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication & Wishlist State
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
      if (user && typeof id === 'string') {
        const wid = await checkInWishlist(user.uid, id);
        if (wid) {
          setIsInWishlist(true);
          setWishlistRecordId(wid);
        }
      }
    });

    if (typeof id !== 'string') return;
    Promise.all([getProduct(id), getReviews(id)]).then(([prodData, revData]) => {
      setProduct(prodData as Product);
      setReviews(revData);
      if (prodData) {
        setMainImage(prodData.image);
        if (prodData.sizes && prodData.sizes.length > 0) {
           setSelectedSize(prodData.sizes[0]);
        } else {
           setSelectedSize('OSFA');
        }
        if (prodData.colors && prodData.colors.length > 0) {
           setSelectedColor(prodData.colors[0]);
        }
      }
      setLoading(false);
    });

    const handleScroll = () => {
      setIsSticky(window.scrollY > 150);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribeAuth();
    };
  }, [id]);

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewText || typeof id !== 'string') return;
    setIsSubmitting(true);
    
    // Simulating user avatar based on first letter
    const avatar = `https://ui-avatars.com/api/?name=${reviewName}&background=random&color=fff`;

    await addReview({
      productId: id,
      userName: reviewName,
      userAvatar: avatar,
      rating: reviewRating,
      text: reviewText
    });

    // Refresh reviews
    const freshReviews = await getReviews(id);
    setReviews(freshReviews);
    
    setReviewName('');
    setReviewText('');
    setReviewRating(5);
    setIsSubmitting(false);
  };

  if (loading || authLoading) {
    return <div className={styles.loadingWrapper}>Decrypting Secure Payload...</div>;
  }


  if (!product) {
    return <div className={styles.loadingWrapper}>Product not found.</div>;
  }

  // Combine Real Reviews with Luxury Mock Reviews
  const combinedReviews = [...reviews, ...MOCK_REVIEWS];

  // Rating: use admin-set product.rating as the source of truth.
  // Fall back to live review average only if admin never set one.
  const reviewAvg = combinedReviews.length > 0
    ? (combinedReviews.reduce((acc, r) => acc + r.rating, 0) / combinedReviews.length)
    : 5;
  const avgRating = product.rating
    ? Number(product.rating).toFixed(1)
    : reviewAvg.toFixed(1);

  // Dynamic Stock Calculation
  const getAvailableStock = (size: string) => {
    if (!product) return 0;
    if (product.sizeUnits && product.sizeUnits[size] !== undefined) {
      return product.sizeUnits[size];
    }
    return product.stock;
  };

  const currentAvailableStock = getAvailableStock(selectedSize);
  const isOutOfStock = currentAvailableStock <= 0;

  // Real-time Cart Limit calculation
  const cartItemInfo = cart.find(c => c.id === product?.id && c.size === selectedSize);
  const qtyInCart = cartItemInfo ? cartItemInfo.quantity : 0;
  const maxAddable = Math.max(0, currentAvailableStock - qtyInCart);
  const isMaxInCart = maxAddable <= 0 && !isOutOfStock;
  const canPerformAction = !isOutOfStock && maxAddable > 0;

  // Calculate Star Distro dynamically so the graph perfectly reflects the rating
  const starCounts = [0, 0, 0, 0, 0]; // 1-star to 5-star
  const targetScore = Number(avgRating);
  
  // Fill the graph distribution logically based on the final rating
  if (targetScore >= 4.8) {
    starCounts[0] = 0; starCounts[1] = 1; starCounts[2] = 4; starCounts[3] = 15; starCounts[4] = 80; // 95% 5-star
  } else if (targetScore >= 4.3) {
    starCounts[0] = 1; starCounts[1] = 3; starCounts[2] = 6; starCounts[3] = 30; starCounts[4] = 60; // 60% 5-star, 30% 4-star
  } else if (targetScore >= 3.8) {
    starCounts[0] = 2; starCounts[1] = 5; starCounts[2] = 15; starCounts[3] = 50; starCounts[4] = 28; // Mostly 4-star
  } else if (targetScore >= 3.0) {
    starCounts[0] = 5; starCounts[1] = 15; starCounts[2] = 50; starCounts[3] = 20; starCounts[4] = 10; // Mostly 3-star
  } else {
    starCounts[0] = 50; starCounts[1] = 30; starCounts[2] = 10; starCounts[3] = 5; starCounts[4] = 5; // Low
  }
  
  // Add real reviews on top of the dynamic base
  combinedReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      starCounts[r.rating - 1]++;
    }
  });

  const totalReviews = starCounts.reduce((a, b) => a + b, 0);

  // Render Custom Gallery or Fallback Context
  const alternateImages = product.images && product.images.length > 0 
    ? product.images 
    : [product.image, product.image, product.image, product.image];

  // Advanced Product SEO Schema
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description || "Premium DualDeer activewear product.",
    "sku": `DUALDEER-${product.id?.slice(0, 8).toUpperCase()}`,
    "brand": {
      "@type": "Brand",
      "name": "DualDeer"
    },
    "category": product.category,
    "offers": {
      "@type": "Offer",
      "url": `https://dualdeer.com/product/${product.id}`,
      "priceCurrency": "INR",
      "price": product.price,
      "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "DualDeer"
      }
    },
    "aggregateRating": combinedReviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": totalReviews
    } : undefined,
    "review": combinedReviews.map(r => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": r.rating,
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": r.userName
      }
    }))
  };

  return (
    <div className={styles.pageContainer}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      
      <button 
        onClick={() => router.back()} 
        className={styles.backBtn}
        aria-label="Go back"
      >
        <ChevronLeft size={20} /> Back to Collection
      </button>

      {/* Product Zoom Lightbox */}
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
              alt={`${product.name} zoomed`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={styles.lightboxImg}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Section - Product Presentation */}
      <section className={styles.heroSection}>
        <div className={styles.imageGallery}>
           <div className={styles.mainImageContainer} onClick={() => setIsZoomed(true)} style={{ cursor: 'zoom-in' }}>
             <img src={mainImage} alt={product.name} className={styles.mainImage} />
           </div>
           <div className={styles.thumbnailList}>
             {alternateImages.map((img, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.thumbnail} ${mainImage === img && idx === 0 ? styles.activeThumb : ''}`}
                  onClick={() => setMainImage(img)}
                >
                  <img src={img} alt={`${product.name} view ${idx+1}`} />
                </div>
             ))}
           </div>
        </div>

        <div className={styles.productInfo}>
          <div className={styles.breadcrumbs}>
            <span>{product.category || 'High Performance'}</span>
          </div>

          <div className={styles.titleHeader}>
            <h1 className={styles.productTitle}>{product.name}</h1>
            {!isOutOfStock ? (
              <span className={styles.stockBadge}>{currentAvailableStock} In Stock ({selectedSize})</span>
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
            <span className={styles.offerPrice}>₹{product.price.toFixed(2)}</span>
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
                      quantity: Math.min(quantity, maxAddable) // ensuring safety
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
                  router.push(`/checkout?buyNow=${product.id}&size=${encodeURIComponent(selectedSize)}&qty=${Math.min(quantity, maxAddable)}`);
                }
              }}
            >
              {!canPerformAction ? (isOutOfStock ? 'Unavailable' : 'Limit Reached') : 'Buy Now'}
            </button>
            <button 
              className={styles.wishlistBtn}
              onClick={toggleWishlist}
              disabled={isWishlistLoading}
              style={{ background: isInWishlist ? 'var(--color-primary)' : 'transparent', color: isInWishlist ? 'var(--color-background)' : 'inherit', border: isInWishlist ? '1px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.1)' }}
            >
              <Heart size={20} fill={isInWishlist ? 'currentColor' : 'none'} />
            </button>
          </div>

          <div className={styles.metaData}>
            <p><strong>SKU:</strong> DUALDEER-{product.id?.slice(0, 8).toUpperCase()}</p>
            <p><strong>Tags:</strong> Elite, Performance, {product.category}</p>
          </div>
        </div>
      </section>

      {/* 300+ Words SEO Content Section */}
      <section className={styles.seoProductSection}>
        <div className={styles.seoProductContainer}>
          <div className={isDescExpanded ? styles.contentExpanded : styles.contentCollapsed}>
            <h2>Why Choose the {product.name}</h2>
            <p>
              Experience the absolute apex of modern athletic engineering with the exclusively designed <strong>{product.name}</strong>. At DualDeer, we critically recognize that true high-intensity performance strictly requires specialized apparel that actively and instinctively works alongside your body&apos;s natural biomechanical movements. As part of our signature <Link href="/shop?category=speedsuit" style={{ textDecoration: 'underline', color: 'inherit' }}>SpeedSuit lineup</Link>, this expertly crafted garment is meticulously built from the ground up to decisively deliver unprecedented aerodynamic efficiency, supreme long-lasting comfort, and an unmistakable, commanding luxury aesthetic that is incredibly rare to find in modern performance activewear. Whether you are relentlessly pushing your physical boundaries in the gym, logging exhaustive endurance miles on the track, or simply navigating a demanding and dynamic urban lifestyle, the {product.name} seamlessly acts as your ultimate, supportive armor.
            </p>

            <h3>Revolutionary Fabric Technology</h3>
            <p>
              The fundamental core of this exceptional piece, consistent with our entire signature SpeedSuit collection, lies directly within our proprietary, state-of-the-art fabric blend. This incredibly advanced textile actively incorporates intelligent four-way kinetic stretch capabilities, allowing for an entire, unrestricted range of rapid multi-directional movement without ever spontaneously losing essential structural integrity. Furthermore, the specialized synthetic hydrophobic micro-fibers are precision-engineered to rapidly and continuously wick away heavy sweat and moisture. This advanced moisture-management system ensures you remain remarkably cool, entirely dry, and intensely focused even during the most grueling, high-temperature athletic training conditions.
            </p>

            <h3>Elite Performance Benefits</h3>
            <p>Every single technical detail of the {product.name} is rigorously and thoroughly tested to forcefully elevate your physical potential and output to the next level:</p>
            <ul>
              <li><strong>Advanced Muscle Stabilization:</strong> Strategically integrated, targeted compression zones effectively reduce muscular vibration, enhance critical blood flow, and significantly accelerate your vital post-workout recovery times.</li>
              <li><strong>Chafe-Free Construction:</strong> The precision flatlock seams alongside intelligent, body-mapped ergonomic paneling practically eliminate uncomfortable chafing, allowing for seamless, prolonged physical exertion without subsequent irritation.</li>
              <li><strong>Dynamic Climate Control:</strong> State-of-the-art responsive weaving naturally and efficiently regulates your core body temperature, keeping you consistently warm in the harsh, biting cold and incredibly cool under intense, radiating heat.</li>
              <li><strong>Unmatched Durability:</strong> Substantially reinforced, heavy-duty stitching specifically guarantees that the piece effortlessly and repeatedly withstands the rigorous, daily demands of relentless elite athletic training without rapidly degrading.</li>
            </ul>

            <h3>Versatile Luxury Use Cases</h3>
            <p>
              While undeniably and explicitly engineered for the highest echelons of professional physical performance, the inherently sleek, minimalist visual aesthetic of this piece effortlessly transitions straight into your elevated daily lifestyle routine. The {product.name} is purposefully built for:
            </p>
            <ul>
              <li><strong>High-Intensity Gym Training:</strong> Experience the profound, supportive confidence required to safely conquer heavy compound lifts, grueling CrossFit regimens, and aggressive high-intensity interval circuits.</li>
              <li><strong>Endurance Running and Track:</strong> Benefit immensely from the ultra-lightweight, highly breathable aerodynamic profile that decisively shaves invaluable seconds off your personal best times while effortlessly managing wind resistance.</li>
              <li><strong>Sophisticated Lifestyle Wear:</strong> Seamlessly pair this distinctively elegant luxury piece with your existing contemporary wardrobe for a sharp, refined, and distinctly powerful athleisure look outside the studio or directly on the sophisticated city streets.</li>
            </ul>
            <p>
              Invest today in the remarkable {product.name} and firmly secure your rightful place among the dedicated athletic elite who simply refuse to ever settle for anything less than absolute sportswear perfection. <Link href="/speedsuit" style={{ textDecoration: 'underline', color: 'inherit' }}>Explore related luxury pieces within our signature SpeedSuit lineup</Link> to systematically and intelligently build the ultimate, highly versatile performance wardrobe.
            </p>
          </div>
          <button 
            className={styles.readMoreBtn} 
            onClick={() => setIsDescExpanded(!isDescExpanded)}
            aria-expanded={isDescExpanded}
          >
            {isDescExpanded ? 'Show Less' : 'Read More'}
            <ChevronDown size={16} style={{ 
              transform: isDescExpanded ? 'rotate(180deg)' : 'none', 
              transition: 'transform 0.3s ease' 
            }} />
          </button>
        </div>
      </section>

      {/* Reviews Section strictly bound below */}
      <section className={styles.tabsSection}>
        <div className={styles.tabContent}>
          <div className={styles.reviewTab}>
                
                {/* Aggregate Review Stats */}
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

                {/* Reviews List */}
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
                            <img src={rev.userAvatar || `https://ui-avatars.com/api/?name=${rev.userName}&background=random`} alt={rev.userName} className={styles.avatar} />
                            <div>
                              <h4 className={styles.revName}>{rev.userName}</h4>
                              <span className={styles.verified}><CheckCircle size={12} /> Verified</span>
                            </div>
                          </div>
                          <span className={styles.revDate}>
                            {new Date(rev.date.toMillis()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
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

                {/* Provide a Review Form */}
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

      {/* Dynamic Related Products */}
      <RelatedProducts category={product.category} excludeId={product.id} />
    </div>
  );
}
