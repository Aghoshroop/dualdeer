"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './page.module.css';
import { Lock, Fingerprint, EyeOff, ShieldAlert } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { QrCode, ArrowRight } from 'lucide-react';

export default function ProjectXClient() {
  const [timeLeft, setTimeLeft] = useState(0);
  const [step, setStep] = useState<'form' | 'payment' | 'success'>('form');
  const [transactionId, setTransactionId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    size: ''
  });

  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const targetDate = new Date('2026-05-10T00:00:00').getTime();
    const calculateTime = () => Math.max(0, Math.floor((targetDate - new Date().getTime()) / 1000));
    
    setTimeLeft(calculateTime());
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}D : ${h.toString().padStart(2, '0')}H : ${m.toString().padStart(2, '0')}M : ${s.toString().padStart(2, '0')}S`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.phone && formData.size) {
      setStep('payment');
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (transactionId.length > 5) {
      try {
        await addDoc(collection(db, 'projectX_bookings'), {
          ...formData,
          transactionId,
          amountPaid: 100,
          timestamp: serverTimestamp()
        });
        setStep('success');
      } catch (error) {
        console.error("Error booking slot:", error);
        alert("Failed to secure booking. Ensure connection is stable.");
      }
    } else {
      alert("Please enter a valid Transaction ID.");
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.noiseOverlay}></div>
      <div className={styles.scanline}></div>

      {/* Abstract Background Element */}
      <motion.div style={{ y: yBg }} className={styles.abstractGlow} />

      <motion.div 
        className={styles.contentWrapper}
        initial={{ opacity: 0, y: 50, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className={styles.header}>
          <div className={styles.badge}>RESTRICTED CLEARANCE ONLY</div>
          <h1 className={styles.title}>
            <span className={styles.titleGlitch1}>DUALDEER GREYNINJA ELITE</span>
            DUALDEER GREYNINJA ELITE
            <span className={styles.titleGlitch2}>DUALDEER GREYNINJA ELITE</span>
          </h1>
          <p className={styles.subtitle}>
            <Lock size={14} style={{ display: 'inline', marginRight: 5, verticalAlign: 'middle' }} />
            <span className={styles.classifiedText}>CLASSIFIED DROP</span> // AWAITING DECLASSIFICATION
          </p>
        </div>

        {/* Narrative / Mystery Description Section */}
        <div className={styles.mysteryLoreSection}>
          <motion.div 
            className={styles.loreCard}
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <ShieldAlert className={styles.loreIcon} />
            <h3>THE ANOMALY</h3>
            <p>
              We didn't just design a standard piece of apparel. We forged an anomaly.
              <span className={styles.redacted}> [DATA EXPUNGED] </span>
              A silhouette that bends light and defies conventional aerodynamics. 
              Only 20 prototypes survived the final stress test.
            </p>
          </motion.div>

          <motion.div 
            className={styles.loreCard}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <EyeOff className={styles.loreIcon} />
            <h3>UNSEEN. UNMATCHED.</h3>
            <p>
              Engineered with <span className={styles.redacted}>[RESTRICTED]</span> fabric technology. 
              The <strong style={{ color: '#fff' }}>GREYNINJA ELITE</strong> is completely stealth. It feels like wearing nothing. It acts as an armor against distraction.
            </p>
          </motion.div>
          
          <motion.div 
            className={`${styles.loreCard} ${styles.loreCardWide}`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
          >
            <Fingerprint className={styles.loreIcon} />
            <h3>WHAT YOU NEED TO KNOW</h3>
            <div className={styles.curiousPoints}>
              <p>• Only <strong style={{color: '#8A2BE2'}}>20 slots available</strong> globally.</p>
              <p>• Engineered for a <span className={styles.redacted}>classified</span> professional athlete, now partially declassified.</p>
              <p>• No restocking. Once the 20 slots are filled, the blueprint is destroyed.</p>
            </div>
          </motion.div>
        </div>

        {/* The Obscured Product Visual */}
        <motion.div 
          className={styles.productObscuredOpenly}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div className={styles.imageOverlayLight}></div>
          <Image 
            src="/mystery2.png" 
            alt="CLASSIFIED PRODUCT VISUAL PREVIEW" 
            fill
            className={styles.mysteryImageOpen}
            style={{ objectFit: 'cover' }}
          />
        </motion.div>

        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>System Countdown</span>
            <span className={styles.statValue}>{formatTime(timeLeft)}</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Available Units</span>
            <span className={`${styles.statValue} ${styles.red}`}>20 / 20</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statLabel}>Price Estimate</span>
            <span className={styles.statValue}>₹9<span className={styles.glitchChar}>**</span></span>
          </div>
        </div>

        {step === 'form' && (
          <motion.form 
            className={styles.formSection}
            onSubmit={handleSubmitForm}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.formHeader}>
              <div style={{ width: 8, height: 8, background: '#8A2BE2', borderRadius: '50%', boxShadow: '0 0 10px #8A2BE2' }}></div>
              REQUEST EARLY ACCESS PROTOCOL
            </div>
            
            <div className={styles.formGrid}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Operative Name</label>
                <input 
                  type="text" 
                  name="name"
                  required
                  className={styles.input} 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Secure Comms (Email)</label>
                <input 
                  type="email" 
                  name="email"
                  required
                  className={styles.input} 
                  placeholder="agent@domain.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Direct Line (Phone)</label>
                <input 
                  type="tel" 
                  name="phone"
                  required
                  className={styles.input} 
                  placeholder="+91 **********"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Chassis Size</label>
                <select 
                  name="size" 
                  required 
                  className={`${styles.input} ${styles.select}`}
                  value={formData.size}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>SELECT SIZE</option>
                  <option value="S">SMALL (S)</option>
                  <option value="M">MEDIUM (M)</option>
                  <option value="L">LARGE (L)</option>
                  <option value="XL">EXTRA LARGE (XL)</option>
                </select>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              PROCEED TO ADVANCE BOOKING <ArrowRight size={18} style={{marginLeft: '10px'}}/>
            </button>
          </motion.form>
        )}

        {step === 'payment' && (
          <motion.form 
            className={styles.formSection}
            onSubmit={handlePaymentSubmit}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className={styles.formHeader}>
              <div style={{ width: 8, height: 8, background: '#ffcc00', borderRadius: '50%', boxShadow: '0 0 10px #ffcc00' }}></div>
              SECURE SLOT: ADVANCE PAYMENT (₹100)
            </div>
            
            <div className={styles.paymentContainer}>
              <div className={styles.qrCodeBox}>
                <QrCode size={100} className={styles.qrIcon} strokeWidth={1} />
                <p>Transfer exactly ₹100 via UPI</p>
                <span className={styles.upiId}>UPI: dualdeer@okaxis</span>
              </div>
              
              <div className={styles.paymentInputBox}>
                <div className={styles.inputGroup}>
                  <label className={styles.label}>12-Digit Transaction Reference (UTR/Txn ID)</label>
                  <input 
                    type="text" 
                    required
                    className={styles.input} 
                    placeholder="e.g. 312345678901"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                  />
                  <p className={styles.helperText}>Slot allocation is manual. If the transaction ID is faulty, clearance will be revoked immediately.</p>
                </div>

                <button type="submit" className={styles.submitBtn}>
                  VERIFY & BOOK SLOT
                </button>
                <button type="button" className={styles.secondaryBtn} onClick={() => setStep('form')}>
                  GO BACK
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {step === 'success' && (
          <motion.div 
            className={styles.successMessage}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <h3>✓ CLEARANCE GRANTED</h3>
            <p>Your signature and advance payment reference have been registered in the secure ledger. Standby for further instructions regarding the DUALDEER GREYNINJA ELITE drop.</p>
          </motion.div>
        )}
      </motion.div>
    </main>
  );
}
