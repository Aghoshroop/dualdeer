"use client";
import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrder, deleteOrder, Order } from '@/lib/firebaseUtils';
import { Package, RefreshCw, Send, CheckCircle, PackageSearch, Trash2, Filter } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';
import styles from './Orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'recent' | 'price_high' | 'price_low' | 'processing' | 'shipped' | 'delivered' | 'cancellation_requested' | 'cancelled' | 'return_requested' | 'return_approved' | 'return_picked_up' | 'returned'>('recent');
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: 'processing' | 'shipped' | 'delivered' | 'cancellation_requested' | 'cancelled' | 'return_requested' | 'return_approved' | 'return_picked_up' | 'returned') => {
    setMutatingId(orderId);
    try {
      await updateOrder(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (e) {
      console.error("Status mutation failed:", e);
      alert("Failed to update status in Firebase.");
    }
    setMutatingId(null);
  };

  const handleDelete = async (orderId: string) => {
    if (confirm("DANGER: Are you sure you want to permanently erase this order from the primary database?")) {
      try {
        await deleteOrder(orderId);
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } catch (e) {
        console.error("Deletion failed:", e);
        alert("Failed to erase record. Verify your Master Authority status.");
      }
    }
  };

  const getFilteredOrders = () => {
    let result = [...orders];
    switch (activeFilter) {
      case 'price_high': result.sort((a, b) => b.total - a.total); break;
      case 'price_low': result.sort((a, b) => a.total - b.total); break;
      case 'processing':
      case 'shipped':
      case 'delivered': 
      case 'cancellation_requested':
      case 'cancelled':
      case 'return_requested':
      case 'return_approved':
      case 'return_picked_up':
      case 'returned': result = result.filter(o => o.status === activeFilter); break;
      case 'recent':
      default: break; // Already sorted latest by firebase utils
    }
    return result;
  };

  const displayedOrders = getFilteredOrders();

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'delivered') return <CheckCircle size={14} color="#00ffcc" />;
    if (status === 'shipped') return <Send size={14} color="#3399ff" />;
    if (status === 'cancellation_requested') return <RefreshCw size={14} color="#f59e0b" />;
    if (status === 'return_requested') return <RefreshCw size={14} color="#ec4899" />;
    if (status === 'return_approved') return <Package size={14} color="#8b5cf6" />;
    if (status === 'return_picked_up') return <Send size={14} color="#8b5cf6" style={{ transform: 'scaleX(-1)' }} />;
    if (status === 'cancelled') return <Trash2 size={14} color="#ef4444" />;
    if (status === 'returned') return <CheckCircle size={14} color="#8b5cf6" />;
    return <RefreshCw size={14} color="#ffcc00" className={styles.spin} />;
  };

  if (loading) return <div className={styles.loading}>Decrypting Operational Logs...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}><Package size={24} style={{ marginRight: '10px' }} /> Orders Command Center</h1>
          <p className={styles.subtitle}>Execute fulfillment actions and oversee inbound transaction traffic natively.</p>
        </div>
        <button onClick={fetchOrders} className={styles.refreshBtn}>
          <RefreshCw size={16} /> Sync Logs
        </button>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <Filter size={16} color="var(--color-primary)" /> <span style={{ fontWeight: 600, color: 'var(--color-text)', marginRight: '1rem' }}>SORT BY:</span>
          <button onClick={() => setActiveFilter('recent')} className={`${styles.filterBtn} ${activeFilter === 'recent' ? styles.activeF : ''}`}>Most Recent</button>
          <button onClick={() => setActiveFilter('price_high')} className={`${styles.filterBtn} ${activeFilter === 'price_high' ? styles.activeF : ''}`}>Highest Price</button>
          <button onClick={() => setActiveFilter('price_low')} className={`${styles.filterBtn} ${activeFilter === 'price_low' ? styles.activeF : ''}`}>Lowest Price</button>
          <div className={styles.filterDivider}></div>
          <button onClick={() => setActiveFilter('processing')} className={`${styles.filterBtn} ${activeFilter === 'processing' ? styles.activeF : ''}`}>Pending Actions</button>
          <button onClick={() => setActiveFilter('shipped')} className={`${styles.filterBtn} ${activeFilter === 'shipped' ? styles.activeF : ''}`}>Shipped</button>
          <button onClick={() => setActiveFilter('delivered')} className={`${styles.filterBtn} ${activeFilter === 'delivered' ? styles.activeF : ''}`}>Delivered</button>
          <button onClick={() => setActiveFilter('return_requested')} className={`${styles.filterBtn} ${activeFilter === 'return_requested' ? styles.activeF : ''}`} style={{ color: activeFilter === 'return_requested' ? '#ec4899' : 'inherit' }}>Return Requests</button>
          <button onClick={() => setActiveFilter('returned')} className={`${styles.filterBtn} ${activeFilter === 'returned' ? styles.activeF : ''}`}>Returned</button>
          <button onClick={() => setActiveFilter('cancellation_requested')} className={`${styles.filterBtn} ${activeFilter === 'cancellation_requested' ? styles.activeF : ''}`} style={{ color: activeFilter === 'cancellation_requested' ? '#f59e0b' : 'inherit' }}>Cancel Requests</button>
          <button onClick={() => setActiveFilter('cancelled')} className={`${styles.filterBtn} ${activeFilter === 'cancelled' ? styles.activeF : ''}`}>Cancelled</button>
        </div>
      </div>

      {displayedOrders.length === 0 ? (
        <div className={styles.emptyState}>
          <PackageSearch size={48} className={styles.emptyIcon} />
          <h2>No Intelligence Reports</h2>
          <p>No transactions match the current filtering parameters.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trace ID / Time</th>
                <th>Shipping & Client Data</th>
                <th>Order Manifest</th>
                <th>Current Phase</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedOrders.map(order => (
                <tr key={order.id}>
                  <td>
                    <div className={styles.traceCode}>{order.id}</div>
                    <div className={styles.timeLabel}>
                      {order.createdAt ? new Date((order.createdAt as any).toMillis ? (order.createdAt as any).toMillis() : typeof order.createdAt === 'number' ? order.createdAt : Date.now()).toLocaleString() : 'N/A'}
                    </div>
                  </td>
                  
                  <td>
                    {order.shippingDetails ? (
                      <div className={styles.clientInfo}>
                        <span className={styles.clientName}>{order.shippingDetails.name}</span>
                        <span className={styles.clientContact}>📧 {order.shippingDetails.email}</span>
                        <span className={styles.clientContact}>📞 {order.shippingDetails.phone}</span>
                        <div className={styles.addressBlock}>
                           📍 {order.shippingDetails.address}<br/>
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{order.shippingDetails.city}, {order.shippingDetails.zip}<br/>
                           {order.shippingDetails.country && <>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<strong>Country: {order.shippingDetails.country}</strong></>}
                        </div>
                      </div>
                    ) : (
                      <span className={styles.guestMarker}>Anonymous User: {order.userId}</span>
                    )}
                  </td>
                  
                  <td className={styles.manifestCol}>
                    <div className={styles.revenueCol}>Total: {order.currency === 'USD' ? `$${order.total.toFixed(2)}` : `₹${order.total.toFixed(2)}`}</div>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>
                      Currency: {order.currency || 'INR'} {order.exchangeRate ? `(Rate: ${order.exchangeRate})` : ''}
                    </div>
                    {order.stripeInvoiceId && (
                      <div style={{ fontSize: '0.75rem', background: '#e0e7ff', color: '#4338ca', padding: '4px 8px', borderRadius: '4px', marginBottom: '0.5rem', display: 'inline-block' }}>
                        Stripe Invoice: {order.stripeInvoiceId} | Status: {order.stripeStatus || 'pending'}
                      </div>
                    )}
                    {(order.appliedCoupon || order.discountAmount) && (
                      <div style={{ fontSize: '0.8rem', color: '#ffcc00', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {order.appliedCoupon && <span style={{ background: 'rgba(255, 204, 0, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>CODE: {order.appliedCoupon}</span>}
                        {order.discountAmount ? <span>(Saved {order.currency === 'USD' ? `$${order.discountAmount.toFixed(2)}` : `₹${order.discountAmount.toFixed(2)}`})</span> : null}
                      </div>
                    )}
                    <div className={styles.itemList}>
                      {order.items.map((item: any, idx) => (
                        <div key={idx} className={styles.manifestItem}>
                          • {item.quantity}x {item.name} 
                          {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
                          <span className={styles.itemMeta}> ({order.currency === 'USD' ? `$${(item.pricePaid || item.price).toFixed(2)}` : `₹${(item.pricePaid || item.price).toFixed(2)}`})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td>
                    <div className={`${styles.statusBadge} ${styles[order.status]}`} style={order.status === 'cancellation_requested' ? { background: 'rgba(245,158,11,0.2)', color: '#f59e0b', borderColor: '#f59e0b' } : order.status === 'return_requested' ? { background: 'rgba(236,72,153,0.2)', color: '#ec4899', borderColor: '#ec4899' } : order.status === 'cancelled' ? { background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderColor: '#ef4444' } : (order.status === 'returned' || order.status === 'return_approved' || order.status === 'return_picked_up') ? { background: 'rgba(139,92,246,0.2)', color: '#8b5cf6', borderColor: '#8b5cf6' } : {}}>
                      <StatusIcon status={order.status} /> {order.status.replace('_', ' ').toUpperCase()}
                    </div>
                    {order.cancellationReason && (
                      <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: 'rgba(245, 158, 11, 0.1)', borderLeft: '3px solid #f59e0b', borderRadius: '4px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', marginBottom: '2px' }}>Reason:</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>{order.cancellationReason}</span>
                      </div>
                    )}
                    {order.returnReason && (
                      <div style={{ marginTop: '0.8rem', padding: '0.5rem', background: 'rgba(236, 72, 153, 0.1)', borderLeft: '3px solid #ec4899', borderRadius: '4px' }}>
                        <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: '#ec4899', textTransform: 'uppercase', marginBottom: '2px' }}>Return Reason:</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text)' }}>{order.returnReason}</span>
                      </div>
                    )}
                  </td>
                  
                  <td>
                    <div className={styles.actionBlock}>
                      <select
                        className={styles.actionSelect}
                        value={order.status}
                        disabled={mutatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id as string, e.target.value as any)}
                        style={{ marginBottom: '8px' }}
                      >
                        <option value="payment_pending">Payment Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="return_requested">Return Requested</option>
                        <option value="return_approved">Return Approved</option>
                        <option value="return_picked_up">Return Picked Up</option>
                        <option value="returned">Returned</option>
                        <option value="cancellation_requested">Cancel Requested</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      {mutatingId === order.id && <span className={styles.mutatingTag}>Syncing...</span>}
                      
                      {order.status === 'cancellation_requested' && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: 'column' }}>
                          <button onClick={() => handleStatusChange(order.id as string, 'cancelled')} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Approve Cancel</button>
                          <button onClick={() => handleStatusChange(order.id as string, 'processing')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Reject Cancel</button>
                        </div>
                      )}

                      {order.status === 'return_requested' && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: 'column' }}>
                          <button onClick={() => handleStatusChange(order.id as string, 'return_approved')} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Approve Return</button>
                          <button onClick={() => handleStatusChange(order.id as string, 'delivered')} style={{ background: '#3b82f6', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Reject Return</button>
                        </div>
                      )}

                      {order.status === 'return_approved' && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: 'column' }}>
                          <button onClick={() => handleStatusChange(order.id as string, 'return_picked_up')} style={{ background: '#8b5cf6', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Mark as Picked Up</button>
                        </div>
                      )}

                      {order.status === 'return_picked_up' && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', flexDirection: 'column' }}>
                          <button onClick={() => handleStatusChange(order.id as string, 'returned')} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Mark as Returned (Completed)</button>
                        </div>
                      )}

                      <button onClick={() => handleDelete(order.id as string)} className={styles.deleteBtn}>
                        <Trash2 size={14} /> Hard Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
