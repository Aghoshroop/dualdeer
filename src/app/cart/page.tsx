"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Lock, ArrowRight, ShieldCheck, ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './CartPage.module.css';
import { validateCoupon, getProducts, Product } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useCart } from '@/context/CartContext';
import QuantitySelector from '@/components/ui/QuantitySelector';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, cartTotal: subtotal, addToCart, bundleSavings } = useCart();
  const { formatPrice, countryCode, conversionRate, renderPrice } = useCurrency();
  const [mounted, setMounted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        sessionStorage.setItem('dualdeer_return_url', '/cart');
        router.push('/auth');
      } else {
        setCurrentUser(user);
      }
    });
    
    // Fetch top 2 products for empty state recommendations
    getProducts().then(prods => {
      setRecommendedProducts(prods.slice(0, 2));
    });

    return () => unsubscribe();
  }, []);

  const discountedSubtotal = Math.max(0, subtotal - bundleSavings - discount);
  const isIndia = countryCode === "IN";
  const estimatedGstRate = isIndia ? 0.12 : 0; // 12% GST for India
  const estimatedGst = discountedSubtotal * estimatedGstRate;
  const taxRate = 0; // Cut GST on total
  const tax = discountedSubtotal * taxRate;
  const shipping = isIndia ? 0 : (20 * conversionRate); // Flat $20 equivalent for International
  const total = discountedSubtotal + tax + shipping;

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    setDiscount(0);
    
    if (!couponCode.trim()) return;
    
    setIsApplying(true);
    try {
      const coupon = await validateCoupon(couponCode, currentUser?.uid);
      if (!coupon) {
        setCouponError('Invalid or inactive coupon code');
      } else {
        const discountAmount = coupon.discountType === 'percentage' 
          ? subtotal * (coupon.discountValue / 100) 
          : coupon.discountValue;
          
        setDiscount(discountAmount);
        setCouponSuccess(`Coupon applied: ${coupon.discountType === 'percentage' ? coupon.discountValue + '%' : formatPrice(coupon.discountValue)} OFF`);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Error applying coupon');
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
        <motion.div 
          className={styles.emptyCartCinematic}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className={styles.emptyCartHero}>
            <div className={styles.glowAura}></div>
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 1, type: "spring" }}
            >
              <ShoppingBag size={80} strokeWidth={0.5} className={styles.emptyBagIcon} />
            </motion.div>
            <h2 className={styles.emptyCartTitle}>THE ARCHIVE IS EMPTY</h2>
            <p className={styles.emptyCartSubtitle}>Your curated collection awaits. Add pieces to unlock your signature style.</p>
            <Link href="/shop" className={styles.shopBtnCinematic}>
              ENTER COLLECTION <ArrowRight size={16} />
            </Link>
          </div>

          {recommendedProducts.length > 0 && (
            <div className={styles.quickAddSection}>
              <h3 className={styles.quickAddTitle}>Curated For You</h3>
              <div className={styles.quickAddGrid}>
                {recommendedProducts.map((prod, i) => (
                  <motion.div 
                    key={prod.id} 
                    className={styles.quickAddCard}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.2), duration: 0.8 }}
                  >
                    <div className={styles.quickAddImageWrap} onClick={() => router.push(`/product/${prod.slug}`)}>
                      <img src={prod.image} alt={prod.name} />
                      <div className={styles.quickAddOverlay}>
                        <span>View Details</span>
                      </div>
                    </div>
                    <div className={styles.quickAddInfo}>
                      <div className={styles.quickAddText}>
                        <h4 className={styles.quickAddName}>{prod.name}</h4>
                        <span className={styles.quickAddPrice}>{renderPrice(prod.price)}</span>
                      </div>
                      <button 
                        className={styles.quickAddBtn}
                        onClick={() => addToCart({ id: prod.id as string, name: prod.name, price: prod.price, mrp: prod.mrp, image: prod.image, size: 'M', quantity: 1 })}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
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
                      <p className={styles.itemPrice}>{renderPrice(item.price)}</p>
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
                <span>{renderPrice(subtotal)}</span>
              </div>
              {bundleSavings > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`} style={{ color: 'var(--color-primary)' }}>
                  <span>Duo Pack Savings</span>
                  <span>-{renderPrice(bundleSavings)}</span>
                </div>
              )}
              {discount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                  <span>Discount</span>
                  <span>-{renderPrice(discount)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>{isIndia ? 'Estimated GST (12%)' : 'Taxes (International)'}</span>
                <span>{renderPrice(estimatedGst)}</span>
              </div>
              {estimatedGst > 0 && (
                <div className={`${styles.summaryRow} ${styles.discountRow}`} style={{ color: 'var(--color-primary)' }}>
                  <span>GST Waived</span>
                  <span>-{renderPrice(estimatedGst)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>{isIndia ? 'Free' : formatPrice(shipping)}</span>
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
                    style={{ padding: '0.6rem 1rem', background: 'var(--color-primary)', color: 'var(--color-text)', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    {isApplying ? '...' : 'Apply'}
                  </button>
                </div>
                {couponError && <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{couponError}</p>}
                {couponSuccess && <p style={{ color: '#10b981', fontSize: '0.85rem' }}>{couponSuccess}</p>}
              </div>
              
              <div className={styles.totalRow}>
                <span>Total</span>
                <span>{renderPrice(total)}</span>
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
