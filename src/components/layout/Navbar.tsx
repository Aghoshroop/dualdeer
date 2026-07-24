"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, User, X, Sun, Moon, Menu, Bell, ChevronRight, Crown, Grid } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import LiveTrafficBadge from '../ui/LiveTrafficBadge';
import { Product, AppNotification, getActiveNotifications, sendChatMessage, ChatMessage, markMessagesAsRead } from '@/lib/firebaseUtils';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './Navbar.module.css';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import EliteMobileNav from './EliteMobileNav';
import EliteDesktopNav from './EliteDesktopNav';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';


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
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [unreadNotifIds, setUnreadNotifIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const { cartCount } = useCart();
  const { formatPrice, renderPrice } = useCurrency();
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

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });


    // Dynamically fetch active categories and products
    import('@/lib/firebaseUtils').then(({ getProducts, getCategories }) => {
      getProducts().then(prods => {
        setAllProducts(prods);
        const uniqueCats = Array.from(new Set(prods.filter(p => p.category).map(p => p.category.toUpperCase())));
        console.log("Navbar derived live categories:", uniqueCats);
        setLiveCategories(uniqueCats);
      }).catch(err => console.error(err));
      
      getActiveNotifications().then(notifs => {
        setNotifications(notifs);
        const stored = localStorage.getItem('dualdeer_read_notif_ids');
        const readIds: string[] = stored ? JSON.parse(stored) : [];
        
        const currentUnreadIds = notifs.map(n => n.id).filter(id => id && !readIds.includes(id)) as string[];
        
        setUnreadNotifIds(currentUnreadIds);
        setUnreadNotifCount(currentUnreadIds.length);
      }).catch(err => console.error(err));
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      unsubscribeAuth();
    };
  }, []);

  // Real-time Chat Listener
  useEffect(() => {
    if (!currentUser) {
      setChatMessages([]);
      return;
    }
    
    const q = query(collection(db, 'chats'), where('userId', '==', currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      msgs.sort((a, b) => {
        const timeA = (a.createdAt as any)?.toMillis ? (a.createdAt as any).toMillis() : a.createdAt;
        const timeB = (b.createdAt as any)?.toMillis ? (b.createdAt as any).toMillis() : b.createdAt;
        return Number(timeB) - Number(timeA); // desc
      });
      setChatMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Combined Notifications and Chats Logic
  useEffect(() => {
    let count = 0;
    
    // Global Notifications
    const stored = localStorage.getItem('dualdeer_read_notif_ids');
    const readIds: string[] = stored ? JSON.parse(stored) : [];
    const currentUnreadIds = notifications.map(n => n.id).filter(id => id && !readIds.includes(id)) as string[];
    
    // Unread Admin Chats
    const unreadChats = chatMessages.filter(m => m.sender === 'admin' && !m.readByUser);
    
    setUnreadNotifIds(currentUnreadIds);
    setUnreadNotifCount(currentUnreadIds.length + unreadChats.length);
  }, [notifications, chatMessages]);


  // Dynamic Scroll Distances
  const dockStart = 0;
  const dockEnd = 50;

  // Cinematic Logo Mappings (Forked for viewport safety)
  const logoYDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [140, 140, 0]);
  const logoXDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [0, 0, 0]); // Mathematically centered
  const logoScaleDesktop = useTransform(scrollY, [0, dockStart, dockEnd], [4, 4, 1]); // Reduced to fit screen width safely
  
  const logoYMobile = useTransform(scrollY, [0, dockStart, dockEnd], [60, 60, 0]);
  
  // Safely centered without arbitrary offsets
  const logoXMobile = useTransform(scrollY, [0, dockStart, dockEnd], [0, 0, 0]); 
  const logoXMicro = useTransform(scrollY, [0, dockStart, dockEnd], [0, 0, 0]); 
  
  // Safe scaling for ultra-micro screens
  const logoScaleMobile = useTransform(scrollY, [0, dockStart, dockEnd], [isMicro ? 1.2 : 1.5, isMicro ? 1.2 : 1.5, 1]);
  
  const [isDocked, setIsDocked] = useState(false);
  const [isNavHidden, setIsNavHidden] = useState(false); // Smart sticky state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    return scrollY.on("change", (latest) => {
      if (latest > dockEnd) setIsDocked(true);
      else setIsDocked(false);

      // Smart sticky logic: hide on scroll down, show on scroll up
      const previous = scrollY.getPrevious();
      if (previous !== undefined) {
        if (latest > previous && latest > 150) {
          setIsNavHidden(true); // scrolling down
        } else if (latest < previous) {
          setIsNavHidden(false); // scrolling up
        }
      }
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

  const [isHovered, setIsHovered] = useState(false);
  
  // Adaptive cinematic variants
  const navContainerVariants = {
    expandedTop: {
      width: "100%",
      borderRadius: "0px",
      y: 0, // Lifted completely to the top on all pages!
      backgroundColor: isHome ? "rgba(0,0,0,0)" : (theme === 'dark' ? "var(--color-background)" : "var(--color-background)"),
      backdropFilter: "blur(0px)",
      border: "1px solid rgba(0,0,0,0)",
      borderBottomColor: isHome ? "rgba(0,0,0,0)" : "var(--color-border)",
    },
    expandedScrolled: {
      width: "100%",
      borderRadius: "0px",
      y: 0,
      backgroundColor: theme === 'dark' ? "rgba(10,10,10,0.85)" : "rgba(255,255,255,0.9)",
      backdropFilter: "blur(16px)",
      border: "1px solid rgba(0,0,0,0)",
      borderBottomColor: "var(--color-border)",
    },
    compact: {
      width: isMobile ? "92%" : "65%",
      borderRadius: "50px",
      y: 20,
      backgroundColor: theme === 'dark' ? "rgba(15,15,20,0.7)" : "rgba(255,255,255,0.75)",
      backdropFilter: "blur(24px)",
      border: theme === 'dark' ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.06)",
      borderBottomColor: theme === 'dark' ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
    }
  };

  const mainNavVariants = {
    expandedTop: { height: isMobile ? "50px" : "80px", padding: isMobile ? "0 20px" : "0 3rem" },
    expandedScrolled: { height: isMobile ? "50px" : "80px", padding: isMobile ? "0 20px" : "0 3rem" },
    compact: { height: "60px", padding: isMobile ? "0 20px" : "0 2rem" }
  };

  const linksVariants = {
    expandedTop: { gap: "2.5rem" },
    expandedScrolled: { gap: "2.5rem" },
    compact: { gap: "1.2rem" }
  };

  let navState = "expandedTop";
  if (isDocked) {
    // Prevent capsule shrinking on mobile
    navState = (isHovered || isMobile) ? "expandedScrolled" : "compact";
  }

  if (!mounted) {
    return null;
  }

  const handleNotifClick = () => {
    setIsNotifOpen(!isNotifOpen);
    if (!isNotifOpen) {
      setUnreadNotifCount(0); 
      const allKnownIds = notifications.map(n => n.id).filter(id => !!id);
      const stored = localStorage.getItem('dualdeer_read_notif_ids');
      const readIds: string[] = stored ? JSON.parse(stored) : [];
      const combinedReads = Array.from(new Set([...readIds, ...allKnownIds]));
      localStorage.setItem('dualdeer_read_notif_ids', JSON.stringify(combinedReads));
      
      if (currentUser) {
        markMessagesAsRead(currentUser.uid, 'user');
      }
    }
  };

  // Elite full-screen custom navigation applied to Elite, Product Details, and Checkout flows
  const isPremiumRoute = pathname === '/elite' || pathname.startsWith('/product/') || pathname.startsWith('/checkout');

  if (isPremiumRoute) {
    return (
      <>
        <motion.div
          style={{ position: 'sticky', top: 0, zIndex: 10000 }}
          animate={{ y: isNavHidden ? '-100%' : '0%' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {isMobile ? (
            <EliteMobileNav onSearchClick={() => setIsSearchOpen(true)} />
          ) : (
            <EliteDesktopNav 
              onSearchClick={() => setIsSearchOpen(true)}
              theme={theme || 'dark'}
              onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              unreadNotifCount={unreadNotifCount}
              onNotifClick={handleNotifClick}
              cartCount={cartCount}
            />
          )}
        </motion.div>
        <div ref={searchRef} style={{ position: 'relative', zIndex: 99999 }}>
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
                              href={`/product/${product.slug}`} 
                              key={`${product.id}-${idx}`} 
                              className={styles.marqueeResultCard}
                              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            >
                              <div className={styles.marqueeResultImage}>
                                <img src={product.image} alt={product.name} />
                              </div>
                              <div className={styles.marqueeResultInfo}>
                                <h4>{product.name}</h4>
                                <span>{renderPrice(product.price)}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={styles.overlayResultsGrid}>
                        {displayResults.map(product => (
                          <Link 
                            href={`/product/${product.slug}`} 
                            key={product.id} 
                            className={styles.overlayResultCard}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                          >
                            <div className={styles.overlayResultImage}>
                              <img src={product.image} alt={product.name} />
                            </div>
                            <div className={styles.overlayResultInfo}>
                              <h4>{product.name}</h4>
                              <span>{renderPrice(product.price)}</span>
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

        {/* Render Notification Overlay */}
        <div ref={notifRef} style={{ position: 'relative', zIndex: 99999 }}>
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
                    {notifications.length === 0 && chatMessages.filter(m => m.sender === 'admin').length === 0 ? (
                      <div className={styles.overlayNoResults}>
                        You're all caught up!
                        <span className={styles.overlayDidYouMean}>No active system alerts or messages at this time</span>
                      </div>
                    ) : (
                      <div className={styles.notificationGridList}>
                        {chatMessages.filter(m => m.sender === 'admin').map((msg) => (
                          <div key={msg.id} className={styles.notificationOverlayItem}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span className={styles.notificationOverlayItemTitle}>Message from Admin</span>
                              {!msg.readByUser && <span className={styles.newBadgeOverlay}>NEW</span>}
                            </div>
                            <span className={styles.notificationOverlayItemMessage}>{msg.text}</span>
                            {msg.createdAt && <span className={styles.notificationOverlayItemTime}>{new Date((msg.createdAt as any).toMillis ? (msg.createdAt as any).toMillis() : msg.createdAt).toLocaleDateString()}</span>}
                            
                            {/* Reply Section */}
                            <div className={styles.replySection}>
                              <textarea 
                                className={styles.replyInput}
                                placeholder="Type a reply..."
                                value={replyText[msg.id!] || ''}
                                rows={1}
                                onChange={(e) => {
                                  setReplyText({...replyText, [msg.id!]: e.target.value});
                                  e.target.style.height = 'auto';
                                  e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                }}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    if (replyText[msg.id!]?.trim() && currentUser) {
                                      await sendChatMessage(currentUser.uid, replyText[msg.id!], 'user');
                                      setReplyText({...replyText, [msg.id!]: ''});
                                      e.currentTarget.style.height = 'auto';
                                    }
                                  }
                                }}
                              />
                              <button 
                                className={styles.replyBtn}
                                onClick={async () => {
                                  if (replyText[msg.id!]?.trim() && currentUser) {
                                    await sendChatMessage(currentUser.uid, replyText[msg.id!], 'user');
                                    setReplyText({...replyText, [msg.id!]: ''});
                                  }
                                }}
                              >
                                Reply
                              </button>
                            </div>
                          </div>
                        ))}

                        {notifications.map((notif) => {
                          const NotificationContent = () => (
                            <>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className={styles.notificationOverlayItemTitle}>{notif.title}</span>
                                  {notif.id && unreadNotifIds.includes(notif.id) && <span className={styles.newBadgeOverlay}>NEW</span>}
                                </div>
                              <span className={styles.notificationOverlayItemMessage}>{notif.message}</span>
                              {notif.createdAt && <span className={styles.notificationOverlayItemTime}>{new Date((notif.createdAt as any).toMillis ? (notif.createdAt as any).toMillis() : notif.createdAt).toLocaleDateString()}</span>}
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
      </>
    );
  }

  return (
    <>
      <motion.header 
        id="global-navbar"
        className={styles.header} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setHoveredMenu(null); }}
        variants={navContainerVariants}
        initial="expandedTop"
        animate={navState}
        transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.8 }}
        style={{ left: 0, right: 0, margin: "0 auto", position: 'fixed', zIndex: 100 }}
      >
        {/* Collapsible Promo Bar nested inside header to prevent overlapping and allow clean docking */}
        <motion.div 
          className={styles.promoBar}
          animate={{ 
            height: isDocked ? 0 : (isMobile ? 25 : 40), 
            opacity: isDocked ? 0 : 1 
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: 'hidden', width: '100%' }}
        >
          <span>COMPLIMENTARY SHIPPING & RETURNS ON ALL ORDERS</span>
        </motion.div>

        <motion.div className={styles.mainNav} variants={mainNavVariants} transition={{ type: "spring", stiffness: 400, damping: 35 }}>
          <motion.div className={styles.leftLinks} variants={linksVariants} transition={{ type: "spring", stiffness: 400, damping: 35 }}>
            <div 
              className={styles.navItem} 
              onMouseEnter={() => setHoveredMenu('collection')}
              style={{ position: 'relative' }}
            >
              <Link href="/shop" className={styles.link}>
                <Grid size={14} style={{ marginRight: '6px' }} />
                COLLECTION
              </Link>

              <AnimatePresence>
                {hoveredMenu === 'collection' && liveCategories.length > 0 && (
                  <motion.div
                    className={styles.dropdownWrapper}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.dropdownContent}>
                      <Link href={`/shop`} className={styles.dropdownItem} style={{ fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.2rem' }}>
                        ALL COLLECTIONS
                      </Link>
                      {liveCategories.map((cat, idx) => (
                        <Link key={idx} href={`/shop?category=${encodeURIComponent(cat)}`} className={styles.dropdownItem}>
                          {cat}
                        </Link>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className={styles.navItem}>
              <Link href="/elite" className={styles.exclusiveLink}>
                <Crown size={14} style={{ marginRight: '6px' }} />
                EXCLUSIVE
              </Link>
            </div>
          </motion.div>

          <motion.div 
            className={`${styles.brandContainer} ${isDocked || !isHome ? styles.docked : styles.floating}`}
            style={isHome && !isMobile ? { 
              y: logoYDesktop, 
              x: logoXDesktop,
              scale: logoScaleDesktop,
              transformOrigin: 'center center'
            } : {}}
            animate={navState === "compact" ? { scale: 0.9 } : { scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          >
            <Link href="/" className={`${styles.brand} logo-font`}>
              <span style={!isDocked && isHome ? { color: 'white', textShadow: '0 4px 20px rgba(0,0,0,0.5)' } : {}}>DU<span className="custom-logo-a">A</span>L</span>
              <span className={styles.brandAccent}>D<span className="custom-logo-e">E</span><span className="custom-logo-e">E</span>R</span>
            </Link>
          </motion.div>

          <motion.div className={styles.rightIcons} variants={linksVariants} transition={{ type: "spring", stiffness: 400, damping: 35 }}>
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
                                  href={`/product/${product.slug}`} 
                                  key={`${product.id}-${idx}`} 
                                  className={styles.marqueeResultCard}
                                  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                                >
                                  <div className={styles.marqueeResultImage}>
                                    <img src={product.image} alt={product.name} />
                                  </div>
                                  <div className={styles.marqueeResultInfo}>
                                    <h4>{product.name}</h4>
                                    <span>{renderPrice(product.price)}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className={styles.overlayResultsGrid}>
                            {displayResults.map(product => (
                              <Link 
                                href={`/product/${product.slug}`} 
                                key={product.id} 
                                className={styles.overlayResultCard}
                                onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                              >
                                <div className={styles.overlayResultImage}>
                                  <img src={product.image} alt={product.name} />
                                </div>
                                <div className={styles.overlayResultInfo}>
                                  <h4>{product.name}</h4>
                                  <span>{renderPrice(product.price)}</span>
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
              {theme === 'dark' ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
            </button>

            <Link href="/auth" className={styles.desktopOnly}>
              <button aria-label="Account" className={styles.iconBtn}><User size={20} strokeWidth={1.5} /></button>
            </Link>
            
            <div className={styles.notificationContainer} ref={notifRef}>
              <button 
                aria-label="Notifications" 
                className={styles.iconBtn} 
                onClick={handleNotifClick}
                style={{ position: 'relative' }}
              >
                <Bell size={20} strokeWidth={1.5} />
                {unreadNotifCount > 0 && (
                  <span className={styles.cartBadge} style={{ background: '#ef4444', color: 'var(--color-text)' }}>{unreadNotifCount}</span>
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
                        {notifications.length === 0 && chatMessages.filter(m => m.sender === 'admin').length === 0 ? (
                          <div className={styles.overlayNoResults}>
                            You're all caught up!
                            <span className={styles.overlayDidYouMean}>No active system alerts or messages at this time</span>
                          </div>
                        ) : (
                          <div className={styles.notificationGridList}>
                            {chatMessages.filter(m => m.sender === 'admin').map((msg) => (
                              <div key={msg.id} className={styles.notificationOverlayItem}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span className={styles.notificationOverlayItemTitle}>Message from Admin</span>
                                  {!msg.readByUser && <span className={styles.newBadgeOverlay}>NEW</span>}
                                </div>
                                <span className={styles.notificationOverlayItemMessage}>{msg.text}</span>
                                {msg.createdAt && <span className={styles.notificationOverlayItemTime}>{new Date((msg.createdAt as any).toMillis ? (msg.createdAt as any).toMillis() : msg.createdAt).toLocaleDateString()}</span>}
                                
                                {/* Reply Section */}
                                <div className={styles.replySection}>
                                  <textarea 
                                    className={styles.replyInput}
                                    placeholder="Type a reply..."
                                    value={replyText[msg.id!] || ''}
                                    rows={1}
                                    onChange={(e) => {
                                      setReplyText({...replyText, [msg.id!]: e.target.value});
                                      e.target.style.height = 'auto';
                                      e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                                    }}
                                    onKeyDown={async (e) => {
                                      if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        if (replyText[msg.id!]?.trim() && currentUser) {
                                          await sendChatMessage(currentUser.uid, replyText[msg.id!], 'user');
                                          setReplyText({...replyText, [msg.id!]: ''});
                                          e.currentTarget.style.height = 'auto';
                                        }
                                      }
                                    }}
                                  />
                                  <button 
                                    className={styles.replyBtn}
                                    onClick={async () => {
                                      if (replyText[msg.id!]?.trim() && currentUser) {
                                        await sendChatMessage(currentUser.uid, replyText[msg.id!], 'user');
                                        setReplyText({...replyText, [msg.id!]: ''});
                                      }
                                    }}
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            ))}

                            {notifications.map((notif) => {
                              const NotificationContent = () => (
                                <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span className={styles.notificationOverlayItemTitle}>{notif.title}</span>
                                      {notif.id && unreadNotifIds.includes(notif.id) && <span className={styles.newBadgeOverlay}>NEW</span>}
                                    </div>
                                  <span className={styles.notificationOverlayItemMessage}>{notif.message}</span>
                                  {notif.createdAt && <span className={styles.notificationOverlayItemTime}>{new Date((notif.createdAt as any).toMillis ? (notif.createdAt as any).toMillis() : notif.createdAt).toLocaleDateString()}</span>}
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
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </Link>

            {/* Mobile Menu Trigger */}
            <button 
              aria-label="Open Menu" 
              className={`${styles.iconBtn} ${styles.mobileSubBtn || ''}`}
              onClick={() => setIsDrawerOpen(true)}
              style={{ display: 'none' }}
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
          </motion.div>
        </motion.div>

        {/* Old Collection Mega Menu removed as it was centered globally */}

      </motion.header>

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
                 <Link href="/" onClick={() => setIsDrawerOpen(false)} className={`${styles.brand} logo-font`}>
                   <span>DU<span className="custom-logo-a">A</span>L</span><span className={styles.brandAccent}>D<span className="custom-logo-e">E</span><span className="custom-logo-e">E</span>R</span>
                </Link>
                <button onClick={() => setIsDrawerOpen(false)} className={styles.iconBtn}><X size={24} /></button>
              </div>
              <div className={styles.drawerContent}>
                <nav className={styles.drawerNav}>
                   <Link href="/shop" onClick={() => setIsDrawerOpen(false)}>COLLECTION</Link>
                   <Link href="/elite" onClick={() => setIsDrawerOpen(false)} className={styles.exclusiveLink} style={{ padding: 0 }}>EXCLUSIVE</Link>
                   {liveCategories.map((cat, i) => (
                      <Link key={i} href="/shop" onClick={() => setIsDrawerOpen(false)} style={{ textTransform: 'uppercase' }}>
                        {cat}
                      </Link>
                   ))}
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

      {pathname !== '/checkout' && <LiveTrafficBadge />}
    </>
  );
}
