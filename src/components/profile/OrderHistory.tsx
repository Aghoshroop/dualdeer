"use client";
import { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, PackageSearch, Package, Trash2 } from 'lucide-react';
import { getUserOrders, updateOrder, deleteOrder, Order } from '@/lib/firebaseUtils';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import styles from './ProfileComponents.module.css';
import { useCurrency } from '@/context/CurrencyContext';
import OrderDetailsModal from './OrderDetailsModal';
import OrderTracking from './OrderTracking';
import { AnimatePresence } from 'framer-motion';

export default function OrderHistory({ user }: { user: any }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { formatPrice, renderPrice } = useCurrency();

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

  const handleDeleteOrder = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this order from your history?")) {
      try {
        await deleteOrder(id);
      } catch (err) {
        console.error("Failed to delete order:", err);
        alert("Failed to delete order.");
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

  if (selectedOrder) {
    return (
      <OrderDetailsModal 
        order={selectedOrder} 
        user={user} 
        onClose={() => setSelectedOrder(null)} 
      />
    );
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}><TrendingUp size={28} color="var(--color-primary)"/> Order Summary</h2>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}><Package size={24} /></div>
          <div>
            <div className={styles.statValue}>{totalItemsOwned}</div>
            <div className={styles.statLabel}>Total Items Purchased</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIconBox} style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}><TrendingUp size={24} /></div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{renderPrice(totalProfit)}</div>
            <div className={styles.statLabel}>Total Savings</div>
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
          {orders.map((order) => {
            const orderDateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date((order.createdAt as any) || Date.now());
            const deliveryDateObj = order.updatedAt?.toDate ? order.updatedAt.toDate() : orderDateObj;
            const returnDeadline = new Date(deliveryDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
            const isReturnEligible = Date.now() <= returnDeadline.getTime();

            return (
            <div 
              key={order.id} 
              className={styles.amzOrderCard} 
            >
              <div className={styles.amzOrderHeader}>
                <div className={styles.amzHeaderLeft}>
                  <div className={styles.amzHeaderBlock}>
                    <span className={styles.amzHeaderLabel}>Order Placed</span>
                    <span className={styles.amzHeaderValue}>
                      {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className={styles.amzHeaderBlock}>
                    <span className={styles.amzHeaderLabel}>Total</span>
                    <span className={styles.amzHeaderValue}>
                      {renderPrice(order.total)}
                      {order.discountAmount && order.discountAmount > 0 ? ` (Saved ${renderPrice(order.discountAmount)})` : ''}
                    </span>
                  </div>
                </div>
                <div className={styles.amzHeaderRight}>
                  <span className={styles.amzHeaderLabel}>Order # {order.id?.substring(0, 12).toUpperCase()}</span>
                  <span className={styles.amzOrderDetailsLink} onClick={() => setSelectedOrder(order)}>
                    View order details
                  </span>
                </div>
              </div>

              <div className={styles.amzOrderBody}>
                <OrderTracking order={order} />

                <div className={styles.amzItemList} style={{ marginTop: '1.5rem' }}>
                  {order.items.map((item, idx) => (
                    <div key={idx} className={styles.amzItem}>
                      {item.image ? (
                        <img src={item.image} alt={item.name} className={styles.amzItemImage} />
                      ) : (
                        <div className={styles.amzItemImagePlaceholder}>No Image</div>
                      )}
                      
                      <div className={styles.amzItemDetails}>
                        <span className={styles.amzItemName} onClick={() => setSelectedOrder(order)}>{item.name}</span>
                        {item.size && <span className={styles.amzItemMeta}>Size: {item.size}</span>}
                        <span className={styles.amzItemMeta}>Qty: {item.quantity}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={styles.amzItemPrice}>{renderPrice(item.pricePaid)}</span>
                          {item.mrp > item.pricePaid && (
                            <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{renderPrice(item.mrp)}</span>
                          )}
                        </div>
                      </div>

                      <div className={styles.amzOrderActions}>
                        {idx === 0 && order.status === 'processing' && cancellingOrderId !== order.id && (
                          <button 
                            className={styles.amzBtn}
                            onClick={(e) => { e.stopPropagation(); setCancellingOrderId(order.id!); }}
                          >
                            Cancel items
                          </button>
                        )}
                        {idx === 0 && cancellingOrderId === order.id && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.5rem' }}>
                            <select 
                              value={cancellationReason}
                              onChange={(e) => setCancellationReason(e.target.value)}
                              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface, var(--color-background))', color: 'var(--color-text)', fontSize: '0.85rem' }}
                            >
                              <option value="">Reason for cancellation</option>
                              <option value="Ordered by mistake">Ordered by mistake</option>
                              <option value="Changed my mind">Changed my mind</option>
                              <option value="Found a cheaper alternative">Found cheaper</option>
                              <option value="Delivery time is too long">Delivery too long</option>
                              <option value="Other">Other</option>
                            </select>
                            <button 
                              className={`${styles.amzBtn} ${styles.amzBtnPrimary}`}
                              onClick={() => submitCancellation(order.id!)}
                              disabled={!cancellationReason}
                              style={{ opacity: cancellationReason ? 1 : 0.5 }}
                            >
                              Confirm cancellation
                            </button>
                            <button 
                              className={styles.amzBtn}
                              onClick={() => { setCancellingOrderId(null); setCancellationReason(''); }}
                            >
                              Go back
                            </button>
                          </div>
                        )}
                        {idx === 0 && order.status === 'delivered' && (
                          <button 
                            className={styles.amzBtn} 
                            onClick={() => setSelectedOrder(order)}
                            disabled={!isReturnEligible}
                            style={!isReturnEligible ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                          >
                            {isReturnEligible ? 'Return items' : 'Return window closed'}
                          </button>
                        )}
                        <button className={styles.amzBtn} onClick={() => setSelectedOrder(order)}>
                          Write a product review
                        </button>
                        {idx === 0 && cancellingOrderId !== order.id && (
                          <button
                            className={`${styles.amzBtn} ${styles.amzBtnDanger}`}
                            onClick={(e) => handleDeleteOrder(order.id!, e)}
                            style={{ marginTop: 'auto', border: 'none', background: 'transparent', boxShadow: 'none', textAlign: 'left', padding: '0.5rem 0' }}
                          >
                            <Trash2 size={16} style={{ verticalAlign: 'text-bottom', marginRight: '4px' }}/> Delete from history
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )})}
        </div>
      )}
    </div>
  );
}
