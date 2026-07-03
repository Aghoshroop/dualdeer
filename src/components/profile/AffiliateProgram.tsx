"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Copy, CheckCircle, IndianRupee, HandCoins, ArrowRight } from 'lucide-react';
import { getAffiliate, registerAffiliate, requestWithdrawal, Affiliate, WithdrawalRequest } from '@/lib/firebaseUtils';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './ProfileComponents.module.css';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';

interface AffiliateProgramProps {
  user: any;
}

export default function AffiliateProgram({ user }: AffiliateProgramProps) {
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [upiId, setUpiId] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const { formatPrice } = useCurrency();

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

  const handleRegister = async () => {
    if (!affiliateCode.trim() || affiliateCode.length < 3) {
      alert("Please enter a valid code name (min 3 characters).");
      return;
    }
    const finalCode = `${affiliateCode.toUpperCase().trim()}DUALDEER5`;
    
    setRegistering(true);
    try {
      await registerAffiliate(user.uid, user.displayName || 'Customer', finalCode);
    } catch (e) {
      console.error(e);
      alert("Failed to register. Please try again.");
    }
    setRegistering(false);
  };

  const handleCopy = () => {
    if (affiliate?.code) {
      navigator.clipboard.writeText(affiliate.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      alert("You cannot withdraw more than your available earnings (excluding pending requests).");
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
      alert("Withdrawal requested successfully! Admin will process it shortly.");
    } catch (e) {
      console.error(e);
      alert("Failed to request withdrawal.");
    }
    setWithdrawing(false);
  };

  if (loading) return <div className={styles.loading}>Loading Affiliate Profile...</div>;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (!affiliate) {
    return (
      <motion.div variants={container} initial="hidden" animate="show" className={styles.overviewWrapper}>
        <motion.h2 variants={item} className={styles.sectionTitle}>
          <Users size={24} color="var(--color-primary)" /> Dualdeer Affiliate Program
        </motion.h2>

        <motion.div variants={item} className={styles.gameContainer} style={{ background: 'linear-gradient(145deg, #1e293b, #0f172a)', border: '1px solid #334155' }}>
          <div className={styles.pointsBadge} style={{ color: '#00ffcc', borderColor: '#00ffcc' }}>
             Earn 5% Cash
          </div>
          <h3 className={styles.gameTitle} style={{ background: 'linear-gradient(45deg, #fff, #00ffcc)' }}>Become a Partner</h3>
          <p className={styles.gameDescription}>
            Create your custom 5% discount code. Share it with friends and followers. Whenever someone uses your code to buy an item, you earn the exact discount amount as cash (credited once their order is Delivered). Withdraw straight to your UPI account.
          </p>
          
          <div className={styles.formContainer}>
            <div className={styles.inputGroup}>
               <input 
                 type="text" 
                 placeholder="Your Name (e.g. AVI)" 
                 value={affiliateCode}
                 onChange={(e) => setAffiliateCode(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                 className={styles.formInput}
                 maxLength={10}
               />
               <div className={styles.inputSuffix}>
                 DUALDEER5
               </div>
            </div>
            <button 
              className={`${styles.playBtn} ${styles.submitBtn}`}
              onClick={handleRegister} 
              disabled={registering || affiliateCode.length < 3}
            >
              {registering ? 'Joining...' : 'Join Affiliate Program'} <ArrowRight size={20} />
            </button>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Your code will be: {affiliateCode.toUpperCase()}DUALDEER5</span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={styles.overviewWrapper}>
      <motion.h2 variants={item} className={styles.sectionTitle}>
        <Users size={24} color="var(--color-primary)" /> Affiliate Dashboard
      </motion.h2>

      {/* STATS */}
      <motion.div variants={item} className={styles.statsGrid}>
        <div className={styles.statCard} style={{ borderColor: '#00ffcc', background: 'rgba(0, 255, 204, 0.05)' }}>
          <div className={styles.statIconBox} style={{ background: 'rgba(0, 255, 204, 0.15)' }}>
            <IndianRupee size={24} color="#00ffcc" />
          </div>
          <div>
            <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Available to Withdraw</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>₹{(affiliate.earnings - (affiliate.pendingWithdrawal || 0)).toFixed(2)}</div>
            {(affiliate.pendingWithdrawal || 0) > 0 && (
               <div style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                 + ₹{(affiliate.pendingWithdrawal || 0).toFixed(2)} Pending Payout
               </div>
            )}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox}>
            <HandCoins size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h4 style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Withdrawn</h4>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>₹{(affiliate.totalWithdrawn || 0).toFixed(2)}</div>
          </div>
        </div>
      </motion.div>

      {/* CODE & WITHDRAWAL */}
      <div className={styles.affiliateCardGrid}>
         <motion.div variants={item} className={styles.statCard}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Your Custom Coupon</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Share this code. Your friends get 5% off, and you earn the discount amount!</p>
            
            <div className={styles.couponDisplayBox}>
               <span className={styles.couponText}>{affiliate.code}</span>
               <button 
                 onClick={handleCopy}
                 className={styles.copyBtn}
               >
                 {copied ? <CheckCircle size={20} color="#10b981" /> : <Copy size={20} />} {copied ? 'Copied' : 'Copy'}
               </button>
            </div>
         </motion.div>

         <motion.div variants={item} className={styles.statCard}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Request Withdrawal</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Minimum withdrawal is ₹1000.</p>
            
            <div className={styles.formContainer} style={{ maxWidth: '100%' }}>
                <div className={styles.inputGroupDark}>
                 <input 
                   type="number" 
                   placeholder="Amount (₹)"
                   value={withdrawAmount || ''}
                   onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                   className={styles.formInputDark}
                 />
                 <button 
                   onClick={() => setWithdrawAmount(affiliate.earnings - (affiliate.pendingWithdrawal || 0))}
                   className={styles.maxBtn}
                 >
                   Max
                 </button>
               </div>
               <input 
                 type="text" 
                 placeholder="Enter UPI ID (e.g. phone@upi)"
                 value={upiId}
                 onChange={(e) => setUpiId(e.target.value)}
                 className={styles.formInputDark}
               />
               <button 
                 onClick={handleWithdraw}
                 disabled={withdrawing || (affiliate.earnings - (affiliate.pendingWithdrawal || 0)) < 1000}
                 className={`${styles.submitBtn} ${(affiliate.earnings - (affiliate.pendingWithdrawal || 0)) >= 1000 ? styles.submitBtnActive : styles.submitBtnDisabled}`}
               >
                 {withdrawing ? 'Processing...' : 'Submit Request'}
               </button>
            </div>
         </motion.div>
      </div>

      {/* WITHDRAWAL HISTORY */}
      {withdrawals.length > 0 && (
        <motion.div variants={item} style={{ width: '100%', minWidth: 0 }}>
           <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#fff' }}>Recent Withdrawals</h3>
           <div style={{ background: 'var(--color-border)', borderRadius: '12px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%', minWidth: 0 }}>
              <table style={{ width: '100%', minWidth: '400px', borderCollapse: 'collapse', textAlign: 'left' }}>
                 <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Date</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Amount</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>UPI ID</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                 </thead>
                 <tbody>
                    {withdrawals.map(w => (
                       <tr key={w.id} style={{ borderTop: '1px solid #334155' }}>
                          <td style={{ padding: '1rem', color: '#fff' }}>
                            {w.createdAt?.toDate ? w.createdAt.toDate().toLocaleDateString() : 'N/A'}
                          </td>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: 600 }}>₹{w.amount}</td>
                          <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>{w.paymentMethodDetails}</td>
                          <td style={{ padding: '1rem' }}>
                             <span style={{
                               padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase',
                               background: w.status === 'paid' ? 'rgba(16, 185, 129, 0.2)' : w.status === 'pending' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                               color: w.status === 'paid' ? '#10b981' : w.status === 'pending' ? '#f59e0b' : '#ef4444'
                             }}>
                               {w.status}
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </motion.div>
      )}

    </motion.div>
  );
}
