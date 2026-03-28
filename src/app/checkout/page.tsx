"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createOrder, getProduct, validateCoupon, updateCoupon, Coupon } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { Lock, ChevronLeft, CreditCard, Wallet, Banknote, ShieldAlert } from 'lucide-react';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', color: '#fff', textAlign: 'center' }}>Loading Secure Gateway...</div>}>
      <CheckoutEngine />
    </Suspense>
  );
}

function CheckoutEngine() {
  const { cart, cartTotal: _globalSubtotal, clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
        // Optionally auto-fill email/name if empty
        setFormData(prev => ({
          ...prev,
          email: prev.email || user.email || '',
          name: prev.name || user.displayName || ''
        }));
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const buyNowId = searchParams.get('buyNow');
  const buyNowSize = searchParams.get('size') || 'M';
  const buyNowQty = Number(searchParams.get('qty')) || 1;

  const [buyNowItem, setBuyNowItem] = useState<any>(null);
  const [loadingBuyNow, setLoadingBuyNow] = useState(!!buyNowId);

  useEffect(() => {
    if (buyNowId) {
      getProduct(buyNowId).then(prod => {
        if (prod) {
          setBuyNowItem({
            id: prod.id,
            name: prod.name,
            price: prod.price,
            mrp: prod.mrp,
            image: prod.image,
            size: buyNowSize,
            quantity: buyNowQty
          });
        }
        setLoadingBuyNow(false);
      });
    }
  }, [buyNowId, buyNowSize, buyNowQty]);

  // Context Switcher: Use isolated buy array or fallback to global cart tree
  const activeItems = buyNowId ? (buyNowItem ? [buyNowItem] : []) : cart;
  const subtotal = activeItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = subtotal * (appliedCoupon.discountValue / 100);
    } else {
      discountAmount = appliedCoupon.discountValue;
    }
  }
  const discountAmountCapped = Math.min(discountAmount, subtotal);

  const shipping = subtotal > 0 ? 15.00 : 0; // Flat luxury shipping rate
  const total = subtotal - discountAmountCapped + shipping;

  const handleApplyCoupon = async () => {
    setCouponError('');
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const coupon = await validateCoupon(couponCode, currentUser?.uid);
      if (coupon) {
        setAppliedCoupon(coupon);
        setCouponCode('');
      } else {
        setCouponError('Invalid or expired coupon code.');
      }
    } catch (e: any) {
      setCouponError(e.message || 'Error verifying coupon.');
    }
    setCouponLoading(false);
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeItems.length === 0) return;
    setStep('payment');
  };

  const handleSubmitOrder = async () => {
    if (activeItems.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderId = await createOrder({
        userId: currentUser ? currentUser.uid : 'guest',
        shippingDetails: formData,
        items: activeItems.map((item: any) => ({
          productId: item.id,
          name: item.name,
          mrp: item.mrp || item.price,
          pricePaid: item.price,
          quantity: item.quantity,
          size: item.size || 'M',
          image: item.image || ''
        })),
        total: total,
        discountAmount: discountAmountCapped,
        status: 'processing'
      });

      if (appliedCoupon && appliedCoupon.id) {
        try {
          if (appliedCoupon.usageLimitType === 'single_use') {
            await updateCoupon(appliedCoupon.id, { active: false });
          } else if (appliedCoupon.usageLimitType === 'once_per_user' && currentUser?.uid) {
            const currentUsedBy = appliedCoupon.usedBy || [];
            await updateCoupon(appliedCoupon.id, { usedBy: [...currentUsedBy, currentUser.uid] });
          }
        } catch (couponErr) {
          console.warn('Coupon invalidation failed manually - verify security rules applied:', couponErr);
        }
      }

      // Clear the global bag securely ONLY if we are processing the cart (not an isolated Buy Now action)
      if (!buyNowId && clearCart) {
        clearCart();
      }

      // Route specifically to the Success gateway passing the Tracking ID via query payload
      router.push(`/checkout/success?orderId=${orderId}`);

    } catch (err) {
      console.error("Payment Submission Failed: ", err);
      alert("There was an issue processing your order. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (authLoading || loadingBuyNow) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Establishing Secure Uplink...</h2>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <Lock size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <h2>Authentication Required</h2>
          <p>This secured gateway is strictly restricted. You must be signed in to purchase equipment.</p>
          <Link href="/" className={styles.returnBtn}>Sign In / Return to Base</Link>
        </div>
      </div>
    );
  }

  if (activeItems.length === 0 && !isSubmitting) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <h2>Bag Empty</h2>
          <p>Your arsenal requires equipment before passing through the gateway.</p>
          <Link href="/shop" className={styles.returnBtn}>Return to Armory</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <button 
        onClick={() => router.back()} 
        className={styles.pageBackBtn}
        aria-label="Go back"
      >
        <ChevronLeft size={20} /> Back to Arsenal
      </button>

      <h1 className={styles.title}>Secure Checkout</h1>
      
      <div className={styles.container}>
        
        {/* Left Form Wrapper */}
        <section className={styles.formSection}>
          {step === 'shipping' ? (
            <>
              <h2>Delivery Coordinates</h2>
              <form id="checkout-form" onSubmit={handleProceedToPayment} className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label>Full Name</label>
                  <input type="text" className={styles.input} required placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
            <div className={styles.formGroup}>
              <label>Contact Email</label>
              <input type="email" className={styles.input} required placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            
            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Shipping Address</label>
              <input type="text" className={styles.input} required placeholder="123 Luxury Ave, Apt 4B" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>
            
            <div className={styles.formGroup}>
              <label>City</label>
              <input type="text" className={styles.input} required placeholder="New York" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label>Zip / Postal Code</label>
              <input type="text" className={styles.input} required placeholder="10001" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label>Phone Number</label>
              <input type="tel" className={styles.input} required placeholder="+1 (555) 000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </form>
            </>
          ) : (
            <>
              <div className={styles.paymentHeader}>
                <button type="button" onClick={() => setStep('shipping')} className={styles.backToShippingBtn}>
                  <ChevronLeft size={16} /> Returns to Shipping
                </button>
                <h2>Secure Payment Portal</h2>
              </div>
              <div className={styles.paymentMethods}>
                <div className={styles.paymentOptionDisabled}>
                   <div className={styles.payIcon}><CreditCard size={24} /></div>
                   <div className={styles.payInfo}>
                     <h4>Credit / Debit Card</h4>
                     <span>Processed securely via Stripe</span>
                   </div>
                   <span className={styles.offlineTag}>Temporarily Offline</span>
                </div>
                
                <div className={styles.paymentOptionDisabled}>
                   <div className={styles.payIcon}><Wallet size={24} /></div>
                   <div className={styles.payInfo}>
                     <h4>UPI / Digital Wallet</h4>
                     <span>Google Pay, PhonePe, Paytm</span>
                   </div>
                   <span className={styles.offlineTag}>Temporarily Offline</span>
                </div>

                <div className={`${styles.paymentOption} ${styles.paymentOptionActive}`}>
                   <div className={styles.payIcon}><Banknote size={24} /></div>
                   <div className={styles.payInfo}>
                     <h4>Cash on Delivery (COD)</h4>
                     <span>Pay at your doorstep with Cash or UPI</span>
                   </div>
                   <div className={styles.activeCheck}>
                     <ShieldAlert size={16} color="#48bb78" /> Guaranteed Active
                   </div>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Right Summary Wrapper */}
        <aside className={styles.summarySection}>
          <h2>Order Manifest {buyNowId && <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '1rem' }}>(Direct Checkout)</span>}</h2>
          
          <div className={styles.cartItems}>
            {activeItems.map((item: any, idx: number) => (
              <div key={`${item.id}-${item.size}-${idx}`} className={styles.item}>
                <img src={item.image} alt={item.name} className={styles.itemImage} />
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>Size: {item.size} | Qty: {item.quantity}</span>
                </div>
                <span className={styles.itemPrice}>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className={styles.couponSection}>
            {appliedCoupon ? (
              <div className={styles.appliedCouponBox}>
                <span>Code Applied: <strong>{appliedCoupon.code}</strong></span>
                <button type="button" onClick={() => setAppliedCoupon(null)} className={styles.removeCouponBtn}>Remove</button>
              </div>
            ) : (
              <div className={styles.couponInputWrapper}>
                <input 
                  type="text" 
                  placeholder="Promo Code" 
                  value={couponCode} 
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  className={styles.couponInput}
                />
                <button type="button" onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className={styles.applyBtn}>
                  {couponLoading ? 'Wait...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className={styles.couponError}>{couponError}</p>}
          </div>

          <div className={styles.totals}>
             <div className={styles.summaryRow}>
               <span>Subtotal</span>
               <span>₹{subtotal.toFixed(2)}</span>
             </div>
             {discountAmountCapped > 0 && (
               <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                 <span>Discount</span>
                 <span>-₹{discountAmountCapped.toFixed(2)}</span>
               </div>
             )}
             <div className={styles.summaryRow}>
               <span>Shipping</span>
               <span>₹{shipping.toFixed(2)}</span>
             </div>
             <div className={`${styles.summaryRow} ${styles.totalRow}`}>
               <span>Total</span>
               <span>₹{total.toFixed(2)}</span>
             </div>
          </div>

          {step === 'shipping' ? (
            <button form="checkout-form" type="submit" className={styles.submitBtn}>
              Proceed to Payment
            </button>
          ) : (
            <button onClick={handleSubmitOrder} disabled={isSubmitting} className={styles.submitBtn}>
              {isSubmitting ? 'Processing...' : <><Lock size={16} style={{marginRight: '8px'}} /> Confirm Order</>}
            </button>
          )}
        </aside>

      </div>
    </div>
  );
}
