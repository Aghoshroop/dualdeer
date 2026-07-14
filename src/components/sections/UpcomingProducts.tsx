"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUpcomingProducts, subscribeToProductNotification, UpcomingProduct } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { Bell } from "lucide-react";
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './UpcomingProducts.module.css';

export default function UpcomingProducts() {
  const [products, setProducts] = useState<UpcomingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [notifiedStatus, setNotifiedStatus] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // 1. Listen for Auth State
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    // 2. Fetch active upcoming products
    getUpcomingProducts().then(prods => {
      setProducts(prods);
      setLoading(false);
    }).catch(err => {
      console.error('Error fetching upcoming products', err);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleNotifyMe = async (productId: string) => {
    if (!currentUser) {
      alert('Please log in or sign up to receive notifications.');
      return;
    }

    setIsSubmitting(prev => ({ ...prev, [productId]: true }));

    try {
      const res = await subscribeToProductNotification(productId, currentUser.uid, currentUser.email);
      if (res.success || res.message === 'Already subscribed') {
        setNotifiedStatus(prev => ({ ...prev, [productId]: true }));
      } else {
        alert(res.message);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to subscribe to notifications.');
    } finally {
      setIsSubmitting(prev => ({ ...prev, [productId]: false }));
    }
  };

  // Rule: Hide section if 0 items
  if (!loading && products.length === 0) {
    return null;
  }

  const renderCard = (product: UpcomingProduct) => {
    const isNotified = notifiedStatus[product.id!];
    const isLoading = isSubmitting[product.id!];

    return (
      <div key={product.id} className={styles.card}>
        <div className={styles.imageWrapper}>
          <div className={styles.badges}>
            <span className={`${styles.badge} ${styles.categoryBadge}`}>{product.category}</span>
            <span className={styles.badge}>Coming Soon</span>
          </div>
          <img src={product.image} alt={product.name} className={styles.image} loading="lazy" />
        </div>
        <div className={styles.content}>
          <div className={styles.launchDate}>{product.launchDate || 'To Be Announced'}</div>
          <h3 className={styles.productName}>{product.name}</h3>
          <p className={styles.description}>{product.description}</p>
          <button 
            className={`${styles.notifyBtn} ${isNotified ? styles.notified : ''}`}
            onClick={() => handleNotifyMe(product.id!)}
            disabled={isNotified || isLoading}
          >
            {isLoading ? 'Registering...' : isNotified ? '✓ Notified' : 'Notify Me'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Upcoming Products</h2>
        <p className={styles.subtitle}>Be the first to know when our next innovation drops.</p>
      </div>

      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      ) : products.length === 1 ? (
        <div className={styles.heroLayout}>
          <div className={styles.heroCard}>
            {renderCard(products[0])}
          </div>
        </div>
      ) : products.length <= 4 ? (
        <div className={styles.gridLayout}>
          {products.map(renderCard)}
        </div>
      ) : (
        <div className={styles.carouselLayout}>
          {products.map(renderCard)}
        </div>
      )}
    </section>
  );
}
