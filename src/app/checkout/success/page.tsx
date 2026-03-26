"use client";
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight, Truck } from 'lucide-react';
import styles from './Success.module.css';

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrderId(searchParams.get('orderId'));
  }, [searchParams]);

  return (
    <div className={styles.container}>
      
      <div className={styles.animationGate}>
        <div className={styles.truckTrack}>
           <Truck size={56} className={styles.drivingTruck} />
        </div>
      </div>

      <div className={styles.iconBox}>
        <CheckCircle size={64} className={styles.icon} />
      </div>
      
      <h1 className={styles.title}>Operation Confirmed</h1>
      <p className={styles.subtitle}>Your premium payload has been successfully dispatched to our fulfillment nexus.</p>
      
      {orderId && (
        <div className={styles.orderIdBox}>
          <Package size={20} />
          <span>Tracking Sequence: <strong>{orderId.toUpperCase()}</strong></span>
        </div>
      )}

      <div className={styles.actions}>
         <Link href="/shop" className={styles.primaryBtn}>Keep Browsing <ArrowRight size={16} /></Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className={styles.page}>
      <Suspense fallback={<div className={styles.container} style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading Confirmation...</div>}>
        <CheckoutSuccessContent />
      </Suspense>
    </div>
  );
}
