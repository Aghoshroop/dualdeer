"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import LiveTrafficBadge from '../ui/LiveTrafficBadge';
import { Product } from '@/lib/firebaseUtils';
import { useCart } from '@/context/CartContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  const { scrollY } = useScroll();
  const [mounted, setMounted] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [vh, setVh] = useState(1000);
  const [liveCategories, setLiveCategories] = useState<string[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();

  const [isMobile, setIsMobile] = useState(false);
  const [isMicro, setIsMicro] = useState(false);

  useEffect(() => {
    setMounted(true);
    setVh(window.innerHeight);
    const handleResize = () => {
      setVh(window.innerHeight);
      setIsMobile(window.innerWidth < 768);
      setIsMicro(window.innerWidth <= 300);
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Dynamically fetch active categories and products
    import('@/lib/firebaseUtils').then(({ getProducts, getCategories }) => {
      getProducts().then(prods => {
        setAllProducts(prods);
      }).catch(err => console.error(err));
      
      getCategories().then(cats => {
        const uniqueCats = cats.filter(c => c.status === 'active').map(c => c.name);
        setLiveCategories(uniqueCats);
      }).catch(err => console.error(err));
    });

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Dynamic Scroll Distances
  const dockStart = 0;
  const dockEnd = 50;

  // Cinematic Logo Mappings (Forked for viewport safety)
  const logoYDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [140, 140, 0]);
  const logoXDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [30, 30, 0]); // Pushed right to fix visual uncentering
  const logoScaleDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [7.5, 7.5, 1]); // Made bigger
  
  const logoYMobile = useTransform(scrollY, [0, dockStart, dockEnd], [60, 60, 0]);
  
  // Calibrated to safely center the left-anchored text without blowing past the viewport
  const logoXMobile = useTransform(scrollY, [0, dockStart, dockEnd], [35, 35, 0]); 
  const logoXMicro = useTransform(scrollY, [0, dockStart, dockEnd], [20, 20, 0]); 
  
  // Safe scaling for ultra-micro screens
  const logoScaleMobile = useTransform(scrollY, [0, dockStart, dockEnd], [isMicro ? 1.3 : 1.8, isMicro ? 1.3 : 1.8, 1]);
  
  const [isDocked, setIsDocked] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      if (latest > dockEnd) setIsDocked(true);
      else setIsDocked(false);
    });
  }, [scrollY, dockEnd]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayResults = searchQuery.trim() === '' 
    ? allProducts.slice(0, 4) // Show recommendations if empty
    : allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.category.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5);

  // This check is AFTER all hooks — safe per Rules of Hooks.
  // Early returns before hooks cause Turbopack's "static flag" panic.
  if (!mounted || pathname?.startsWith('/profile') || pathname?.startsWith('/product/') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <>
      <header className={`${styles.header} ${!isDocked && isHome ? styles.transparentHeader : ''}`} onMouseLeave={() => setHoveredMenu(null)}>
        {/* Promo Bar */}
        <div className={styles.promoBar}>
          <span>COMPLIMENTARY SHIPPING & RETURNS ON ALL ORDERS</span>
        </div>
        
        {/* Main Nav */}
        <div className={styles.mainNav}>
          <div className={styles.leftLinks}>
            <div 
              className={styles.navItem}
              onMouseEnter={() => setHoveredMenu('COLLECTION')}
            >
              <Link href="/shop" className={styles.link}>COLLECTION</Link>
            </div>
          </div>

          {/* Logo Placeholder to maintain flex space */}
          {isHome && mounted ? <div className={styles.logoPlaceholder}></div> : null}

          <motion.div 
            className={`${styles.brandContainer} ${isHome && mounted ? styles.animatedLogo : ''} ${isDocked || !isHome ? styles.docked : styles.floating}`}
            style={isHome && mounted ? { 
              y: isMobile ? logoYMobile : logoYDesktop, 
              x: isMicro ? logoXMicro : (isMobile ? logoXMobile : logoXDesktop),
              scale: isMobile ? logoScaleMobile : logoScaleDesktop,
              transformOrigin: isMobile ? 'left top' : 'center center'
            } : {}}
          >
            <Link href="/" className={styles.brand}>
              <span>DUAL</span>
              <span className={styles.brandAccent}>DEER</span>
            </Link>
          </motion.div>

          <div className={styles.rightIcons}>
            <div className={styles.searchContainer} ref={searchRef}>
              <AnimatePresence mode="wait">
                {!isSearchOpen ? (
                  <motion.button 
                    key="search-btn"
                    aria-label="Search" 
                    className={styles.iconBtn}
                    onClick={() => setIsSearchOpen(true)}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Search size={20} strokeWidth={1.5} />
                  </motion.button>
                ) : (
                  <div style={{ position: 'relative' }}>
                    <motion.div 
                      key="search-bar"
                      className={styles.searchBar}
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Search size={16} strokeWidth={1.5} className={styles.searchBarIcon} />
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        autoFocus 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button onClick={() => {setIsSearchOpen(false); setSearchQuery('');}} aria-label="Close search" className={styles.closeBtn}>
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </motion.div>

                    <AnimatePresence>
                      {isSearchOpen && (
                        <motion.div 
                          className={styles.searchDropdown}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <div className={styles.searchDropdownHeader}>
                            {searchQuery.trim() === '' ? 'RECOMMENDED' : 'RESULTS'}
                          </div>
                          {displayResults.length === 0 ? (
                            <div className={styles.noResults}>No products found for "{searchQuery}"</div>
                          ) : (
                            <div className={styles.searchResultsList}>
                              {displayResults.map(product => (
                                <Link 
                                  href={`/product/${product.id}`} 
                                  key={product.id} 
                                  className={styles.searchResultItem}
                                  onClick={() => {setIsSearchOpen(false); setSearchQuery('');}}
                                >
                                  <img src={product.image} alt={product.name} />
                                  <div className={styles.searchResultInfo}>
                                    <h4>{product.name}</h4>
                                    <span>₹{product.price.toFixed(2)}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </AnimatePresence>
            </div>
            <Link href="/auth">
              <button aria-label="Account" className={styles.iconBtn}><User size={20} strokeWidth={1.5} /></button>
            </Link>
            <Link href="/cart" style={{ position: 'relative' }}>
              <button aria-label="Cart" className={styles.iconBtn}><ShoppingBag size={20} strokeWidth={1.5} /></button>
              {mounted && cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Mega Menu Dropdown */}
        <AnimatePresence>
          {hoveredMenu && (
            <motion.div 
              className={styles.megaMenu}
              style={{ transformOrigin: 'top center' }}
              initial={{ opacity: 0, y: -40, scaleY: 0.5, scaleX: 1.05, filter: 'blur(15px)' }}
              animate={{ opacity: 1, y: 0, scaleY: 1, scaleX: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -20, scaleY: 0.8, scaleX: 1.02, filter: 'blur(10px)' }}
              transition={{ 
                type: "spring", 
                stiffness: 150, 
                damping: 10, 
                mass: 1.5
              }}
            >
              <div className={styles.megaMenuContainer}>
                <div className={styles.menuLinks}>
                  <div className={styles.menuCol}>
                    <h4>SHOP BY CATEGORY</h4>
                    <Link href="/shop" onClick={() => setHoveredMenu(null)}>All Collections</Link>
                    {liveCategories.map((cat, i) => (
                      <Link key={i} href="/shop" onClick={() => setHoveredMenu(null)} style={{ textTransform: 'capitalize' }}>
                        {cat}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className={styles.menuImage}>
                  <img 
                    src={hoveredMenu === 'MEN' 
                      ? "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop" 
                      : "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=800&auto=format&fit=crop"} 
                    alt={`${hoveredMenu} featured`} 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Storefront Traffic Badge */}
      <LiveTrafficBadge />
    </>
  );
}
