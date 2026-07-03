"use client";
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { X, Gift, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import styles from './NewUserPopup.module.css';
import Link from 'next/link';

export default function NewUserPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const hasSeen = localStorage.getItem('dualdeer_newuser_popup') === 'dismissed'; // if they saved it permanently
      const isDismissedSession = sessionStorage.getItem('dualdeer_newuser_popup_dismissed') === 'true';
      
      if (!user && !hasSeen && !isDismissedSession) {
        timer = setTimeout(() => {
          setIsOpen(true);
          // Save to local storage so it syncs when they sign up
          const stored = JSON.parse(localStorage.getItem('dualdeer_unlocked_coupons') || '[]');
          if (!stored.includes('WELCOME15')) {
            stored.push('WELCOME15');
            localStorage.setItem('dualdeer_unlocked_coupons', JSON.stringify(stored));
          }
        }, 3000);
      } else {
        setIsOpen(false);
      }
    });

    return () => {
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const closePopup = () => {
    setIsOpen(false);
    sessionStorage.setItem('dualdeer_newuser_popup_dismissed', 'true');
  };

  const copyCode = () => {
    navigator.clipboard.writeText('WELCOME15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button onClick={closePopup} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <div className={styles.banner}>
           <Gift size={32} />
        </div>

        <div className={styles.content}>
          <h2 className={styles.title}>Welcome to DualDeer.</h2>
          <p className={styles.subtitle}>
            Your initiation to the elite tier begins now. Claim your 15% discount code and unlock exclusive gear. This code will automatically be saved to your Wallet when you create an identity.
          </p>
          
          <div className={styles.couponCodeWrapper}>
             <code className={styles.couponCode}>WELCOME15</code>
             <button onClick={copyCode} className={styles.copyBtn} title="Copy Code">
               {copied ? <CheckCircle2 size={18} color="#10b981" /> : <Copy size={18} />}
             </button>
          </div>

          <div className={styles.actions}>
            <Link 
              href="/auth" 
              onClick={() => {
                setIsOpen(false);
                localStorage.setItem('dualdeer_newuser_popup', 'dismissed');
              }} 
              className={styles.primaryBtn}
            >
              Create Identity to Save <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
