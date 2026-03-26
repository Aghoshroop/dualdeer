"use client";
import { useState, useEffect } from 'react';
import styles from './AdminPage.module.css';
import { getProducts, getCategories, getCoupons, getUsers } from '@/lib/firebaseUtils';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    coupons: 0,
    users: 0,
    revenue: 12450 // Keeping this static as we don't have an orders collection yet
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [products, categories, coupons, users] = await Promise.all([
          getProducts(),
          getCategories(),
          getCoupons(),
          getUsers()
        ]);
        
        setStats({
          products: products.length,
          categories: categories.length,
          coupons: coupons.filter(c => c.active).length,
          users: users.length,
          revenue: 12450
        });
      } catch (e) {
        console.error("Error loading stats:", e);
      }
      setLoading(false);
    };

    loadStats();
  }, []);

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <div className={styles.adminProfile}>Admin User</div>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Verified Users</h3>
          <p className={styles.value}>{loading ? '...' : stats.users}</p>
          <span className={styles.trend}>Live from DB</span>
        </div>
        <div className={styles.statCard}>
          <h3>Total Revenue</h3>
          <p className={styles.value}>${stats.revenue.toLocaleString()}</p>
          <span className={styles.trendNeutral}>Calculated statically</span>
        </div>
        <div className={styles.statCard}>
          <h3>Total Products</h3>
          <p className={styles.value}>{loading ? '...' : stats.products}</p>
          <span className={styles.trend}>Live from DB</span>
        </div>
        <div className={styles.statCard}>
          <h3>Total Categories</h3>
          <p className={styles.value}>{loading ? '...' : stats.categories}</p>
          <span className={styles.trendNeutral}>Live from DB</span>
        </div>
        <div className={styles.statCard}>
          <h3>Active Coupons</h3>
          <p className={styles.value}>{loading ? '...' : stats.coupons}</p>
          <span className={styles.trend}>Live from DB</span>
        </div>
      </div>

      <div className={styles.recentOrders}>
        <h2>Recent Operations info</h2>
        <p style={{ color: 'var(--color-text-muted)' }}>
          To ensure optimal performance, operations reflect real-time syncing with your Firestore collections. 
          Use the side navigation to manage Products, Categories, Banners, and Coupons.
        </p>
      </div>
    </div>
  );
}
