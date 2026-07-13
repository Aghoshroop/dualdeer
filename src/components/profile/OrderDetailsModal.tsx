"use client";
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, FileText, Download, RotateCcw } from 'lucide-react';
import { Order, addReview, updateOrder } from '@/lib/firebaseUtils';
import { useCurrency } from '@/context/CurrencyContext';
import Link from 'next/link';
import styles from './OrderDetails.module.css';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import OrderTracking from './OrderTracking';

interface OrderDetailsModalProps {
  order: Order;
  user: any;
  onClose: () => void;
}

export default function OrderDetailsModal({ order, user, onClose }: OrderDetailsModalProps) {
  const { renderPrice } = useCurrency();
  const [reviewingProductId, setReviewingProductId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [isReturning, setIsReturning] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const billRef = useRef<HTMLDivElement>(null);

  const submitReview = async (productId: string) => {
    if (!reviewText.trim()) return;
    setIsSubmitting(true);
    try {
      await addReview({
        productId,
        userId: user.uid,
        userName: user.displayName || 'Verified Buyer',
        userAvatar: user.photoURL || '',
        rating,
        text: reviewText,
      });
      alert('Review submitted successfully!');
      setReviewingProductId(null);
      setReviewText('');
      setRating(5);
    } catch (e) {
      console.error(e);
      alert('Failed to submit review');
    }
    setIsSubmitting(false);
  };

  const submitReturn = async () => {
    if (!returnReason) return;
    setIsSubmitting(true);
    try {
      await updateOrder(order.id!, {
        status: 'return_requested',
        returnReason
      });
      alert('Return request submitted.');
      onClose(); // Close modal to reflect new state
    } catch (e) {
      console.error(e);
      alert('Failed to submit return request');
    }
    setIsSubmitting(false);
  };

  const downloadBill = async () => {
    if (!billRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(billRef.current, {
        scale: 2, // for better resolution
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DualDeer_Invoice_${order.id?.substring(0, 8)}.pdf`);
    } catch (e) {
      console.error("Failed to generate PDF", e);
      alert("Failed to download bill");
    }
    setIsDownloading(false);
  };

  const orderDateObj = order.createdAt?.toDate ? order.createdAt.toDate() : new Date((order.createdAt as any) || Date.now());
  const orderDate = orderDateObj.toLocaleDateString();
  const deliveryDateObj = order.updatedAt?.toDate ? order.updatedAt.toDate() : orderDateObj;
  const returnDeadline = new Date(deliveryDateObj.getTime() + 7 * 24 * 60 * 60 * 1000);
  const isReturnEligible = Date.now() <= returnDeadline.getTime();

  return (
    <div className={styles.pageContainer}>
      <motion.div 
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className={`${styles.modalHeader} ${styles.noPrint}`}>
          <div>
            <h3 className={styles.modalTitle}>Order #{order.id?.substring(0, 8).toUpperCase()}</h3>
            <p className={styles.modalSubtitle}>Placed on {orderDate} • Status: <span style={{ textTransform: 'capitalize' }}>{order.status.replace('_', ' ')}</span></p>
          </div>
          <button className={styles.actionBtn} onClick={onClose} style={{ padding: '8px 16px', background: 'rgba(var(--foreground-rgb), 0.05)', border: '1px solid var(--color-border)', borderRadius: '6px' }}>Back to History</button>
        </div>

        <div className={styles.modalBody}>
          <div style={{ marginBottom: '2rem' }}>
            <OrderTracking order={order} />
          </div>

          {/* ITEMS SECTION */}
          <div className={`${styles.section} ${styles.noPrint}`}>
            <h4 className={styles.sectionTitle}>Items</h4>
            <div className={styles.itemList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <Link href={`/product/${item.productId}`} style={{ display: 'block', textDecoration: 'none' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={styles.itemImage} />
                    ) : (
                      <div className={styles.itemImage} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>No Image</div>
                    )}
                  </Link>
                  <div className={styles.itemDetails}>
                    <Link href={`/product/${item.productId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                      <h5 className={styles.itemName} style={{ cursor: 'pointer' }}>{item.name}</h5>
                      <p className={styles.itemMeta}>Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}</p>
                      <div className={styles.itemPrice}>{renderPrice(item.pricePaid)}</div>
                    </Link>
                    
                    {order.status === 'delivered' && (
                      <div className={styles.reviewSection}>
                        {reviewingProductId === item.productId ? (
                          <div className={styles.reviewForm}>
                            <h6 style={{ marginBottom: '0.5rem' }}>Write a Review</h6>
                            <div className={styles.starRating}>
                              {[1,2,3,4,5].map(star => (
                                <button 
                                  key={star} 
                                  className={`${styles.starBtn} ${star <= rating ? styles.active : ''}`}
                                  onClick={() => setRating(star)}
                                >
                                  <Star size={20} fill={star <= rating ? 'currentColor' : 'none'} />
                                </button>
                              ))}
                            </div>
                            <textarea 
                              className={styles.reviewTextarea} 
                              placeholder="Share your experience with this product..."
                              value={reviewText}
                              onChange={(e) => setReviewText(e.target.value)}
                            />
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                              <button className={styles.reviewSubmitBtn} onClick={() => submitReview(item.productId)} disabled={isSubmitting || !reviewText.trim()}>Submit</button>
                              <button className={styles.reviewBtn} onClick={() => setReviewingProductId(null)} style={{ border: 'none' }}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <button className={styles.reviewBtn} onClick={() => setReviewingProductId(item.productId)}>
                            <Star size={16} /> Write Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RETURN SECTION */}
          {order.status === 'delivered' && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              {!isReturnEligible ? (
                <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid #ef4444' }}>
                  <h4 style={{ color: '#ef4444', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> Return Window Closed</h4>
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>The 7-day return window for this order closed on {returnDeadline.toLocaleDateString()}.</p>
                </div>
              ) : !isReturning ? (
                <button className={`${styles.actionBtn} ${styles.returnBtn}`} onClick={() => setIsReturning(true)}>
                  <RotateCcw size={18} /> Request Return (Eligible until {returnDeadline.toLocaleDateString()})
                </button>
              ) : (
                <div className={styles.returnForm}>
                  <h4 style={{ marginBottom: '1rem' }}>Reason for Return</h4>
                  <select className={styles.returnSelect} value={returnReason} onChange={(e) => setReturnReason(e.target.value)}>
                    <option value="">Select a reason...</option>
                    <option value="Item defective or doesn't work">Item defective or doesn't work</option>
                    <option value="Wrong item was sent">Wrong item was sent</option>
                    <option value="Item arrived damaged">Item arrived damaged</option>
                    <option value="Doesn't fit">Doesn't fit</option>
                    <option value="Changed my mind">Changed my mind</option>
                  </select>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className={styles.reviewSubmitBtn} style={{ background: '#f59e0b' }} onClick={submitReturn} disabled={!returnReason || isSubmitting}>Submit Return</button>
                    <button className={styles.reviewBtn} onClick={() => setIsReturning(false)} style={{ border: 'none' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {order.status === 'return_requested' && order.returnReason && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> Return Requested</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}><strong>Reason:</strong> {order.returnReason}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Our team is reviewing your request. We will contact you shortly.</p>
              </div>
            </div>
          )}

          {order.status === 'return_approved' && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              <div style={{ padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '8px', border: '1px solid #8b5cf6' }}>
                <h4 style={{ color: '#8b5cf6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> Return Approved</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Your return request has been approved.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>A pickup agent will be assigned to collect your items soon.</p>
              </div>
            </div>
          )}

          {order.status === 'return_picked_up' && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid #3b82f6' }}>
                <h4 style={{ color: '#3b82f6', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> Return Picked Up</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Your return has been collected by our agent.</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>It is currently on its way back to our facility.</p>
              </div>
            </div>
          )}

          {order.status === 'returned' && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              <div style={{ padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid #10b981' }}>
                <h4 style={{ color: '#10b981', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><RotateCcw size={18} /> Return Completed</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}>Your return has been received and processed successfully.</p>
              </div>
            </div>
          )}

          {order.status === 'cancellation_requested' && order.cancellationReason && (
            <div className={`${styles.section} ${styles.noPrint}`}>
              <div style={{ padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                <h4 style={{ color: '#f59e0b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}><X size={18} /> Cancellation Requested</h4>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text)' }}><strong>Reason:</strong> {order.cancellationReason}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Our team is reviewing your request to cancel.</p>
              </div>
            </div>
          )}

          {/* BILL SECTION */}
          <div className={`${styles.section} ${styles.printSection}`}>
            <h4 className={`${styles.sectionTitle} ${styles.noPrint}`}><FileText size={20} /> Invoice / Bill</h4>
            <div className={styles.billContainer} ref={billRef}>
              <div className={styles.billHeader}>
                <h2>DualDeer</h2>
                <p>Order #{order.id}</p>
                <p>Date: {orderDate}</p>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <strong>Billed To:</strong><br />
                {order.shippingDetails?.name}<br />
                {order.shippingDetails?.address}<br />
                {order.shippingDetails?.city}, {order.shippingDetails?.zip}<br />
                {order.shippingDetails?.email}
              </div>

              <div style={{ borderBottom: '2px solid #ccc', paddingBottom: '0.5rem', marginBottom: '1rem', display: 'flex', fontWeight: 'bold' }}>
                <span style={{ flex: 2 }}>Item</span>
                <span style={{ flex: 1, textAlign: 'center' }}>Qty</span>
                <span style={{ flex: 1, textAlign: 'right' }}>Price</span>
              </div>
              
              {order.items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', marginBottom: '0.5rem' }}>
                  <span style={{ flex: 2 }}>{item.name} {item.size && `(${item.size})`}</span>
                  <span style={{ flex: 1, textAlign: 'center' }}>{item.quantity}</span>
                  <span style={{ flex: 1, textAlign: 'right' }}>{renderPrice(item.pricePaid * item.quantity)}</span>
                </div>
              ))}

              <div className={styles.billTotal}>
                <span>Subtotal</span>
                <span>{renderPrice(order.total + (order.discountAmount || 0))}</span>
              </div>
              
              {order.discountAmount && order.discountAmount > 0 && (
                <div className={styles.billRow} style={{ color: '#10b981', marginTop: '0.5rem' }}>
                  <span>Discount</span>
                  <span>-{renderPrice(order.discountAmount)}</span>
                </div>
              )}

              <div className={styles.billTotal} style={{ borderTop: '2px solid #000', fontSize: '1.4rem' }}>
                <span>Total Paid</span>
                <span>{renderPrice(order.total)}</span>
              </div>
            </div>

            <div className={`${styles.actionsContainer} ${styles.noPrint}`}>
              <button className={`${styles.actionBtn} ${styles.downloadBtn}`} onClick={downloadBill} disabled={isDownloading}>
                <Download size={18} /> {isDownloading ? 'Generating...' : 'Download Bill (PDF)'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
