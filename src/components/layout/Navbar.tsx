"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, X, Sun, Moon, Menu, Bell } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import LiveTrafficBadge from '../ui/LiveTrafficBadge';
import { Product, AppNotification, getActiveNotifications } from '@/lib/firebaseUtils';
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
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const { theme, setTheme } = useTheme();

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
      
      getActiveNotifications().then(notifs => {
        setNotifications(notifs);
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
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Secure Background Scroll Lockout
  useEffect(() => {
    if (isSearchOpen || isNotifOpen || isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Lock mobile gestures
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isSearchOpen, isNotifOpen, isDrawerOpen]);

  const normalizeText = (text?: string) => text ? text.toLowerCase().replace(/[^a-z0-9]/g, '') : '';
  const normalizedQuery = normalizeText(searchQuery);

  const displayResults = searchQuery.trim() === '' 
    ? allProducts.slice(0, 6) 
    : allProducts.filter(p => {
        const nName = normalizeText(p.name);
        const nCat = normalizeText(p.category);
        const nSub = normalizeText(p.subcategory);
        return nName.includes(normalizedQuery) || nCat.includes(normalizedQuery) || nSub.includes(normalizedQuery);
      }).slice(0, 6);

  // This check is AFTER all hooks — safe per Rules of Hooks.
  // Early returns before hooks cause Turbopack's "static flag" panic.
  if (!mounted) {
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
            <div className={styles.navItem}>
              <Link href="/project-x" className={styles.link} style={{ color: 'var(--red-500)', textShadow: '0 0 10px rgba(239,68,68,0.5)', fontWeight: 600 }}>MYSTERY</Link>
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
              <button 
                aria-label="Search" 
                className={styles.iconBtn}
                onClick={() => setIsSearchOpen(true)}
              >
                <Search size={20} strokeWidth={1.5} />
              </button>

              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div 
                    className={styles.searchOverlay}
                    initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button 
                      onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} 
                      className={styles.closeOverlayBtn}
                      aria-label="Close search"
                    >
                      <X size={36} strokeWidth={1} />
                    </button>

                    <div className={styles.searchOverlayContent}>
                      <motion.div 
                        className={styles.hugeSearchBox}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                      >
                        <Search size={40} strokeWidth={1.5} className={styles.hugeSearchIcon} />
                        <input 
                          type="text" 
                          placeholder="What are you looking for?" 
                          autoFocus 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </motion.div>

                      <motion.div 
                        className={styles.overlayResultsContainer}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      >
                        <div className={styles.overlaySectionTitle}>
                          {searchQuery.trim() === '' ? 'Recommended For You' : 'Instant Results'}
                        </div>
                        
                        {displayResults.length === 0 ? (
                          <div className={styles.overlayNoResults}>
                            No products found for "{searchQuery}"
                            <span className={styles.overlayDidYouMean}>Try searching for "speedsuit", "jacket", or "performance"</span>
                          </div>
                        ) : searchQuery.trim() === '' ? (
                          <div className={styles.marqueeWrapper}>
                            <div className={styles.marqueeTrack}>
                              {[...displayResults, ...displayResults].map((product, idx) => (
                                <Link 
                                  href={`/product/${product.id}`} 
                                  key={`${product.id}-${idx}`} 
                                  className={styles.marqueeResultCard}
                                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                >
                                  <div className={styles.marqueeResultImage}>
                                    <img src={product.image} alt={product.name} />
                                  </div>
                                  <div className={styles.marqueeResultInfo}>
                                    <h4>{product.name}</h4>
                                    <span>₹{product.price.toFixed(2)}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.overlayResultsGrid}>
                            {displayResults.map(product => (
                              <Link 
                                href={`/product/${product.id}`} 
                                key={product.id} 
                                className={styles.overlayResultCard}
                                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                              >
                                <div className={styles.overlayResultImage}>
                                  <img src={product.image} alt={product.name} />
                                </div>
                                <div className={styles.overlayResultInfo}>
                                  <h4>{product.name}</h4>
                                  <span>₹{product.price.toFixed(2)}</span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              aria-label="Toggle Theme" 
              className={styles.iconBtn}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {mounted && theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>

            <Link href="/auth" className={styles.desktopOnly}>
              <button aria-label="Account" className={styles.iconBtn}><User size={20} strokeWidth={1.5} /></button>
            </Link>
            
            <div className={styles.notificationContainer} ref={notifRef}>
              <button 
                aria-label="Notifications" 
                className={styles.iconBtn} 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ position: 'relative' }}
              >
                <Bell size={20} strokeWidth={1.5} />
                {mounted && notifications.length > 0 && (
                  <span className={styles.cartBadge} style={{ background: 'var(--red-500)' }}>{notifications.length}</span>
                )}
              </button>
              
              <AnimatePresence>
                {isNotifOpen && (
                  <motion.div 
                    className={styles.searchOverlay}
                    initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.05 }}
                    animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                    exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <button 
                      onClick={() => setIsNotifOpen(false)} 
                      className={styles.closeOverlayBtn}
                      aria-label="Close notifications"
                    >
                      <X size={36} strokeWidth={1} />
                    </button>

                    <div className={styles.searchOverlayContent}>
                      <motion.div 
                        className={styles.hugeSearchBox}
                        style={{ borderBottom: 'none', paddingBottom: 0 }}
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1, duration: 0.5, ease: "easeOut" }}
                      >
                        <Bell size={40} strokeWidth={1.5} className={styles.hugeSearchIcon} />
                        <h2 className={styles.notificationOverlayTitle}>NOTIFICATIONS</h2>
                      </motion.div>

                      <motion.div 
                        className={styles.overlayResultsContainer}
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
                      >
                        {notifications.length === 0 ? (
                          <div className={styles.overlayNoResults}>
                            You're all caught up!
                            <span className={styles.overlayDidYouMean}>No active system alerts or athlete notifications at this time</span>
                          </div>
                        ) : (
                          <div className={styles.notificationGridList}>
                            {notifications.map((notif) => {
                              const NotificationContent = () => (
                                <>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span className={styles.notificationOverlayItemTitle}>{notif.title}</span>
                                    {notif.createdAt && Date.now() - notif.createdAt.toMillis() < 86400000 && <span className={styles.newBadgeOverlay}>NEW</span>}
                                  </div>
                                  <span className={styles.notificationOverlayItemMessage}>{notif.message}</span>
                                  {notif.createdAt && <span className={styles.notificationOverlayItemTime}>{new Date(notif.createdAt.toMillis()).toLocaleDateString()}</span>}
                                </>
                              );

                              return notif.url ? (
                                <Link href={notif.url} key={notif.id} className={styles.notificationOverlayItem} onClick={() => setIsNotifOpen(false)}>
                                  <NotificationContent />
                                </Link>
                              ) : (
                                <div key={notif.id} className={styles.notificationOverlayItem}>
                                  <NotificationContent />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Link href="/cart" style={{ position: 'relative' }} className={styles.desktopOnly}>
              <button aria-label="Cart" className={styles.iconBtn}><ShoppingBag size={20} strokeWidth={1.5} /></button>
              {mounted && cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>

            {/* Mobile Menu Trigger (Disabled from Top Nav) */}
            <button 
              aria-label="Open Menu" 
              className={`${styles.iconBtn} ${styles.mobileSubBtn || ''}`}
              onClick={() => setIsDrawerOpen(true)}
              style={{ display: 'none' }}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
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
      {/* Mobile Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              className={styles.drawerOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div 
              className={styles.drawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className={styles.drawerHeader}>
                <Link href="/" onClick={() => setIsDrawerOpen(false)} className={styles.brand}>
                   <span>DUAL</span><span className={styles.brandAccent}>DEER</span>
                </Link>
                <button onClick={() => setIsDrawerOpen(false)} className={styles.iconBtn}><X size={24} /></button>
              </div>
              <div className={styles.drawerContent}>
                <nav className={styles.drawerNav}>
                   <Link href="/shop" onClick={() => setIsDrawerOpen(false)}>COLLECTION</Link>
                   {liveCategories.map((cat, i) => (
                      <Link key={i} href="/shop" onClick={() => setIsDrawerOpen(false)} style={{ textTransform: 'uppercase' }}>
                        {cat}
                      </Link>
                   ))}
                   <Link href="/project-x" onClick={() => setIsDrawerOpen(false)} style={{ color: 'var(--red-500)' }}>MYSTERY (LOCKED)</Link>
                   <div className={styles.drawerDivider} />
                   <Link href="/auth" onClick={() => setIsDrawerOpen(false)}>MY ACCOUNT</Link>
                   <Link href="/cart" onClick={() => setIsDrawerOpen(false)}>MY BAG ({cartCount})</Link>
                </nav>
              </div>
              <div className={styles.drawerFooter}>
                 <button 
                  className={styles.themeToggleFull} 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <><Sun size={18} /> Light Mode</> : <><Moon size={18} /> Dark Mode</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <LiveTrafficBadge />
    </>
  );
}
