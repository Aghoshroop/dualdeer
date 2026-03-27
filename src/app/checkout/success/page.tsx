"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight, Truck, Mail, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getOrder, Order } from '@/lib/firebaseUtils';
import styles from './Success.module.css';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    if (orderId) {
      // Trigger confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Fetch order details
      getOrder(orderId).then(data => {
        setOrder(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className={styles.container} style={{ minHeight: '60vh', justifyContent: 'center' }}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <ShoppingBag size={40} />
        </motion.div>
        <p style={{ marginTop: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', opacity: 0.6 }}>Synchronizing Data...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <motion.div 
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.iconBox}>
          <CheckCircle size={48} strokeWidth={1.5} />
        </div>
        <h1 className={styles.title}>Order Confirmed</h1>
        <p className={styles.subtitle}>
          Your request has been validated. A confirmation email with the full technical brief has been sent to <strong>{order?.shippingDetails?.email}</strong>.
        </p>
        
        {order?.id && (
          <div className={styles.trackingBadge}>
            <Package size={18} />
            <span>ID: <strong>{order.id.toUpperCase()}</strong></span>
          </div>
        )}
      </motion.div>

      {/* Progress Tracker */}
      <motion.div 
        className={styles.progressContainer}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className={`${styles.step} ${styles.completedStep}`}>
          <div className={styles.stepIcon}><CheckCircle size={20} /></div>
          <span className={styles.stepLabel}>Validated</span>
        </div>
        <div className={`${styles.step} ${styles.activeStep}`}>
          <div className={styles.stepIcon}><Package size={20} /></div>
          <span className={styles.stepLabel}>Processing</span>
        </div>
        <div className={styles.step}>
          <div className={styles.stepIcon}><Truck size={20} /></div>
          <span className={styles.stepLabel}>Nexus Transit</span>
        </div>
        <div className={styles.step}>
          <div className={styles.stepIcon}><MapPin size={20} /></div>
          <span className={styles.stepLabel}>Delivered</span>
        </div>
      </motion.div>

      <div className={styles.summaryGrid}>
        {/* Item Summary */}
        <motion.div 
          className={styles.orderSection}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h3>Payload Summary</h3>
          <div className={styles.itemList}>
            {order?.items.map((item, idx) => (
              <div key={idx} className={styles.item}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                ) : (
                  <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Package size={24} opacity={0.2} />
                  </div>
                )}
                <div className={styles.itemInfo}>
                  <h4>{item.name}</h4>
                  <p>Qty: {item.quantity} {item.size && `| Size: ${item.size}`}</p>
                </div>
                <div className={styles.priceInfo}>
                  ₹{(item.pricePaid * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Logistics & Payment */}
        <motion.div 
          className={styles.orderSection}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <h3>Nexus & Logistics</h3>
          <div className={styles.detailsList}>
            <div className={styles.detailRow}>
              <span>Recipient</span>
              <span>{order?.shippingDetails?.name}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Nexus Address</span>
              <span style={{ textAlign: 'right', maxWidth: '200px' }}>{order?.shippingDetails?.address}, {order?.shippingDetails?.city}</span>
            </div>
            <div className={styles.detailRow}>
              <span>Method</span>
              <span>Express Secure Dispatch</span>
            </div>
            <div className={styles.detailRow} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', fontWeight: 700, fontSize: '1.1rem' }}>
              <span>Total Value</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{order?.total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.8 }}
      >
        <Link href="/shop" className={styles.primaryBtn}>Return to Collection</Link>
        <Link href="/profile" className={styles.secondaryBtn}>View Tactical Map</Link>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <main className={styles.page}>
      <Suspense fallback={<div className={styles.container}>Loading Confirmation...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
    </main>
  );
}
