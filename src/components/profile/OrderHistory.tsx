"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, PackageSearch, Package, Trash2 } from 'lucide-react';
import { getUserOrders, updateOrder, Order } from '@/lib/firebaseUtils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from './ProfileComponents.module.css';
import { useCurrency } from '@/context/CurrencyContext';

export default function OrderHistory({ user }: { user: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const q = query(collection(db, 'orders'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      // Sort newest first
      const sorted = userOrders.sort((a, b) => {
        const timeA = a.createdAt && (a.createdAt as any).toMillis ? (a.createdAt as any).toMillis() : typeof a.createdAt === 'number' ? a.createdAt : 0;
        const timeB = b.createdAt && (b.createdAt as any).toMillis ? (b.createdAt as any).toMillis() : typeof b.createdAt === 'number' ? b.createdAt : 0;
        return timeB - timeA;
      });
      setOrders(sorted);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const submitCancellation = async (id: string) => {
    if (!cancellationReason) {
      alert("Please select a reason for cancellation.");
      return;
    }
    try {
      await updateOrder(id, { 
        status: 'cancellation_requested',
        cancellationReason: cancellationReason 
      });
      setCancellingOrderId(null);
      setCancellationReason('');
    } catch (e) {
      console.error("Cancellation request failed:", e);
      alert("Failed to request cancellation.");
    }
  };

  // Analytics Engine
  let totalItemsOwned = 0;
  let totalProfit = 0;

  orders.forEach(order => {
    if (order.status === 'delivered') {
      order.items.forEach(item => {
        totalItemsOwned += item.quantity;
        if (item.mrp && item.pricePaid && item.mrp > item.pricePaid) {
          totalProfit += (item.mrp - item.pricePaid) * item.quantity;
        }
      });
      // Factor in global coupon savings if applicable
      if ((order as any).discountAmount) {
        totalProfit += (order as any).discountAmount;
      }
    }
  });

  if (loading) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}><TrendingUp size={28} color="var(--color-primary)"/> Your Analytics</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}><Package size={24} /></div>
          <div>
            <div className={styles.statValue}>{totalItemsOwned}</div>
            <div className={styles.statLabel}>DualDeer Products Owned</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><TrendingUp size={24} /></div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{formatPrice(totalProfit)}</div>
            <div className={styles.statLabel}>Total Value Retained</div>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle} style={{ marginTop: '4rem' }}><ShoppingBag size={28} color="var(--color-primary)"/> Order History</h2>
      
      {orders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(var(--foreground-rgb), 0.02)', borderRadius: '12px' }}>
          <PackageSearch size={48} color="rgba(var(--foreground-rgb), 0.1)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>You have not made any purchases yet.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderItem}>
              <div className={styles.orderInfo}>
                <h4>Order #{order.id?.substring(0, 8).toUpperCase()}</h4>
                <p>Status: <span style={{ textTransform: 'capitalize', color: order.status === 'delivered' ? '#10b981' : order.status === 'cancelled' ? '#ef4444' : order.status === 'cancellation_requested' ? '#f59e0b' : 'var(--color-primary)' }}>{order.status.replace('_', ' ')}</span> • {order.items.length} Items</p>
                {/* Embedded Items List */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(var(--foreground-rgb), 0.05)', paddingTop: '1rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.8rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-text)', flex: '1 1 auto', wordBreak: 'break-word', minWidth: '120px' }}>
                        {item.quantity}x {item.name}
                        {item.size && <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(var(--foreground-rgb), 0.05)', borderRadius: '4px', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 }}>Size: {item.size}</span>}
                      </span>
                      <div className={styles.itemPrices}>
                        {item.mrp > item.pricePaid && <span className={styles.mrp}>{formatPrice(item.mrp)}</span>}
                        <span className={styles.paid}>{formatPrice(item.pricePaid)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>{formatPrice(order.total)}</div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>Saved {formatPrice(order.discountAmount)} with coupon</p>
                )}
                {order.status === 'processing' && cancellingOrderId !== order.id && (
                  <button 
                    onClick={() => setCancellingOrderId(order.id!)}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.8 }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                  >
                    Request Cancel
                  </button>
                )}
                {cancellingOrderId === order.id && (
                  <div style={{ marginTop: '1rem', background: 'rgba(var(--foreground-rgb), 0.03)', padding: '1rem', borderRadius: '8px', width: '250px', textAlign: 'left' }}>
                    <h5 style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text)' }}>Reason for Cancellation:</h5>
                    <select 
                      value={cancellationReason}
                      onChange={(e) => setCancellationReason(e.target.value)}
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-background)', color: 'var(--color-text)', marginBottom: '1rem' }}
                    >
                      <option value="">Select a reason...</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Found a cheaper alternative">Found a cheaper alternative</option>
                      <option value="Delivery time is too long">Delivery time is too long</option>
                      <option value="Other">Other</option>
                    </select>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => { setCancellingOrderId(null); setCancellationReason(''); }}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Back
                      </button>
                      <button 
                        onClick={() => submitCancellation(order.id!)}
                        disabled={!cancellationReason}
                        style={{ padding: '6px 12px', borderRadius: '4px', border: 'none', background: '#ef4444', color: '#fff', cursor: cancellationReason ? 'pointer' : 'not-allowed', fontSize: '0.8rem', opacity: cancellationReason ? 1 : 0.5 }}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                )}
                {order.status === 'cancellation_requested' && (
                  <span style={{ color: '#f59e0b', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Cancellation Pending</span>
                )}
                {order.status === 'cancelled' && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Cancelled</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
