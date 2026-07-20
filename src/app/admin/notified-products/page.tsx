"use client";
import React, { useState, useEffect } from 'react';
import { getProductNotifications, getProducts, ProductNotification, Product } from '@/lib/firebaseUtils';
import { Bell, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import styles from '../AdminPage.module.css';
import Image from 'next/image';

interface GroupedNotification {
  product: Product;
  notifications: ProductNotification[];
}

export default function NotifiedProductsPage() {
  const [groupedData, setGroupedData] = useState<GroupedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [notifs, products] = await Promise.all([
          getProductNotifications(),
          getProducts()
        ]);

        const grouped = notifs.reduce((acc, notif) => {
          if (!acc[notif.productId]) {
            const productInfo = products.find(p => p.id === notif.productId) || { 
              id: notif.productId, 
              name: 'Deleted / Unknown Product', 
              image: '/placeholder-product.png',
              price: 0,
              stock: 0,
              category: 'Unknown'
            } as Product;
            
            acc[notif.productId] = {
              product: productInfo,
              notifications: []
            };
          }
          acc[notif.productId].notifications.push(notif);
          return acc;
        }, {} as Record<string, GroupedNotification>);

        // Convert to array and sort by number of notifications
        const sortedArray = Object.values(grouped).sort((a, b) => b.notifications.length - a.notifications.length);
        setGroupedData(sortedArray);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}><Bell size={28} /> Notified Products</h1>
        </div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}><Bell size={28} /> Notified Products</h1>
      </div>

      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
        Overview of products that users have requested restock notifications for.
      </p>

      {groupedData.length === 0 ? (
        <div style={{ background: 'var(--color-surface)', padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
          <Bell size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
          <h3>No notifications yet</h3>
          <p style={{ color: 'var(--color-text-muted)' }}>When users request stock alerts, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {groupedData.map((group) => (
            <div key={group.product.id} style={{ background: 'var(--color-surface)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              
              <div 
                style={{ display: 'flex', alignItems: 'center', padding: '1.5rem', cursor: 'pointer', gap: '1.5rem' }}
                onClick={() => setExpandedId(expandedId === group.product.id ? null : (group.product.id || null))}
              >
                <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#111', flexShrink: 0 }}>
                  <img src={group.product.image} alt={group.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{group.product.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                    <span>SKU: {group.product.id?.substring(0, 8).toUpperCase()}</span>
                    <span>Current Stock: {group.product.stock}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>
                      {group.notifications.length}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Requests
                    </div>
                  </div>
                  {expandedId === group.product.id ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                </div>
              </div>

              {expandedId === group.product.id && (
                <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <h4 style={{ margin: '1rem 0', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Users Waiting:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {group.notifications.map((n) => (
                      <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                        <Mail size={16} color="var(--color-text-muted)" />
                        <span style={{ flex: 1, fontFamily: 'monospace' }}>{n.email}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {new Date((n.createdAt as any).toMillis ? (n.createdAt as any).toMillis() : Date.now()).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
