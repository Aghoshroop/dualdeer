"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Coins, Ticket, Sparkles, Copy, CheckCircle2, Award } from 'lucide-react';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getCoupons, Coupon } from '@/lib/firebaseUtils';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './ProfileComponents.module.css';

export default function RewardGame({ user }: { user: any }) {
  const [points, setPoints] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { formatPrice, renderPrice } = useCurrency();

  useEffect(() => {
    const loadData = async () => {
      if (!user?.uid) return;
      
      let currentUnlocked: string[] = [];

      // 1. Fetch or Create User Profile in Firestore
      try {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setPoints(data.points || 0);
          
          let firestoreUnlocked = data.unlockedCoupons || [];
          
          // Merge with localStorage
          const localUnlocked = JSON.parse(localStorage.getItem('dualdeer_unlocked_coupons') || '[]');
          
          const combinedUnlocked = Array.from(new Set([...firestoreUnlocked, ...localUnlocked]));
          
          // If local has more than firestore, maybe we should update firestore? (optional, but good)
          if (localUnlocked.length > 0 && combinedUnlocked.length > firestoreUnlocked.length) {
            updateDoc(userRef, { unlockedCoupons: combinedUnlocked }).catch(console.error);
          }
          
          currentUnlocked = combinedUnlocked;
          setUnlocked(combinedUnlocked);
        } else {
          const localUnlocked = JSON.parse(localStorage.getItem('dualdeer_unlocked_coupons') || '[]');
          await setDoc(userRef, { points: 0, email: user.email, name: user.displayName, unlockedCoupons: localUnlocked });
          currentUnlocked = localUnlocked;
          setUnlocked(localUnlocked);
        }
      } catch (e) {
        console.error("Firebase Rule Error: Cannot read or write users collection.", e);
      }

      // 2. Fetch Active Coupons from Admin panel global store
      try {
        const allCoupons = await getCoupons();
        
        // Filter only active ones that are marked as public OR explicitly unlocked by this user
        setCoupons(allCoupons.filter(c => 
          c.active && (c.isPublic || currentUnlocked.includes(c.code))
        ));
      } catch (e) {
        console.error("Firebase Rule Error: Cannot read coupons collection.", e);
      }
    };
    loadData();
  }, [user]);

  const playGame = async () => {
    setPlaying(true);
    
    // Simulate game calculation & dramatic pause
    await new Promise(r => setTimeout(r, 1500));
    
    // Generate random points between 50 and 500
    const won = Math.floor(Math.random() * 450) + 50;
    
    // Save to Firestore
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { points: increment(won) });
      setPoints(prev => prev + won);
    } catch (e) {
      console.error("Error saving points", e);
    }

    setPlaying(false);
  };

  const copyToClipboard = (code: string, id?: string) => {
    if (!id) return;
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <h2 className={styles.sectionTitle}><Award size={28} color="var(--color-primary)"/> Rewards & Coupons</h2>
      
      {/* Gamification Area */}
      <div className={styles.gameContainer}>
        <div className={styles.pointsBadge}>
          <Coins size={18} /> {points} Store Points
        </div>

        <h3 className={styles.gameTitle}>Daily Bonus Spin</h3>
        <p className={styles.gameDescription}>
          Tap to try your luck and win Store Points. 
          Use your points in the future to unlock special discounts.
        </p>

        <motion.button 
          className={styles.playBtn}
          onClick={playGame}
          disabled={playing}
          whileTap={!playing ? { scale: 0.95 } : {}}
        >
          {playing ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'flex' }}>
              <Sparkles size={24} />
            </motion.div>
          ) : (
            <><Sparkles size={24} /> Spin for Points</>
          )}
        </motion.button>
      </div>

      {/* Coupon Wallet */}
      <h2 className={styles.sectionTitle} style={{ marginTop: '4rem' }}><Ticket size={28} color="var(--color-primary)"/> Your Coupon Wallet</h2>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>Exclusive promotional codes actively unlocked for your account.</p>

      {coupons.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(var(--foreground-rgb), 0.02)', borderRadius: '12px' }}>
          <Ticket size={48} color="rgba(var(--foreground-rgb), 0.1)" style={{ margin: '0 auto 1rem' }} />
          <p>You have no active coupons in your wallet.</p>
        </div>
      ) : (
        <div className={styles.walletGrid}>
          {coupons.map((coupon) => (
            <div key={coupon.id} className={styles.couponCard}>
              <div className={styles.couponCode}>
                {coupon.code}
                <button 
                  onClick={() => copyToClipboard(coupon.code, coupon.id)}
                  style={{ background: 'transparent', border: 'none', color: copiedId === coupon.id ? '#10b981' : 'var(--color-text-muted)', cursor: 'pointer', transition: 'all 0.2s' }}
                  title="Copy Code"
                >
                  {copiedId === coupon.id ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                </button>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                <span className={styles.discountTag}>
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `${renderPrice(coupon.discountValue)} OFF`}
                </span>
                <span className={styles.couponDesc}>
                  {coupon.code === 'WELCOME15' ? 'New Elite Exclusive' : 'Exclusive Elite Reward'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Ensure Award icon gets pulled from lucide
