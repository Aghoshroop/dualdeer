"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Fingerprint, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Order } from '@/lib/firebaseUtils';
import { useCurrency } from '@/context/CurrencyContext';
import * as metaPixel from '@/lib/metaPixel';
import styles from './PremiumSuccess.module.css';

export default function PremiumSuccess() {
  const searchParams = useSearchParams();
  const { formatPrice, renderPrice } = useCurrency();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.classList.add('premium-theme');
    
    const orderId = searchParams.get('orderId');
    let unsubscribe: any = null;
    
    if (orderId) {
      // Real-time listener for order status/details
      const docRef = doc(db, 'orders', orderId);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setOrder({ id: docSnap.id, ...docSnap.data() } as Order);
        }
        setLoading(false);
      }, (error) => {
        console.error("Error listening to order status:", error);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    
    return () => {
      document.body.classList.remove('premium-theme');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [searchParams]);

  useEffect(() => {
    if (order && order.id) {
      const storageKey = `pixel_purchase_elite_${order.id}`;
      if (!sessionStorage.getItem(storageKey)) {
        sessionStorage.setItem(storageKey, 'true');
        
        metaPixel.event('Purchase', {
          value: order.total,
          currency: order.currency || 'INR',
          order_id: order.id,
          content_ids: order.items.map(item => item.productId),
          content_name: order.items.map(item => item.name).join(', '),
          content_type: 'product',
          num_items: order.items.reduce((acc, item) => acc + item.quantity, 0)
        });
      }
    }
  }, [order]);

  if (loading) {
    return (
      <div className={styles.vaultContainer} style={{ justifyContent: 'center' }}>
        <motion.div 
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Fingerprint size={60} color="#D4AF37" strokeWidth={1} />
        </motion.div>
        <p style={{ marginTop: '2rem', letterSpacing: '0.4em', textTransform: 'uppercase', fontSize: '0.75rem', color: '#D4AF37' }}>
          DECRYPTING VAULT...
        </p>
      </div>
    );
  }

  return (
    <div className={styles.vaultContainer}>
      {/* Hide global navbar via CSS injected here */}
      <style dangerouslySetInnerHTML={{ __html: `
        #global-navbar { display: none !important; }
      `}} />

      <motion.div 
        className={styles.vaultHeader}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <div className={styles.sealContainer}>
          <div className={styles.scanLine}></div>
          <Fingerprint size={40} color="#D4AF37" strokeWidth={1} />
        </div>
        <h1 className={styles.title}>Access Granted</h1>
        <p className={styles.subtitle}>
          Authorization Code: {order?.id?.toUpperCase()}
        </p>
      </motion.div>

      <div className={styles.contentGrid}>
        
        {/* ELITE LETTER */}
        <motion.section 
          className={styles.letterSection}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
             <ShieldCheck size={20} color="#D4AF37" />
             <span style={{ fontFamily: 'Inter', fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '0.3em', textTransform: 'uppercase' }}>Secure Transmission</span>
          </div>
          
          <p className={styles.letterText}>
            Dear {order?.shippingDetails?.name?.split(' ')[0] || 'Client'},
          </p>
          <p className={styles.letterText}>
            Your acquisition of a DualDeer Elite artifact has been successfully authenticated. You are no longer just a customer; you have entered the highest echelon of human performance.
          </p>
          <p className={styles.letterText}>
            Our artisans are currently preparing your gear with the utmost precision. A classified dossier containing your exact tracking coordinates will be transmitted to <strong>{order?.shippingDetails?.email}</strong> shortly.
          </p>
          <p className={styles.letterText}>
            Wear it with intent. Move with absolute power.
          </p>

          <div className={styles.letterSignature}>
            — The DualDeer Syndicate
          </div>
        </motion.section>

        {/* ENCRYPTED DOSSIER */}
        <motion.section 
          className={styles.dossierSection}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
        >
          <div className={styles.dossierHeader}>
            <span>Order Manifest</span>
            <Lock size={14} color="#D4AF37" />
          </div>

          <div className={styles.dataRow}>
             <span className={styles.dataLabel}>Status</span>
             <span className={styles.dataValue} style={{ color: '#D4AF37' }}>
               {order?.status === 'processing' ? 'PREPARING ORDER' : order?.status?.toUpperCase()}
             </span>
          </div>
          <div className={styles.dataRow}>
             <span className={styles.dataLabel}>Method</span>
             <span className={styles.dataValue}>
               {order?.paymentMethod === 'cod' ? 'CASH ON DELIVERY (COD)' : 'SECURE ONLINE PAYMENT'}
             </span>
          </div>
          <div className={styles.dataRow}>
             <span className={styles.dataLabel}>Total Amount</span>
             <span className={styles.dataValue}>
               {formatPrice(order?.total || 0)}
             </span>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <span className={styles.dataLabel} style={{ display: 'block', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
              Purchased Items
            </span>
            {order?.items.map((item, idx) => (
              <div key={idx} className={styles.itemRow}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemMeta}>Size: {item.size} &nbsp;&bull;&nbsp; Qty: {item.quantity}</div>
                </div>
              </div>
            ))}
          </div>

        </motion.section>
      </div>

      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        <Link href="/shop" style={{ textDecoration: 'none' }}>
          <button className={styles.primaryBtn}>
            Return to Boutique
          </button>
        </Link>
      </motion.div>

    </div>
  );
}
