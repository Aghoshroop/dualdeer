"use client";
import React, { useEffect, useState } from 'react';
import { getAllOrders, updateOrder, deleteOrder, Order } from '@/lib/firebaseUtils';
import { Package, RefreshCw, Send, CheckCircle, PackageSearch, Trash2, Filter } from 'lucide-react';
import styles from './Orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'recent' | 'price_high' | 'price_low' | 'processing' | 'shipped' | 'delivered'>('recent');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const data = await getAllOrders();
    setOrders(data);
    setLoading(false);
  };

  const handleStatusChange = async (orderId: string, newStatus: 'processing' | 'shipped' | 'delivered') => {
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
      case 'delivered': result = result.filter(o => o.status === activeFilter); break;
      case 'recent':
      default: break; // Already sorted latest by firebase utils
    }
    return result;
  };

  const displayedOrders = getFilteredOrders();

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'delivered') return <CheckCircle size={14} color="#00ffcc" />;
    if (status === 'shipped') return <Send size={14} color="#3399ff" />;
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
          <Filter size={16} color="var(--color-primary)" /> <span style={{ fontWeight: 600, color: '#fff', marginRight: '1rem' }}>SORT BY:</span>
          <button onClick={() => setActiveFilter('recent')} className={`${styles.filterBtn} ${activeFilter === 'recent' ? styles.activeF : ''}`}>Most Recent</button>
          <button onClick={() => setActiveFilter('price_high')} className={`${styles.filterBtn} ${activeFilter === 'price_high' ? styles.activeF : ''}`}>Highest Price</button>
          <button onClick={() => setActiveFilter('price_low')} className={`${styles.filterBtn} ${activeFilter === 'price_low' ? styles.activeF : ''}`}>Lowest Price</button>
          <div className={styles.filterDivider}></div>
          <button onClick={() => setActiveFilter('processing')} className={`${styles.filterBtn} ${activeFilter === 'processing' ? styles.activeF : ''}`}>Pending Actions</button>
          <button onClick={() => setActiveFilter('shipped')} className={`${styles.filterBtn} ${activeFilter === 'shipped' ? styles.activeF : ''}`}>Shipped</button>
          <button onClick={() => setActiveFilter('delivered')} className={`${styles.filterBtn} ${activeFilter === 'delivered' ? styles.activeF : ''}`}>Delivered</button>
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
                      {order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleString() : 'N/A'}
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
                           &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{order.shippingDetails.city}, {order.shippingDetails.zip}
                        </div>
                      </div>
                    ) : (
                      <span className={styles.guestMarker}>Anonymous User: {order.userId}</span>
                    )}
                  </td>
                  
                  <td className={styles.manifestCol}>
                    <div className={styles.revenueCol}>Total: ₹{order.total.toFixed(2)}</div>
                    {(order.appliedCoupon || order.discountAmount) && (
                      <div style={{ fontSize: '0.8rem', color: '#ffcc00', marginBottom: '0.5rem', fontWeight: 600, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        {order.appliedCoupon && <span style={{ background: 'rgba(255, 204, 0, 0.2)', padding: '2px 6px', borderRadius: '4px' }}>CODE: {order.appliedCoupon}</span>}
                        {order.discountAmount ? <span>(Saved ₹{order.discountAmount.toFixed(2)})</span> : null}
                      </div>
                    )}
                    <div className={styles.itemList}>
                      {order.items.map((item: any, idx) => (
                        <div key={idx} className={styles.manifestItem}>
                          • {item.quantity}x {item.name} 
                          {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
                          <span className={styles.itemMeta}> (₹{item.pricePaid || item.price})</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  
                  <td>
                    <div className={`${styles.statusBadge} ${styles[order.status]}`}>
                      <StatusIcon status={order.status} /> {order.status.toUpperCase()}
                    </div>
                  </td>
                  
                  <td>
                    <div className={styles.actionBlock}>
                      <select
                        className={styles.actionSelect}
                        value={order.status}
                        disabled={mutatingId === order.id}
                        onChange={(e) => handleStatusChange(order.id as string, e.target.value as any)}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </select>
                      {mutatingId === order.id && <span className={styles.mutatingTag}>Syncing...</span>}
                      
                      <button onClick={() => handleDelete(order.id as string)} className={styles.deleteBtn}>
                        <Trash2 size={14} /> Delete
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
