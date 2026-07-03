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
    // Only mount on client and only fire if they haven't seen it yet
    const hasSubscribed = localStorage.getItem('dualdeer_newsletter') === 'subscribed';
    const isDismissedSession = sessionStorage.getItem('dualdeer_newsletter_dismissed') === 'true';
    
    if (!hasSubscribed && !isDismissedSession) {
      // Engage the drop after 5 seconds of active browsing
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeDrop = () => {
    setIsOpen(false);
    // We use sessionStorage for dismissals so it keeps coming back on new visits if not filled
    if (status !== 'success') {
       sessionStorage.setItem('dualdeer_newsletter_dismissed', 'true');
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus('loading');
    try {
      await addSubscriber(email);
      setStatus('success');
      localStorage.setItem('dualdeer_newsletter', 'subscribed');
      
      // Save coupon locally
      const stored = JSON.parse(localStorage.getItem('dualdeer_unlocked_coupons') || '[]');
      if (!stored.includes('FIRST15')) {
        stored.push('FIRST15');
        localStorage.setItem('dualdeer_unlocked_coupons', JSON.stringify(stored));
      }

      // Save coupon to Firestore if logged in
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            await updateDoc(userRef, { unlockedCoupons: arrayUnion('FIRST15') });
          } else {
            await setDoc(userRef, { unlockedCoupons: ['FIRST15'], email: user.email, name: user.displayName });
          }
        } catch (e) {
          console.error("Failed to save coupon to user profile", e);
        }
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Network uplink failed. Try again.');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText('FIRST15');
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
               <code className={styles.couponCode} style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>FIRST15</code>
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
