"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from "framer-motion";
import styles from "./PremiumProductDetails.module.css";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { X, Search, ChevronLeft, ShoppingBag } from "lucide-react";

interface PremiumProductDetailsProps {
  product: any;
  reviews?: any[];
}

const Accordion = ({ title, children, defaultOpen = false }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={styles.accordionItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question" onMouseEnter={() => document.documentElement.style.setProperty('--cursor-scale', '1.5')} onMouseLeave={() => document.documentElement.style.setProperty('--cursor-scale', '1')}>
      <button className={styles.accordionHeader} onClick={() => setIsOpen(!isOpen)} aria-expanded={isOpen}>
        <span itemProp="name">{title}</span>
        <span className={styles.accordionIcon}>{isOpen ? "—" : "＋"}</span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }}
            className={styles.accordionContent}
            itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer"
          >
            <div className={styles.accordionContentInner} itemProp="text">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function PremiumProductDetails({ product, reviews = [] }: PremiumProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const router = useRouter();
  const { cart, addToCart, cartCount, setIsCartOpen } = useCart();
  const { currency, formatPrice } = useCurrency();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Custom Cursor state
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHoveringAction, setIsHoveringAction] = useState(false);
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Zoom Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPan, setZoomPan] = useState({ x: 50, y: 50 });

  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setIsZoomed(false); // Reset zoom when closing
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen]);

  // Hide global navbar when on this premium page
  useEffect(() => {
    document.body.classList.add('premium-theme');
    
    return () => {
      document.body.classList.remove('premium-theme');
    };
  }, []);

  // Scroll references
  const containerRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: vaultProgress } = useScroll({
    target: vaultRef,
    offset: ["start start", "end end"]
  });

  // Smooth horizontal scroll for gallery
  const smoothVaultProgress = useSpring(vaultProgress, { damping: 20, stiffness: 100 });
  const galleryX = useTransform(smoothVaultProgress, [0, 1], ["0%", "-60%"]);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);
  
  const images = product.images?.length > 0 ? product.images : [product.image];

  useEffect(() => {
    if (isCarouselHovered || isLightboxOpen) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [isCarouselHovered, isLightboxOpen, images.length]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      
      if (isZoomed) {
        // Calculate percentage for panning
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;
        setZoomPan({ x: xPercent, y: yPercent });
      }
    };
    
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      unsubscribe();
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, []);

  const handleAddToCart = () => {
    if (!currentUser) {
      sessionStorage.setItem('dualdeer_return_url', `/product/${product.slug}`);
      router.push('/auth');
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      alert("A bespoke size must be selected.");
      return;
    }
    if (product.isSoldOut || product.stock === 0) {
      alert("This artifact is no longer available.");
      return;
    }
    
    // Trigger transition overlay
    setIsTransitioning(true);
    
    setTimeout(() => {
       router.push(`/checkout?product=${product.slug || ''}&id=${product.id}&size=${encodeURIComponent(selectedSize || 'OSFA')}&qty=1&premium=true`);
    }, 1200); // Wait for the transition to cover the screen
  };


  return (
    <article className={styles.premiumContainer} ref={containerRef} itemScope itemType="https://schema.org/Product">
      <meta itemProp="name" content={`DualDeer Elite Collection: ${product.name}`} />
      <meta itemProp="brand" content="DualDeer Elite" />
      <meta itemProp="sku" content={`DD-ELITE-${product.id?.substring(0,8)}`} />
      <meta itemProp="description" content={`Part of DualDeer's Elite Collection. Built with the world's best fabrics, widely recognized as the best gym wear and premium activewear in Kolkata.`} />


      
      {/* CUSTOM CURSOR OMITTED - USING GLOBAL CURSOR */}

      {/* ZOOM LIGHTBOX */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            className={styles.zoomOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setIsLightboxOpen(false)}
          >
            <button className={styles.closeLightboxBtn}>
              <X size={30} color="#fff" />
            </button>
            
            <motion.div 
              className={styles.zoomCursor}
              animate={{ x: mousePosition.x, y: mousePosition.y }}
              transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
            >
              {isZoomed ? <span style={{fontSize: '20px', fontWeight: 'bold'}}>-</span> : <span style={{fontSize: '20px', fontWeight: 'bold'}}>+</span>}
            </motion.div>
            
            <motion.img 
              src={images[carouselIndex]} 
              alt="Zoomed Product" 
              className={styles.zoomedImage}
              style={{
                transformOrigin: isZoomed ? `${zoomPan.x}% ${zoomPan.y}%` : 'center center',
                cursor: 'none'
              }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: isZoomed ? 2.5 : 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              onClick={(e) => {
                e.stopPropagation();
                setIsZoomed(!isZoomed);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. THE MONOLITH (HERO) */}
      <section className={styles.heroSection}>
        <motion.div 
          className={styles.heroImageWrap}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.7, 0, 0.3, 1] }}
        >
          <img src={product.image} alt={product.name} className={styles.heroImage} itemProp="image" />
          <div className={styles.heroOverlay}></div>
        </motion.div>

        <div className={styles.heroContent}>
          <motion.h1 
            className={styles.heroTitle}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: [0.7, 0, 0.3, 1] }}
          >
            {product.name}
          </motion.h1>
          <motion.div 
            className={styles.heroSubtitleWrap}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <span className={styles.privateLabel}>Private Allocation</span>
          </motion.div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollIndicatorInner}></div>
        </div>
      </section>

      {/* 2. THE VAULT (HORIZONTAL SCROLL GALLERY) */}
      <section className={styles.vaultSection} ref={vaultRef}>
        <div className={styles.vaultSticky}>
          <motion.div className={styles.vaultGallery} style={{ x: galleryX }}>
            {images.map((img: string, i: number) => (
              <div key={i} className={styles.vaultImageWrap}>
                <img src={img} alt={`Artifact perspective ${i+1}`} className={styles.vaultImage} />
                <span className={styles.vaultCaption}>Fig. 0{i + 1} — Architectural Details</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 3. THE ALLOCATION (COMMERCE & LORE) */}
      <section className={styles.allocationSection}>
        <div className={styles.allocationGrid}>
          
          <div className={styles.allocationVisual}>
            <div 
              className={styles.stickyVisual}
              onClick={() => setIsLightboxOpen(true)}
            >
              <AnimatePresence mode="popLayout">
                <motion.img 
                  key={carouselIndex}
                  src={images[carouselIndex]} 
                  alt={product.name} 
                  className={styles.allocationImage} 
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.8, ease: [0.7, 0, 0.3, 1] }}
                />
              </AnimatePresence>
            </div>
          </div>

          <div className={styles.allocationAction}>
            <div className={styles.allocationLore}>
              <h2 className={styles.loreTitle}>A study in absolute perfection.</h2>
              <div className={styles.loreText} itemProp="description">
                <p>{product.description}</p>
                <br/>
                <p>Conceived for the top 1%, this artifact transcends traditional commerce. Its creation involves proprietary hydrophobic lattice structures, ethically sourced raw elastane, and over 400 hours of microscopic tailoring per batch. It is a strictly limited allocation.</p>
              </div>
            </div>

            <div className={styles.priceBlock} itemProp="offers" itemScope itemType="https://schema.org/Offer">
              <span className={styles.priceLabel}>Required Investment</span>
              <span className={styles.price}>{formatPrice(product.price)}</span>
              <meta itemProp="priceCurrency" content="INR" />
              <meta itemProp="price" content={product.price.toString()} />
              <meta itemProp="availability" content={(product.isSoldOut || product.stock === 0) ? "https://schema.org/OutOfStock" : "https://schema.org/InStock"} />
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.sizeBlock}>
                <div className={styles.sizeLabel}>
                  <span>Dimensions</span>
                  <span className={styles.sizeGuide}>Bespoke Guide</span>
                </div>
                <div className={styles.sizeList}>
                  {product.sizes.map((size: string) => {
                    const outOfStock = product.sizeUnits && product.sizeUnits[size] === 0;
                    return (
                      <button 
                        key={size}
                        className={`${styles.sizeBtn} ${selectedSize === size ? styles.active : ''}`}
                        onClick={() => !outOfStock && setSelectedSize(size)}
                        style={{ opacity: outOfStock ? 0.2 : 1 }}
                        disabled={outOfStock}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.acquireBtnWrap}>
              <button 
                className={styles.acquireBtn}
                onClick={handleAddToCart}
                disabled={product.isSoldOut || product.stock === 0}
              >
                {(product.isSoldOut || product.stock === 0) ? 'Allocation Exhausted' : 'Request Allocation'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRIVATE CLIENT SERVICES (FAQ / SEO) */}
      <section className={styles.servicesSection} itemScope itemType="https://schema.org/FAQPage">
        <Accordion title="Provenance & Engineering" defaultOpen={true}>
          <p>Every piece in the Elite Collection is hand-inspected by our lead architect. The fabric relies on a kinetic memory matrix that actively adapts to your musculoskeletal movements, effectively eliminating drag and physical resistance.</p>
        </Accordion>
        
        <Accordion title="Preservation Protocol">
          <p>Do not subject this garment to traditional laundering. It requires eco-hydrocarbon dry cleaning exclusively. UV exposure during storage should be kept to an absolute zero to maintain the molecular integrity of the nano-fibers.</p>
        </Accordion>
        
        <Accordion title="White Glove Logistics">
          <p>Your acquisition will be transported via secured, priority air-freight directly to your estate. Enclosed in a magnetized obsidian vault, it includes a tamper-evident NFC authenticity seal. Our private client team is available 24/7 for bespoke support and returns.</p>
        </Accordion>

        <Accordion title="Why is DualDeer the best activewear in Kolkata?">
          <p>DualDeer's Elite Collection utilizes the world's best fabrics and proprietary moisture-wicking technology to deliver the best gym wear in Kolkata. Engineered for peak performance and extreme durability, it remains the ultimate choice for elite athletes and luxury athleisure enthusiasts.</p>
        </Accordion>
      </section>
    </article>
  );
}
