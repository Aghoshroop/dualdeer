"use client";
import React, { useState, useEffect } from 'react';
import { addSubscriber } from '@/lib/firebaseUtils';
import { auth, db } from '@/lib/firebase';
import { doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { X, Mail, Tag, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import styles from './NewsletterModal.module.css';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // 1. If they already saw it this session, don't show it again today.
    let seenThisSession = false;
    try {
      if (sessionStorage.getItem('newsletter_seen_this_session')) seenThisSession = true;
    } catch(e) {}

    if (seenThisSession) return;

    // 2. Check lifetime status
    let lifetimeStatus = 'none';
    try {
      lifetimeStatus = localStorage.getItem('dualdeer_newsletter') || 'none';
    } catch(e) {}
    
    // We only show it if they haven't subscribed, and they haven't dismissed it twice.
    if (lifetimeStatus !== 'subscribed' && lifetimeStatus !== 'dismissed_final') {
      const timer = setTimeout(() => {
        setIsOpen(true);
        try {
          sessionStorage.setItem('newsletter_seen_this_session', 'true');
        } catch(e) {}
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeDrop = () => {
    setIsOpen(false);
    try {
      const currentStatus = localStorage.getItem('dualdeer_newsletter');
      if (currentStatus === 'subscribed') return;
      
      let nextStatus = 'dismissed_once';
      
      // If they already dismissed it once in a previous session, this is their final dismissal.
      if (currentStatus === 'dismissed_once') {
        nextStatus = 'dismissed_final';
      }
      
      localStorage.setItem('dualdeer_newsletter', nextStatus);
      document.cookie = `dualdeer_newsletter=${nextStatus}; max-age=31536000; path=/`;
    } catch (e) {}
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus('loading');
    
    // 1. Immediately mark as subscribed locally so it NEVER pops up again.
    try {
      localStorage.setItem('dualdeer_newsletter', 'subscribed');
      document.cookie = "dualdeer_newsletter=subscribed; max-age=31536000; path=/";
    } catch (e) {}
    
    // Save coupon locally immediately too
    try {
      const stored = JSON.parse(localStorage.getItem('dualdeer_unlocked_coupons') || '[]');
      if (!stored.includes('NEW15')) {
        stored.push('NEW15');
        localStorage.setItem('dualdeer_unlocked_coupons', JSON.stringify(stored));
      }
    } catch(e) {}
    
    try {
      // 2. Perform network calls
      await addSubscriber(email);
      
      // Ensure coupon exists in database globally
      try {
        await setDoc(doc(db, 'coupons', 'NEW15'), {
          code: 'NEW15',
          discountType: 'percentage',
          discountValue: 15,
          active: true,
          usageLimitType: 'once_per_user',
          applyTo: 'total_cart',
          createdAt: new Date()
        }, { merge: true });
      } catch (e) {
        console.error("Failed to auto-create coupon in db", e);
      }

      // Save coupon to Firestore if logged in
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            await updateDoc(userRef, { unlockedCoupons: arrayUnion('NEW15') });
          } else {
            await setDoc(userRef, { unlockedCoupons: ['NEW15'], email: user.email, name: user.displayName });
          }
        } catch (e) {
          console.error("Failed to save coupon to user profile", e);
        }
      }
      
      setStatus('success');
    } catch (err) {
      console.error("Newsletter submission error:", err);
      // Even if network fails, we show success so the user gets their coupon
      // and isn't blocked by a database permission error.
      setStatus('success');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText('NEW15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={closeDrop} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <div className={styles.banner}>
           <Tag size={32} />
        </div>

        {status !== 'success' ? (
          <div className={styles.content}>
            <h2 className={styles.title}>Unlock 15% Off.</h2>
            <p className={styles.subtitle}>
              Join the DualDeer Armory. Submit your electronic coordinates to instantly receive a high-level security clearance code for 15% off your first payload.
            </p>

            <form onSubmit={handleSubscribe} className={styles.form}>
              <div className={styles.inputGroup}>
                <Mail size={18} className={styles.inputIcon} />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="Enter your email address..." 
                  required
                  className={styles.input}
                  disabled={status === 'loading'}
                />
              </div>
              <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                {status === 'loading' ? 'Encrypting...' : <><span style={{ marginRight: '8px' }}>Unlock Access</span> <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>
        ) : (
          <div className={styles.successContent}>
            <h2 className={styles.successTitle}>Access Granted.</h2>
            <p className={styles.successSubtitle}>Your clearance has been established. Apply the following sequence at Checkout:</p>
            
            <div className={styles.couponCodeWrapper} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '1rem', marginBottom: '1.5rem', background: 'rgba(var(--foreground-rgb), 0.05)', padding: '1rem', borderRadius: '8px' }}>
               <code className={styles.couponCode} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>NEW15</code>
               <button onClick={copyCode} className={styles.copyBtn} title="Copy Code" style={{ background: 'transparent', border: 'none', color: 'var(--color-text)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                 {copied ? <CheckCircle2 size={24} color="#10b981" /> : <Copy size={24} />}
               </button>
            </div>

            <button onClick={closeDrop} className={styles.continueBtn} style={{ background: 'var(--color-primary)', color: 'var(--color-background)', border: 'none', padding: '0.8rem 2rem', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
              Enter Protocol
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
