"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import styles from './CartPage.module.css';
import { validateCoupon } from '@/lib/firebaseUtils';
import { useCart } from '@/context/CartContext';
import QuantitySelector from '@/components/ui/QuantitySelector';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const subtotal = cartTotal;
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.08; // 8% tax
  const total = discountedSubtotal + tax;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    setDiscount(0);
    
    if (!couponCode.trim()) return;
    
    setIsApplying(true);
    try {
      const coupon = await validateCoupon(couponCode);
      if (!coupon) {
        setCouponError('Invalid or inactive coupon code');
      } else {
        const discountAmount = coupon.discountType === 'percentage' 
          ? subtotal * (coupon.discountValue / 100) 
          : coupon.discountValue;
          
        setDiscount(discountAmount);
        setCouponSuccess(`Coupon applied: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : '₹' + coupon.discountValue} OFF`);
      }
    } catch (err) {
      setCouponError('Error applying coupon');
    }
    setIsApplying(false);
  };

  // Prevent hydration mismatch by returning null or a skeleton until mounted
  if (!mounted) return null;

  return (
    <div className={styles.cartContainer}>
      <div className={styles.header}>
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Shopping Bag
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Enjoy complimentary signature packaging and global shipping on all orders.
        </motion.p>
      </div>

      {cart.length === 0 ? (
        <div className={styles.emptyCart}>
          <p>Your bag is currently empty.</p>
          <Link href="/" className={styles.shopBtn}>CONTINUE SHOPPING</Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          {/* Items List */}
          <div className={styles.itemsSection}>
            <AnimatePresence>
              {cart.map((item, index) => (
                <motion.div 
                  key={`${item.id}-${item.size}-${index}`}
                  className={styles.cartItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={styles.itemImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className={styles.itemDetails}>
                    <div className={styles.itemTop}>
                      <div>
                        <h3>{item.name}</h3>
                        <p className={styles.itemMeta}>{item.color ? `Color: ${item.color} | ` : ''}Size: {item.size}</p>
                      </div>
                      <p className={styles.itemPrice}>₹{item.price.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                    </div>

                    <div className={styles.itemBottom}>
                      <QuantitySelector
                        value={item.quantity}
                        min={1}
                        max={10}
                        onChange={(newQty) => {
                          const delta = newQty - item.quantity;
                          updateQuantity(item.id, item.size, delta);
                        }}
                      />
                      <button className={styles.removeBtn} onClick={() => removeFromCart(item.id, item.size)}>
                        <Trash2 size={16} strokeWidth={1.5} /> Remove
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Sticky Order Summary */}
          <div className={styles.summarySection}>
            <motion.div 
              className={styles.summaryCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h2>Order Summary</h2>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              {discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>-₹{discount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Estimated Tax (10%)</span>
                <span>₹{tax.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>Complimentary</span>
              </div>
              
              <div className={styles.couponSection}>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', marginBottom: '0.5rem' }}>
                  <input 
                    type="text" 
                    placeholder="Promo Code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{ flex: 1, padding: '0.6rem', border: '1px solid var(--color-border)', borderRadius: '6px', background: 'transparent', color: 'var(--color-text)' }}
                  />
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={isApplying || !couponCode}
                    style={{ padding: '0.6rem 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem' }}>{couponSuccess}</p>}
              </div>
              
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>${total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
              </div>

              <Link href="/checkout" className={styles.checkoutBtn} style={{ textDecoration: 'none', display: 'flex' }}>
                <Lock size={16} />
                SECURE CHECKOUT
                <ArrowRight size={16} className={styles.arrow} />
              </Link>

              <div className={styles.trustBadges}>
                <p><ShieldCheck size={16} /> Client Protection Guaranteed</p>
                <p>Returns accepted within 30 days of delivery.</p>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
}
