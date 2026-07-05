"use client";
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Copy, CheckCircle, XCircle, AlertTriangle, IndianRupee, HandCoins, ArrowRight, Share2, Send, ShieldCheck, Trophy, Sparkles, TrendingUp, Package, MousePointerClick, Star, Loader2 } from 'lucide-react';
import { getAffiliate, registerAffiliate, requestWithdrawal, checkAffiliatePrefix, Affiliate, WithdrawalRequest } from '@/lib/firebaseUtils';
import { useCurrency } from '@/context/CurrencyContext';
import * as metaPixel from '@/lib/metaPixel';
import styles from './AffiliateProgram.module.css';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

interface AffiliateProgramProps {
  user: any;
}

export default function AffiliateProgram({ user }: AffiliateProgramProps) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Enrollment State
  const [registering, setRegistering] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [awardedBonus, setAwardedBonus] = useState(0);
  
  // Validation State
  const [codeStatus, setCodeStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'reserved' | 'profanity' | 'network_error' | 'permission_denied' | 'error' | 'invalid' | 'rate_limited'>('idle');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const requestTimestamps = React.useRef<number[]>([]);
  
  // Dashboard State
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [upiId, setUpiId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  
  const { formatPrice, renderPrice } = useCurrency();

  useEffect(() => {
    if (!user?.uid) return;
    
    // Listen to affiliate doc
    const unsubscribeAff = onSnapshot(doc(db, 'affiliates', user.uid), (snap) => {
      if (snap.exists()) {
        setAffiliate({ id: snap.id, ...snap.data() } as Affiliate);
      } else {
        setAffiliate(null);
      }
      setLoading(false);
    });

    // Listen to withdrawal requests
    const unsubscribeW = onSnapshot(query(collection(db, 'withdrawal_requests'), where('affiliateId', '==', user.uid)), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as WithdrawalRequest));
      setWithdrawals(data.sort((a, b) => b.createdAt!.toMillis() - a.createdAt!.toMillis()));
    });

    return () => {
      unsubscribeAff();
      unsubscribeW();
    };
  }, [user]);

  // Animated Counter for Celebration
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    if (showCelebration && awardedBonus > 0) {
      count.set(0);
      const animation = animate(count, awardedBonus, { duration: 1.5, ease: "easeOut" });
      
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 6000);
      
      return () => {
        animation.stop();
        clearTimeout(timer);
      };
    }
  }, [showCelebration, awardedBonus]);

  // Real-time Availability Engine
  useEffect(() => {
    // Sanitize input
    const raw = affiliateCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    if (raw.length < 3) {
      setCodeStatus('invalid');
      setSuggestions([]);
      return;
    }
    
    if (raw.length > 12) {
      setCodeStatus('invalid');
      setSuggestions([]);
      return;
    }

    setCodeStatus('checking');
    const timer = setTimeout(async () => {
      // Rate limiting (20 per minute)
      const now = Date.now();
      requestTimestamps.current = requestTimestamps.current.filter(t => now - t < 60000);
      if (requestTimestamps.current.length >= 20) {
        setCodeStatus('rate_limited');
        return;
      }
      requestTimestamps.current.push(now);

      try {
        const result = await checkAffiliatePrefix(raw);
        setCodeStatus(result.status);
        
        if (result.status === 'taken') {
          // Generate Smart Suggestions
          const candidates = [`${raw}X`, `${raw}PRO`, `${raw}GO`, `THE${raw}`, `${raw}360`, `${raw}OFFICIAL`, `${raw}26`];
          const availableSuggestions: string[] = [];
          
          for (const candidate of candidates) {
            if (availableSuggestions.length >= 2) break;
            const res = await checkAffiliatePrefix(candidate);
            if (res.status === 'available') availableSuggestions.push(res.normalized);
          }
          setSuggestions(availableSuggestions);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error(err);
        setCodeStatus('error');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [affiliateCode]);

  const handleRegister = async () => {
    if (codeStatus !== 'available') {
      return;
    }
    if (!termsAgreed) return;

    const rawPrefix = affiliateCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
    
    setRegistering(true);
    try {
      const { awardedBonus: bonusAmount } = await registerAffiliate(user.uid, user.displayName || 'Customer', rawPrefix);
      setAwardedBonus(bonusAmount);
      metaPixel.event('CompleteRegistration', { content_name: 'Affiliate Registration' });
      setShowCelebration(true);
      // Removed the 3000ms auto-close so the premium popup handles its own lifecycle.
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to register. Please try again.");
    }
    setRegistering(false);
  };

  const getReferralLink = () => {
    if (typeof window !== 'undefined' && affiliate?.code) {
      return `${window.location.origin}/?ref=${affiliate.code}`;
    }
    return '';
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    const link = getReferralLink();
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'DualDeer 5% OFF',
          text: `Use my code ${affiliate?.code} for 5% off your entire DualDeer order!`,
          url: link,
        });
      } catch (err) {
        console.log('Share error:', err);
      }
    } else {
      handleCopy(link);
    }
  };

  const handleWithdraw = async () => {
    if (!affiliate) return;
    if (withdrawAmount < 1000) {
      alert("Minimum withdrawal amount is ₹1000.");
      return;
    }
    const available = affiliate.earnings - (affiliate.pendingWithdrawal || 0);
    if (withdrawAmount > available) {
      alert("You cannot withdraw more than your available earnings.");
      return;
    }
    if (!upiId.trim() || !upiId.includes('@')) {
      alert("Please enter a valid UPI ID (e.g. name@bank).");
      return;
    }

    setWithdrawing(true);
    try {
      await requestWithdrawal(user.uid, withdrawAmount, upiId);
      setWithdrawAmount(0);
      setUpiId('');
      // alert Removed for premium feel, the state updates organically below
    } catch (e) {
      console.error(e);
      alert("Failed to request withdrawal.");
    }
    setWithdrawing(false);
  };

  if (loading) {
    return (
      <div className={styles.emptyState} style={{ minHeight: '60vh' }}>
        <Loader2 className={styles.emptyStateIcon} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading Affiliate Data...</p>
      </div>
    );
  }

  const celebrationPopup = (
    <AnimatePresence>
      {showCelebration && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}
        >
          <motion.div
            initial={{ scale: 0.8, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '24px', padding: '3rem 2rem', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(162, 130, 197, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}
          >
            {/* Purple luxury glow */}
            <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at 50% 0%, rgba(162, 130, 197, 0.15) 0%, transparent 60%)', pointerEvents: 'none' }} />
            
            <Trophy size={48} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem', filter: 'drop-shadow(0 0 12px rgba(162, 130, 197, 0.5))' }} />
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text)' }}>🎉 Congratulations!</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>You've earned an Instant Referral Reward</p>
            
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.2rem', marginBottom: '1.5rem', textShadow: '0 0 30px rgba(162, 130, 197, 0.4)' }}
            >
              <span style={{ fontSize: '2.5rem' }}>₹</span>
              <motion.span>{rounded}</motion.span>
            </motion.div>
            
            <p style={{ color: 'var(--color-text)', fontSize: '0.9rem', marginBottom: '2.5rem', lineHeight: 1.5, padding: '0 1rem' }}>
              Your referral was successful and your reward has been instantly credited to your affiliate wallet.
            </p>
            
            <button 
              onClick={() => setShowCelebration(false)}
              style={{ width: '100%', padding: '1rem', background: 'var(--color-foreground)', color: 'var(--color-background)', border: 'none', borderRadius: '50px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', transition: 'transform 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              View Wallet <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ==========================================
  // ENROLLMENT UI
  // ==========================================

  if (!affiliate) {
    return (
      <>
        {celebrationPopup}
        <div className={styles.container}>
        <motion.div 
          className={styles.onboardingHero}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.onboardingBadge}>
            <Sparkles size={16} /> Partner Program
          </div>
          <h1 className={styles.onboardingTitle}>Earn real cash recommending DualDeer.</h1>
          <p className={styles.onboardingSubtitle}>
            Your friends save 5%. You earn 5%. Paid directly to your UPI.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white', padding: '0.5rem 1rem', borderRadius: '50px', fontWeight: 700, fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)' }}>
              <Sparkles size={16} /> Get up to ₹300 Instant Welcome Bonus!
            </div>
          </div>
        </motion.div>

        <div className={styles.timelineSteps}>
          {[
            { icon: <ShieldCheck size={24} />, title: "Create your code", desc: "Choose a unique discount code for your followers." },
            { icon: <Share2 size={24} />, title: "Share it", desc: "Post it on Instagram, WhatsApp, or anywhere." },
            { icon: <Package size={24} />, title: "Friends purchase", desc: "They get 5% off their entire order." },
            { icon: <IndianRupee size={24} />, title: "Earn cash", desc: "You earn 5% cash once their order is delivered." },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <motion.div 
                className={styles.stepCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.stepIcon}>{step.icon}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </motion.div>
              {i < 3 && <ArrowRight size={24} className={styles.stepArrow} />}
            </React.Fragment>
          ))}
        </div>

        <motion.div 
          className={styles.codeCreator}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '1.5rem' }}>Claim your code</h2>
          
          <div className={styles.inputWrapper}>
            <input 
              type="text" 
              className={styles.prefixInput}
              placeholder="e.g. AVIROOP"
              value={affiliateCode}
              onChange={(e) => setAffiliateCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12))}
            />
            <span className={styles.suffixFixed}>DUALDEER5</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '-0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              {affiliateCode.length}/12 characters
            </span>
          </div>

          <div className={styles.previewBadge} style={{ minHeight: '40px', display: 'flex', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
              {codeStatus === 'invalid' && (
                <motion.span key="invalid" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className={styles.previewNeutral}>Enter 3-12 alphanumeric characters</motion.span>
              )}
              {codeStatus === 'checking' && (
                <motion.span key="checking" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className={styles.previewNeutral}><Loader2 size={16} className="animate-spin" /> Checking...</motion.span>
              )}
              {codeStatus === 'available' && (
                <motion.span key="available" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className={styles.previewAvailable}><CheckCircle size={16} /> Code Available</motion.span>
              )}
              {codeStatus === 'taken' && (
                <motion.div key="taken" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                    <XCircle size={16} /> Already Taken
                  </span>
                  {suggestions.length > 0 && (
                    <div style={{ marginTop: '0.75rem', fontSize: '0.85rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', marginBottom: '0.25rem', display: 'block' }}>Suggestions:</span>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {suggestions.map(s => (
                          <button key={s} onClick={() => setAffiliateCode(s)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '0.25rem 0.75rem', borderRadius: '50px', fontSize: '0.8rem', color: 'var(--color-text)', cursor: 'pointer' }}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
              {codeStatus === 'reserved' && (
                <motion.span key="reserved" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Reserved Name
                </motion.span>
              )}
              {codeStatus === 'profanity' && (
                <motion.span key="profanity" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <XCircle size={16} /> Name not allowed
                </motion.span>
              )}
              {codeStatus === 'network_error' && (
                <motion.span key="network_error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>
                  <AlertTriangle size={16} /> Unable to verify availability. Please try again.
                </motion.span>
              )}
              {codeStatus === 'permission_denied' && (
                <motion.span key="permission_denied" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Database Permission Denied.
                </motion.span>
              )}
              {codeStatus === 'rate_limited' && (
                <motion.span key="rate_limited" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Too many requests. Please wait.
                </motion.span>
              )}
              {codeStatus === 'error' && (
                <motion.span key="error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                  <AlertTriangle size={16} /> Unexpected Error.
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          <div className={styles.termsWrapper}>
            <input 
              type="checkbox" 
              id="terms" 
              className={styles.termsCheckbox}
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
            />
            <label htmlFor="terms">I agree to the Affiliate Terms and Conditions.</label>
          </div>

          <button 
            className={styles.primaryBtn}
            disabled={registering || codeStatus !== 'available' || !termsAgreed}
            onClick={handleRegister}
          >
            {registering ? <Loader2 className="animate-spin" /> : <Star />}
            {registering ? 'Creating Account...' : 'Join Affiliate Program'}
          </button>
        </motion.div>
      </div>
      </>
    );
  }

  // ==========================================
  // DASHBOARD UI
  // ==========================================
  
  const availableEarnings = (affiliate?.earnings || 0) - (affiliate?.pendingWithdrawal || 0);
  const pendingEarnings = affiliate?.pendingEarnings || 0;
  const totalWithdrawn = affiliate?.totalWithdrawn || 0;
  const totalEarned = (affiliate?.earnings || 0) + totalWithdrawn;
  
  // Mock metrics for UI completeness without requiring backend modifications
  const mockClicks = 0;
  const mockOrders = withdrawals.length > 0 ? 3 : 0; // Just visual based on activity
  const mockRevenue = 0;

  return (
    <>
      {celebrationPopup}
      <div className={styles.container}>
      
      {/* Hero Card */}
      <motion.div className={styles.dashboardHero}>
        <div className={styles.heroLeft}>
          <span className={styles.heroLabel}>Available Earnings</span>
          <div className={styles.heroBalance}>₹{availableEarnings.toFixed(2)}</div>
          <p className={styles.heroDesc}>Earn 5% on every successful referral.</p>
        </div>
        <div className={styles.heroRight}>
          <button className={styles.primaryBtn} onClick={handleNativeShare} style={{ width: 'auto', padding: '1rem 2rem' }}>
            <Share2 size={20} /> Share Code
          </button>
        </div>
      </motion.div>

      {/* Quick Stats Grid */}
      <div className={styles.statsGrid}>
        {[
          { label: "Commission Earned", value: `₹${totalEarned.toFixed(2)}`, icon: <IndianRupee size={16} /> },
          { label: "Pending Delivery", value: `₹${pendingEarnings.toFixed(2)}`, icon: <Package size={16} /> },
          { label: "Total Withdrawn", value: `₹${totalWithdrawn.toFixed(2)}`, icon: <HandCoins size={16} /> },
          { label: "Revenue Generated", value: `₹${mockRevenue.toFixed(2)}`, icon: <TrendingUp size={16} /> },
          { label: "Total Orders", value: mockOrders, icon: <CheckCircle size={16} /> },
          { label: "Link Clicks", value: mockClicks, icon: <MousePointerClick size={16} /> },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            className={styles.statCard}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={styles.statTitle}>{stat.icon} {stat.label}</div>
            <div className={styles.statValue}>{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Action Bento Grid */}
      <div className={styles.bentoGrid}>
        
        {/* Code & Share */}
        <motion.div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <h3 className={styles.bentoTitle}>Your Affiliate Link</h3>
          </div>
          
          <div className={styles.couponDisplay}>
            <div className={styles.couponCodeRow}>
              <div className={styles.codeScrollArea}>
                <span className={styles.couponCode}>{affiliate?.code}</span>
              </div>
              <button className={`${styles.iconBtn} ${styles.desktopCopyBtn}`} onClick={() => handleCopy(affiliate?.code || '')}>
                {copied ? <CheckCircle size={20} color="#10b981" /> : <Copy size={20} />}
              </button>
            </div>
            <button className={`${styles.primaryBtn} ${styles.mobileCopyBtn}`} onClick={() => handleCopy(affiliate?.code || '')}>
              {copied ? <CheckCircle size={20} color="#10b981" /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div className={styles.shareGrid}>
            <button className={styles.shareBtn} onClick={() => window.open(`https://wa.me/?text=Use my code ${affiliate?.code} for 5% off DualDeer! ${getReferralLink()}`, '_blank')}>
              <Send size={24} color="#25D366" />
              WhatsApp
            </button>
            <button className={styles.shareBtn} onClick={() => window.open(`https://t.me/share/url?url=${getReferralLink()}&text=Use my code ${affiliate?.code} for 5% off DualDeer!`, '_blank')}>
              <Send size={24} color="#0088cc" />
              Telegram
            </button>
            <button className={styles.shareBtn} onClick={() => handleCopy(getReferralLink())}>
              <Copy size={24} />
              Copy Link
            </button>
            <button className={styles.shareBtn} onClick={handleNativeShare}>
              <Share2 size={24} />
              More
            </button>
          </div>
        </motion.div>

        {/* Payout Form */}
        <motion.div className={styles.bentoCard}>
          <div className={styles.bentoHeader}>
            <h3 className={styles.bentoTitle}>Request Payout</h3>
          </div>
          
          <div className={styles.progressWrapper}>
            {/* Desktop / Tablet Header */}
            <div className={`${styles.progressHeader} ${styles.desktopOnly}`}>
              <span>Minimum Withdrawal ₹1000</span>
            </div>

            {/* Mobile Header */}
            <div className={`${styles.mobileOnly} ${styles.mobileProgressFlow}`}>
              <div className={styles.mobileProgressRow}>
                <span className={styles.progressLabel}>Minimum Withdrawal</span>
                <span className={styles.progressValue}>₹1000</span>
              </div>
              <div className={styles.mobileProgressRow}>
                <span className={styles.progressLabel}>Current Progress</span>
                <span className={styles.progressValue}>₹{availableEarnings.toFixed(0)} / ₹1000</span>
              </div>
            </div>

            <div className={styles.progressBarBg}>
              <div 
                className={styles.progressBarFill} 
                style={{ width: `${Math.min((availableEarnings / 1000) * 100, 100)}%` }}
              />
            </div>

            <div className={styles.progressFooter}>
              {/* Desktop / Tablet Current Progress */}
              <span className={`${styles.progressCurrent} ${styles.desktopOnly}`}>
                Current Progress (₹{availableEarnings.toFixed(0)} / ₹1000)
              </span>
              
              {availableEarnings < 1000 && (
                <span className={styles.progressRemaining}>Only ₹{(1000 - availableEarnings).toFixed(2)} more to unlock withdrawals.</span>
              )}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <div className={styles.inputGroupRow}>
              <input 
                type="number" 
                className={`${styles.modernInput} ${styles.modernInputWithBtn}`} 
                placeholder="Amount to withdraw (₹)"
                value={withdrawAmount || ''}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
              />
              <button 
                className={styles.maxBtn}
                onClick={() => setWithdrawAmount(availableEarnings)}
              >
                MAX
              </button>
            </div>
            <input 
              type="text" 
              className={styles.modernInput} 
              placeholder="Your UPI ID (e.g. name@bank)"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
            />
            <button 
              className={styles.primaryBtn}
              disabled={withdrawing || availableEarnings < 1000 || !upiId || !withdrawAmount}
              onClick={handleWithdraw}
            >
              {withdrawing ? 'Processing...' : 'Submit Request'}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Motivation Achievements */}
      <div>
        <h3 className={styles.heroLabel} style={{ marginBottom: '1rem' }}>Achievements</h3>
        <div className={styles.achievementsGrid}>
          
          <div className={`${styles.achievementCard} ${styles.unlocked}`}>
            <div className={styles.achievementIconWrapper}>
              <Star className={styles.achievementIcon} color="#f59e0b" />
            </div>
            <span className={styles.achievementTitle}>Partner Joined</span>
            <span className={styles.achievementDesc}>Welcome to the club</span>
          </div>
          
          <div className={`${styles.achievementCard} ${mockOrders > 0 ? styles.unlocked : ''}`}>
            <div className={styles.achievementIconWrapper}>
              <CheckCircle className={styles.achievementIcon} color={mockOrders > 0 ? '#10b981' : undefined} />
            </div>
            <span className={styles.achievementTitle}>First Referral</span>
            <span className={styles.achievementDesc}>First successful sale</span>
          </div>
          
          <div className={`${styles.achievementCard} ${totalEarned >= 1000 ? styles.unlocked : ''}`}>
            <div className={styles.achievementIconWrapper}>
              <IndianRupee className={styles.achievementIcon} color={totalEarned >= 1000 ? '#3b82f6' : undefined} />
            </div>
            <span className={styles.achievementTitle}>First ₹1000</span>
            <span className={styles.achievementDesc}>Unlocked payouts</span>
          </div>
          
          <div className={`${styles.achievementCard} ${mockOrders >= 10 ? styles.unlocked : ''}`}>
            <div className={styles.achievementIconWrapper}>
              <Trophy className={styles.achievementIcon} />
            </div>
            <span className={styles.achievementTitle}>10 Orders</span>
            <span className={styles.achievementDesc}>Pro affiliate status</span>
          </div>

        </div>
      </div>

      {/* History Table */}
      <div>
        <h3 className={styles.heroLabel} style={{ marginBottom: '1rem' }}>Payout History</h3>
        {withdrawals.length === 0 ? (
          <div className={styles.emptyState}>
            <IndianRupee className={styles.emptyStateIcon} />
            <h4 className={styles.emptyStateTitle}>No payouts yet</h4>
            <p>Start sharing your code to earn your first reward.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.historyTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id}>
                    <td>{w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : 'N/A'}</td>
                    <td style={{ fontWeight: 700 }}>₹{w.amount.toFixed(2)}</td>
                    <td style={{ color: 'var(--color-text-muted)' }}>{w.paymentMethodDetails}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${w.status === 'paid' ? styles.statusPaid : w.status === 'pending' ? styles.statusPending : styles.statusRejected}`}>
                        {w.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      </div>
    </>
  );
}
