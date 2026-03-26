"use client";
import React, { useState, useEffect } from 'react';
import { addSubscriber } from '@/lib/firebaseUtils';
import { X, Mail, Tag, ArrowRight } from 'lucide-react';
import styles from './NewsletterModal.module.css';

export default function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  useEffect(() => {
    // Only mount on client and only fire if they haven't seen it yet
    const hasSeen = localStorage.getItem('dualdeer_newsletter');
    if (!hasSeen) {
      // Engage the drop after 5 seconds of active browsing
      const timer = setTimeout(() => setIsOpen(true), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const closeDrop = () => {
    setIsOpen(false);
    // Mark as dismissed so we don't spam them on next reload
    if (status !== 'success') {
       localStorage.setItem('dualdeer_newsletter', 'dismissed');
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
    } catch (err) {
      console.error(err);
      setStatus('idle');
      alert('Network uplink failed. Try again.');
    }
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
            
            <div className={styles.couponCodeWrapper}>
               <code className={styles.couponCode}>FIRST15</code>
            </div>

            <button onClick={closeDrop} className={styles.continueBtn}>
              Enter Protocol
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
