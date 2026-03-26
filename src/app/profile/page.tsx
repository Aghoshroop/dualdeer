"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Gift, Award, LogOut, ArrowLeft, Bookmark } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styles from './ProfilePage.module.css';
import RewardGame from '@/components/profile/RewardGame';
import OrderHistory from '@/components/profile/OrderHistory';
import ProfileCart from '@/components/profile/ProfileCart';
import ProfileWishlist from '@/components/profile/ProfileWishlist';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/auth');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/auth');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--color-background)' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <User size={32} color="var(--color-primary)" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null; // Prevent flash before redirect

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
      case 'orders':
        return <OrderHistory user={user} />;
      case 'rewards':
        return <RewardGame user={user} />;
      case 'wishlist':
        return <ProfileWishlist user={user} />;
      case 'cart':
        return <ProfileCart />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      {/* BACK NAVIGATION */}
      <button className={styles.backBtn} onClick={() => router.push('/')}>
        <ArrowLeft size={16} /> <span className={styles.backText}>RETREAT</span>
      </button>

      {/* SIDEBAR NAVIGATION */}
      <aside className={styles.sidebar}>
        <div className={styles.profileHead}>
          <div className={styles.avatar}>
            {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
          </div>
          <h3>{user.displayName || 'Elite Member'}</h3>
          <p>{user.email}</p>
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <User size={20} /> <span className={styles.navText}>Overview</span>
          </button>
          
          <button 
            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} /> <span className={styles.navText}>Order History</span>
          </button>
          
          <button 
            className={`${styles.navBtn} ${activeTab === 'rewards' ? styles.active : ''}`}
            onClick={() => setActiveTab('rewards')}
          >
            <Award size={20} /> <span className={styles.navText}>Reward Nexus</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'wishlist' ? styles.active : ''}`}
            onClick={() => setActiveTab('wishlist')}
          >
            <Bookmark size={20} /> <span className={styles.navText}>Wishlist</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'cart' ? styles.active : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <Gift size={20} /> <span className={styles.navText}>Shopping Cart</span>
          </button>
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={20} /> <span className={styles.navText}>Terminate Link</span>
        </button>
      </aside>

      {/* DYNAMIC CONTENT */}
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={styles.tabContent}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
