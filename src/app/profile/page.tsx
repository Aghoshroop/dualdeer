"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ShoppingBag, Gift, Award, LogOut, ArrowLeft, Bookmark, LayoutDashboard } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import styles from './ProfilePage.module.css';
import EliteOverview from '@/components/profile/EliteOverview';
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

  if (!user) return null;

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <EliteOverview user={user} setActiveTab={setActiveTab} />;
      case 'orders':
        return <OrderHistory user={user} />;
      case 'rewards':
        return <RewardGame user={user} />;
      case 'wishlist':
        return <ProfileWishlist user={user} />;
      case 'cart':
        return <ProfileCart />;
      default:
        return <EliteOverview user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className={styles.container}>
      {/* BACKGROUND EFFECTS */}
      <div className={styles.bgGlow} />

      {/* BACK NAVIGATION */}
      <button className={styles.backBtn} onClick={() => router.push('/')}>
        <ArrowLeft size={16} /> <span className={styles.backText}>RETREAT</span>
      </button>

      {/* SIDEBAR NAVIGATION */}
      <aside className={styles.sidebar}>
        <div className={styles.profileHead}>
          <div className={styles.avatar}>
            {user.photoURL ? (
              <img src={user.photoURL} alt="" />
            ) : (
              user.displayName ? user.displayName.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()
            )}
          </div>
          <div className={styles.headText}>
            <h3>{user.displayName || 'Elite Operative'}</h3>
            <p>{user.email}</p>
          </div>
        </div>

        <nav className={styles.nav}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <LayoutDashboard size={20} /> <span className={styles.navText}>Command Center</span>
          </button>
          
          <button 
            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <ShoppingBag size={20} /> <span className={styles.navText}>Payload History</span>
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
            <Bookmark size={20} /> <span className={styles.navText}>Saved Tech</span>
          </button>

          <button 
            className={`${styles.navBtn} ${activeTab === 'cart' ? styles.active : ''}`}
            onClick={() => setActiveTab('cart')}
          >
            <Gift size={20} /> <span className={styles.navText}>Active Bag</span>
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className={styles.tabContent}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
