"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { createOrder, getProduct, validateCoupon, updateCoupon, Coupon, updateOrder } from '@/lib/firebaseUtils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { Lock, ChevronLeft, CreditCard, Wallet, Banknote, ShieldAlert, Globe, QrCode } from 'lucide-react';
import styles from './Checkout.module.css';
import { useCurrency } from '@/context/CurrencyContext';
import * as metaPixel from '@/lib/metaPixel';
import { useAuthToast } from '@/context/AuthToastContext';
import { calculateBundleSavings } from '@/lib/bundleLogic';
import { reserveInventory } from '@/lib/firebaseUtils';
import PremiumCheckout from '@/components/checkout/PremiumCheckout';

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', color: 'var(--color-text)', textAlign: 'center' }}>Loading Secure Gateway...</div>}>
      <CheckoutRouter />
    </Suspense>
  );
}

function CheckoutRouter() {
  const searchParams = useSearchParams();
  const isPremium = searchParams.get('premium') === 'true';

  if (isPremium) {
    return <PremiumCheckout />;
  }

  return <CheckoutEngine />;
}

function CheckoutEngine() {
  const { cart, cartTotal: _globalSubtotal, clearCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currency, formatPrice, conversionRate, countryCode, renderPrice } = useCurrency();
  const { showAuthToast } = useAuthToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment' | 'qr-payment'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay_qr' | 'razorpay_link'>(currency === 'USD' ? 'razorpay_link' : 'razorpay_qr');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [qrExpiresAt, setQrExpiresAt] = useState<number | null>(null);
  const [qrTimeLeft, setQrTimeLeft] = useState('15:00');
  const [createdOrderId, setCreatedOrderId] = useState('');
  const [showCodModal, setShowCodModal] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Timer Effect
  useEffect(() => {
     if (step === 'qr-payment' && qrExpiresAt) {
       const interval = setInterval(() => {
         const now = Date.now();
         if (now > qrExpiresAt) {
            setQrTimeLeft('00:00');
            clearInterval(interval);
         } else {
            const totalSeconds = Math.floor((qrExpiresAt - now) / 1000);
            const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
            const secs = (totalSeconds % 60).toString().padStart(2, '0');
            setQrTimeLeft(`${mins}:${secs}`);
         }
       }, 1000);
       return () => clearInterval(interval);
     }
  }, [step, qrExpiresAt]);

  // Firestore Listener Effect
  useEffect(() => {
     if (step === 'qr-payment' && createdOrderId) {
        const unsubscribe = onSnapshot(doc(db, 'orders', createdOrderId), (docSnap) => {
           if (docSnap.exists()) {
              const data = docSnap.data();
              if (data.status === 'processing' || data.razorpay?.status === 'paid') {
                 // Payment Successful, redirect
                 if (!buyNowId && clearCart) {
                    clearCart();
                 }
                 router.push(`/checkout/success?orderId=${createdOrderId}`);
              }
           }
        });
        return () => unsubscribe();
     }
  }, [step, createdOrderId]);

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
        showAuthToast("Please log in to proceed to checkout.");
        router.push('/cart');
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
    zip: '',
    country: countryCode || 'IN'
  });

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  const buyNowId = searchParams.get('buyNow') || searchParams.get('id');
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
  
  const { bundleSavings, appliedBundles } = calculateBundleSavings(activeItems);
  
  let discountAmount = 0;
  if (appliedCoupon) {
    let targetAmount = subtotal;
    if (appliedCoupon.applyTo === 'first_item' && activeItems.length > 0) {
      targetAmount = activeItems[0].price; // Apply to 1 unit of the first item
    }

    if (appliedCoupon.discountType === 'percentage') {
      discountAmount = targetAmount * (appliedCoupon.discountValue / 100);
    } else {
      discountAmount = appliedCoupon.applyTo === 'first_item' ? Math.min(appliedCoupon.discountValue, targetAmount) : appliedCoupon.discountValue;
    }
  }
  const discountAmountCapped = Math.min(discountAmount, subtotal);

  const isIndia = countryCode === "IN";
  const estimatedGstRate = isIndia ? 0.12 : 0;
  const taxableAmount = Math.max(0, subtotal - bundleSavings - discountAmountCapped);
  const estimatedGst = taxableAmount * estimatedGstRate;
  const taxRate = 0; // Cut GST on total
  const tax = taxableAmount * taxRate;
  const shipping = subtotal > 0 ? (isIndia ? 0 : 20 * conversionRate) : 0;
  const total = taxableAmount + tax + shipping;

  useEffect(() => {
    if (total < 1500 && paymentMethod === 'cod') {
      setPaymentMethod(currency === 'USD' ? 'razorpay_link' : 'razorpay_qr');
    }
  }, [total, paymentMethod, currency]);

  const [checkoutInitiated, setCheckoutInitiated] = useState(false);

  useEffect(() => {
    if (!loadingBuyNow && activeItems.length > 0 && !checkoutInitiated) {
      metaPixel.event('InitiateCheckout', {
        value: total,
        currency: currency,
        num_items: activeItems.reduce((acc: number, item: any) => acc + item.quantity, 0)
      });
      setCheckoutInitiated(true);
    }
  }, [loadingBuyNow, activeItems.length, total, currency, checkoutInitiated]);

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

    const orderPayload = {
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
      bundleSavings: bundleSavings,
      appliedBundles: appliedBundles,
      discountAmount: discountAmountCapped,
      ...(appliedCoupon ? { appliedCoupon: appliedCoupon.code } : {}),
      ...(appliedCoupon && appliedCoupon.affiliateId ? { 
        affiliateId: appliedCoupon.affiliateId,
        affiliateCommission: discountAmountCapped 
      } : {}),
      status: 'payment_pending' as any,
      paymentMethod: paymentMethod,
      currency: currency,
      exchangeRate: currency === 'USD' ? conversionRate : 1,
      shiprocketSyncStatus: 'pending' as const
    };

    try {
      const orderId = await createOrder(orderPayload);
      setCreatedOrderId(orderId);
      
      // Reserve inventory right after creating the order
      try {
        await reserveInventory(orderPayload.items);
      } catch (invErr: any) {
         console.error('Failed to reserve inventory:', invErr);
         if (invErr.message && invErr.message.includes('Insufficient stock')) {
            alert(invErr.message);
            setIsSubmitting(false);
            return;
         }
      }
      
      if (paymentMethod === 'razorpay_link') {
         const res = await fetch('/api/razorpay/payment-link', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               orderId,
               amount: total,
               customer: formData
            })
         });
         const data = await res.json();
         if (data.shortUrl) {
            window.location.href = data.shortUrl;
         } else {
            alert('Failed to generate payment link');
            setIsSubmitting(false);
         }
         return;
      }
      
      if (paymentMethod === 'razorpay_qr') {
         const res = await fetch('/api/razorpay/qr', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               orderId,
               amount: total,
               customer: formData
            })
         });
         const data = await res.json();
         if (data.imageUrl) {
            setQrCodeUrl(data.imageUrl);
            setQrExpiresAt(Date.now() + 15 * 60 * 1000);
            setStep('qr-payment');
         } else {
            alert('Failed to generate QR code');
         }
         setIsSubmitting(false);
         return;
      }
      
      if (paymentMethod === 'cod') {
          await updateOrder(orderId, { status: 'processing' });
          fetch('/api/shiprocket/create-order', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ orderId, orderData: orderPayload })
          }).catch(console.error);
          
          fetch('/api/send-order-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ orderId, orderData: orderPayload })
          }).catch(console.error);
          
          if (appliedCoupon && appliedCoupon.id) {
             if (appliedCoupon.usageLimitType === 'single_use') await updateCoupon(appliedCoupon.id, { active: false });
             else if (appliedCoupon.usageLimitType === 'once_per_user' && currentUser?.uid) {
                await updateCoupon(appliedCoupon.id, { usedBy: [...(appliedCoupon.usedBy || []), currentUser.uid] });
             }
          }
          
          if (!buyNowId && clearCart) clearCart();
          router.push(`/checkout/success?orderId=${orderId}`);
      }

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

  const paymentMethodsBlock = (
    <div className={styles.paymentMethods}>
      <div 
         className={`${styles.paymentOption} ${paymentMethod === 'razorpay_qr' ? styles.paymentOptionActive : ''}`}
         onClick={() => setPaymentMethod('razorpay_qr')}
      >
         <div className={styles.payIcon}><QrCode size={20} /></div>
         <div className={styles.payInfo}>
           <h4 style={{ fontSize: '0.85rem' }}>Pay via QR Code (UPI)</h4>
         </div>
         {paymentMethod === 'razorpay_qr' && (
           <div className={styles.activeCheck}>
             <ShieldAlert size={14} color="#48bb78" />
           </div>
         )}
      </div>

      <div 
         className={`${styles.paymentOption} ${paymentMethod === 'razorpay_link' ? styles.paymentOptionActive : ''}`}
         onClick={() => setPaymentMethod('razorpay_link')}
      >
         <div className={styles.payIcon}><Globe size={20} /></div>
         <div className={styles.payInfo}>
           <h4 style={{ fontSize: '0.85rem' }}>Pay via Payment Link</h4>
         </div>
         {paymentMethod === 'razorpay_link' && (
           <div className={styles.activeCheck}>
             <ShieldAlert size={14} color="#48bb78" />
           </div>
         )}
      </div>

      {total >= 1500 ? (
        <div 
           className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.paymentOptionActive : ''}`}
           onClick={() => setPaymentMethod('cod')}
        >
           <div className={styles.payIcon}><Banknote size={20} /></div>
           <div className={styles.payInfo}>
             <h4 style={{ fontSize: '0.85rem' }}>Cash on Delivery (COD)</h4>
           </div>
           {paymentMethod === 'cod' && (
             <div className={styles.activeCheck}>
               <ShieldAlert size={14} color="#48bb78" />
             </div>
           )}
        </div>
      ) : (
        <div 
           className={`${styles.paymentOption}`}
           style={{ opacity: 0.5, cursor: 'not-allowed' }}
           onClick={() => setShowCodModal(true)}
        >
           <div className={styles.payIcon}><Banknote size={20} /></div>
           <div className={styles.payInfo}>
             <h4 style={{ fontSize: '0.85rem' }}>Cash on Delivery</h4>
             <span style={{ color: 'var(--color-primary)', fontSize: '0.75rem' }}>Min order {renderPrice(1500)}</span>
           </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.page}>
      <button 
        onClick={() => router.back()} 
        className={styles.pageBackBtn}
        aria-label="Go back"
      >
        <ChevronLeft size={20} /> Back to Arsenal
      </button>

      <div className={styles.headerContainer}>
        <h1 className={styles.title}><Lock size={24} style={{ marginRight: '10px', verticalAlign: 'text-bottom' }}/> Secure Checkout</h1>
      </div>
      
      <div className={styles.container}>
        
        <section className={styles.formSection}>
          {step === 'shipping' ? (
            <>
              <form id="checkout-form" onSubmit={handleProceedToPayment} className={styles.formGrid}>
                
                <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Contact Information</h3>
                </div>
                
                <div className={styles.formGroup}>
                  <label>Email Address</label>
                  <input type="email" className={styles.input} required placeholder=" " value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone Number</label>
                  <input type="tel" className={styles.input} required placeholder=" " value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 500, margin: 0 }}>Shipping Address</h3>
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Full Name</label>
                  <input type="text" className={styles.input} required placeholder=" " value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Street Address</label>
                  <input type="text" className={styles.input} required placeholder=" " value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                <div className={styles.formGroup}>
                  <label>City</label>
                  <input type="text" className={styles.input} required placeholder=" " value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                </div>
                <div className={styles.formGroup}>
                  <label>Zip / Postal Code</label>
                  <input type="text" className={styles.input} required placeholder=" " value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                </div>

                <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                  <label>Country</label>
                  <input type="text" className={styles.input} required placeholder=" " value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                </div>
              </form>
              <button form="checkout-form" type="submit" className={styles.submitBtn} style={{ marginTop: '2rem' }}>
                Proceed to Payment
              </button>
            </>
          ) : step === 'payment' ? (
            <>
              <div className={styles.paymentHeader}>
                <h2>Payment</h2>
              </div>
              <div className={styles.confirmedBox}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', margin: 0 }}>Deliver to:</p>
                    <p style={{ fontSize: '0.95rem', fontWeight: 500, margin: '4px 0 0 0' }}>{formData.name}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text)', margin: '2px 0 0 0', lineHeight: 1.4 }}>
                      {formData.address}, {formData.city}, {formData.zip}
                    </p>
                  </div>
                  <button type="button" onClick={() => setStep('shipping')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 500 }}>
                    Change
                  </button>
                </div>
              </div>
              <div className={styles.desktopPaymentWrapper}>
                {paymentMethodsBlock}
              </div>
            </>
          ) : step === 'qr-payment' ? (
            <>
              <div className={styles.paymentHeader}>
                <button type="button" onClick={() => setStep('shipping')} className={styles.backToShippingBtn}>
                  <ChevronLeft size={16} /> Cancel Payment
                </button>
                <h2>Scan QR to Pay</h2>
              </div>
              <div style={{ padding: '1.5rem', background: 'rgba(var(--foreground-rgb), 0.02)', borderRadius: '12px', border: '1px solid var(--color-border)', textAlign: 'center' }}>
                <p style={{ marginBottom: '15px', fontSize: '1rem', color: 'var(--color-text)' }}>
                  Scan this code with any UPI app to pay <strong style={{color: 'var(--color-primary)', fontSize: '1.2rem'}}>{renderPrice(total)}</strong>.
                </p>
                
                <div style={{ background: 'var(--color-foreground)', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '1.5rem', position: 'relative' }}>
                   {qrTimeLeft === '00:00' ? (
                     <div style={{ width: '200px', height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                        <span style={{ color: 'red', fontWeight: 'bold' }}>QR Expired</span>
                        <button onClick={() => setStep('shipping')} style={{ marginTop: '10px', padding: '5px 10px', cursor: 'pointer' }}>Go Back</button>
                     </div>
                   ) : (
                     <div style={{ 
                        width: '200px', 
                        height: '200px', 
                        overflow: 'hidden', 
                        borderRadius: '8px',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                     }}>
                       <img 
                          src={qrCodeUrl} 
                          alt="Razorpay UPI QR Code" 
                          style={{ 
                            width: '100%', 
                            height: '100%',
                            transform: 'scale(1.65)',
                            transformOrigin: 'center center',
                            maxWidth: 'none'
                          }}
                       />
                     </div>
                   )}
                </div>
                
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '8px' }}>Expires in:</p>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: qrTimeLeft === '00:00' ? 'red' : 'var(--color-primary)', letterSpacing: '1px' }}>
                    {qrTimeLeft}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#888', fontSize: '0.85rem' }}>
                   <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                   Awaiting Payment Confirmation...
                </div>
              </div>
            </>
          ) : null}
        </section>

        <aside className={`${styles.summarySection} ${step === 'shipping' ? styles.hideOnMobile : ''}`}>
          <div className={step === 'shipping' ? styles.hideOnMobile : ''}>
            <h2>Order Manifest {buyNowId && <span style={{ fontSize: '0.8rem', opacity: 0.5, marginLeft: '1rem' }}>(Direct Checkout)</span>}</h2>
          
          <div className={styles.cartItems}>
            {activeItems.map((item: any, idx: number) => (
              <div key={`${item.id}-${item.size}-${idx}`} className={styles.item}>
                <div className={styles.itemImageWrapper}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                  <div className={styles.itemQuantityBadge}>{item.quantity}</div>
                </div>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemMeta}>{item.size}</span>
                </div>
                <span className={styles.itemPrice}>{renderPrice(item.price * item.quantity)}</span>
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
               <span>{renderPrice(subtotal)}</span>
             </div>
             {bundleSavings > 0 && (
               <div className={`${styles.summaryRow} ${styles.discountRow}`} style={{ color: 'var(--color-primary)' }}>
                 <span>Duo Pack Savings</span>
                 <span>-{renderPrice(bundleSavings)}</span>
               </div>
             )}
             {discountAmountCapped > 0 && (
               <div className={`${styles.summaryRow} ${styles.discountRow}`}>
                 <span>Discount</span>
                 <span>-{renderPrice(discountAmountCapped)}</span>
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
             <div className={`${styles.summaryRow} ${styles.totalRow}`}>
               <span>Total</span>
               <span>{renderPrice(total)}</span>
             </div>
            </div>
          </div>

           {step === 'payment' && (
             <div className={styles.mobilePaymentWrapper}>
                {paymentMethodsBlock}
             </div>
           )}

           {step === 'payment' ? (
            <button 
              onClick={() => handleSubmitOrder()} 
              disabled={isSubmitting} 
              className={styles.submitBtn}
            >
              {isSubmitting ? 'Processing...' : paymentMethod === 'razorpay_qr' ? <><QrCode size={16} style={{marginRight: '8px'}} /> Generate QR Code</> : paymentMethod === 'razorpay_link' ? <><Globe size={16} style={{marginRight: '8px'}} /> Request Payment Link</> : <><Lock size={16} style={{marginRight: '8px'}} /> Confirm Order</>}
            </button>
          ) : step === 'qr-payment' ? (
            <button disabled className={styles.submitBtn} style={{ opacity: 0.7, cursor: 'not-allowed' }}>
              <Lock size={16} style={{marginRight: '8px'}} /> Waiting for scan...
            </button>
          ) : null}

          <div className={`${styles.trustBadges} ${step === 'shipping' ? styles.hideOnMobile : ''}`}>
            <div className={styles.trustBadgeItem}>
              <ShieldAlert size={14} /> 256-bit SSL
            </div>
            <div className={styles.trustBadgeItem}>
              <Lock size={14} /> Secure Checkout
            </div>
          </div>
        </aside>

      </div>

      {showCodModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--color-surface)', 
            color: 'var(--color-text)',
            padding: '2.5rem', 
            borderRadius: '16px', 
            maxWidth: '450px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            position: 'relative',
            border: '1px solid var(--color-border)'
          }}>
            <button 
               onClick={() => setShowCodModal(false)}
               style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--color-text-muted)' }}
            >
              ✕
            </button>
            <Banknote size={48} style={{ color: '#2563eb', margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '1rem' }}>
              Unlock Cash on Delivery!
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              You're only <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>{renderPrice(1500 - total)}</strong> away from unlocking our Cash on Delivery option! Treat yourself to something extra and pay right at your doorstep.
            </p>
            <button 
              onClick={() => {
                setShowCodModal(false);
                router.push('/shop');
              }}
              style={{
                width: '100%', padding: '1rem', background: '#2563eb', color: '#fff',
                border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', marginBottom: '1rem', transition: 'background 0.2s'
              }}
            >
              Add More Products
            </button>
            <button 
              onClick={() => setShowCodModal(false)}
              style={{
                width: '100%', padding: '1rem', background: 'transparent', color: 'var(--color-text)',
                border: '1px solid var(--color-border)', borderRadius: '8px', fontSize: '1rem', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s'
              }}
            >
              No thanks, I'll pay online
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
