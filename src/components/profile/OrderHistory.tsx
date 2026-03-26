"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, PackageSearch, Package, Trash2 } from 'lucide-react';
import { getUserOrders, deleteOrder, Order } from '@/lib/firebaseUtils';
import styles from './ProfileComponents.module.css';

export default function OrderHistory({ user }: { user: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.uid) return;
      try {
        const userOrders = await getUserOrders(user.uid);
        // Sort newest first
        const sorted = userOrders.sort((a, b) => {
          const timeA = a.createdAt?.toMillis() || 0;
          const timeB = b.createdAt?.toMillis() || 0;
          return timeB - timeA;
        });
        setOrders(sorted);
      } catch (e) {
        console.error("Error fetching orders:", e);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [user]);

  const handleDeleteOrder = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this order record? This cannot be undone.")) {
      try {
        await deleteOrder(id);
        setOrders(orders.filter(o => o.id !== id));
      } catch (e) {
        console.error("Deletion failed:", e);
        alert("Failed to delete order. Please ensure you updated your Firebase Rules to allow Self-Deletion.");
      }
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
            <div className={styles.statValue}>₹{totalProfit.toFixed(2)}</div>
            <div className={styles.statLabel}>Total Value Retained</div>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle} style={{ marginTop: '4rem' }}><ShoppingBag size={28} color="var(--color-primary)"/> Order History</h2>
      
      {orders.length === 0 ? (
        <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
          <PackageSearch size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--color-text-muted)' }}>You have not made any purchases yet.</p>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderItem}>
              <div className={styles.orderInfo}>
                <h4>Order #{order.id?.substring(0, 8).toUpperCase()}</h4>
                <p>Status: <span style={{ textTransform: 'capitalize', color: order.status === 'delivered' ? '#10b981' : 'var(--color-primary)' }}>{order.status}</span> • {order.items.length} Items</p>
                {/* Embedded Items List */}
                <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--color-text)' }}>
                        {item.quantity}x {item.name}
                        {item.size && <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 700 }}>Size: {item.size}</span>}
                      </span>
                      <div className={styles.itemPrices}>
                        {item.mrp > item.pricePaid && <span className={styles.mrp}>₹{item.mrp.toFixed(2)}</span>}
                        <span className={styles.paid}>₹{item.pricePaid.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹{order.total.toFixed(2)}</div>
                {order.discountAmount && order.discountAmount > 0 && (
                  <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem' }}>Saved ₹{order.discountAmount.toFixed(2)} with coupon</p>
                )}
                <button 
                  onClick={() => handleDeleteOrder(order.id!)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600, opacity: 0.8 }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
