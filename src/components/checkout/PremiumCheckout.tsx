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
import styles from './PremiumCheckout.module.css';
import { useCurrency } from '@/context/CurrencyContext';
import * as metaPixel from '@/lib/metaPixel';
import { useAuthToast } from '@/context/AuthToastContext';
import { calculateBundleSavings } from '@/lib/bundleLogic';
import { reserveInventory } from '@/lib/firebaseUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function PremiumCheckout() {
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

  // Premium Theme effect
  useEffect(() => {
    document.body.classList.add('premium-theme');
    return () => document.body.classList.remove('premium-theme');
  }, []);

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
                 router.push(`/checkout/success?orderId=${createdOrderId}&premium=true`);
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
    // COD is now unconditionally available
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
         // If it's a Firebase permission error (because they didn't deploy the rules), just let them proceed to payment anyway.
         // But if it's an actual stock error ("Insufficient stock for..."), we must block them.
         if (invErr.message && invErr.message.includes('Insufficient stock')) {
            alert(invErr.message);
            setIsSubmitting(false);
            return;
         }
         // Otherwise, it's a permission error, so we ignore it and let them pay!
      }
      
      if (paymentMethod === 'razorpay_link') {
         // Create Payment Link
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
            window.location.href = data.shortUrl; // Redirect to Razorpay
         } else {
            alert('Failed to generate payment link');
            setIsSubmitting(false);
         }
         return; // Wait for redirect
      }
      
      if (paymentMethod === 'razorpay_qr') {
         // Create QR Code
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
         return; // Wait for user to scan
      }
      
      // COD Logic
      if (paymentMethod === 'cod') {
         await updateOrder(orderId, { status: 'processing' });
         if (!buyNowId && clearCart) {
           clearCart();
         }
         router.push(`/checkout/success?orderId=${orderId}&premium=true`);
         return;
      }
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to place order');
      setIsSubmitting(false);
    }
  };

  const paymentMethodsBlock = (
    <div className={styles.paymentGrid}>
      <div 
         className={`${styles.paymentOption} ${paymentMethod === 'razorpay_qr' ? styles.paymentOptionActive : ''}`}
         onClick={() => setPaymentMethod('razorpay_qr')}
      >
         <div className={styles.payInfo}>
           <div className={styles.payIcon}><QrCode size={24} /></div>
           <div>
             <h4 className={styles.payTitle}>Rapid Transfer</h4>
             <p className={styles.paySubtitle}>UPI QR / Fast Pay</p>
           </div>
         </div>
         {paymentMethod === 'razorpay_qr' && <ShieldAlert size={16} color="#D4AF37" />}
      </div>

      <div 
         className={`${styles.paymentOption} ${paymentMethod === 'razorpay_link' ? styles.paymentOptionActive : ''}`}
         onClick={() => setPaymentMethod('razorpay_link')}
      >
         <div className={styles.payInfo}>
           <div className={styles.payIcon}><CreditCard size={24} /></div>
           <div>
             <h4 className={styles.payTitle}>Encrypted Link</h4>
             <p className={styles.paySubtitle}>Cards, Netbanking, Wallets</p>
           </div>
         </div>
         {paymentMethod === 'razorpay_link' && <ShieldAlert size={16} color="#D4AF37" />}
      </div>


    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98, filter: 'blur(20px)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={styles.premiumCheckoutContainer}
    >
      {/* Hide global navbar via CSS injected here */}
      <style dangerouslySetInnerHTML={{ __html: `
        #global-navbar { display: none !important; }
      `}} />

      {/* ELITE NAVBAR */}
      <motion.nav 
        className={styles.eliteNav}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '80px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 5%',
          background: 'linear-gradient(to bottom, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 90,
          borderBottom: '1px solid rgba(212, 175, 55, 0.1)',
        }}
      >
        <Link href="/" className={styles.navLogo} style={{ textDecoration: 'none' }}>
          <div style={{ textAlign: 'center' }}>
             <div style={{ fontFamily: 'Cinzel', fontSize: '1.5rem', letterSpacing: '0.3em', color: '#fff', textShadow: '0 0 20px rgba(212,175,55,0.3)' }}>DUALDEER</div>
             <div style={{ fontFamily: 'Inter', fontSize: '0.55rem', letterSpacing: '0.5em', color: '#D4AF37', margin: '2px 0 0 0', textTransform: 'uppercase' }}>Elite Vault</div>
          </div>
        </Link>

        <div className={styles.navSecureBadge} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#D4AF37', 
            fontFamily: 'Inter',
            fontSize: '0.65rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            opacity: 0.8
        }}>
          <ShieldAlert size={14} color="#D4AF37" /> Secure Checkout
        </div>
      </motion.nav>

      <div className={styles.checkoutGrid}>
        
        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem' }}>
          <button 
            onClick={() => router.back()} 
            style={{ 
              background: 'transparent', 
              border: '1px solid rgba(212,175,55,0.3)', 
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: '#fff', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.background = 'rgba(212,175,55,0.1)' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.3)'; e.currentTarget.style.background = 'transparent' }}
            aria-label="Go Back"
          >
            <ChevronLeft size={20} color="#D4AF37" />
          </button>
        </div>

        {/* DYNAMIC LEFT COLUMN: FORM OR PAYMENT */}
        <div style={{ position: 'relative' }}>
          <AnimatePresence mode="wait">
            {step === 'shipping' && (
              <motion.section 
                key="shipping"
                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={styles.formSection}
              >
                <h2 className={styles.sectionTitle}>Delivery Details</h2>
                
                <form id="premium-checkout-form" onSubmit={handleProceedToPayment} className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Email Address</label>
                    <input type="email" required className={styles.inputField} placeholder="Secure transmission email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Phone Number</label>
                    <input type="tel" required className={styles.inputField} placeholder="Secure transmission line" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>

                  <div className={`${styles.inputGroup} ${styles.fullWidth}`} style={{ marginTop: '1.5rem' }}>
                    <label className={styles.inputLabel}>Full Name</label>
                    <input type="text" required className={styles.inputField} placeholder="Authorized recipient" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  
                  <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                    <label className={styles.inputLabel}>Street Address</label>
                    <input type="text" required className={styles.inputField} placeholder="Classified coordinates" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>

                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>City</label>
                    <input type="text" required className={styles.inputField} placeholder="Metropolis" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Postal Code</label>
                    <input type="text" required className={styles.inputField} placeholder="Sector code" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                  </div>
                  {/* COUPON SECTION */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                    <div className={styles.couponSection}>
                      <div className={styles.couponInputWrapper}>
                        <input 
                          type="text" 
                          placeholder="Access Code" 
                          value={couponCode} 
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className={styles.couponInput}
                          disabled={!!appliedCoupon || couponLoading}
                        />
                        <button 
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode || couponLoading || !!appliedCoupon}
                          className={styles.couponBtn}
                        >
                          {couponLoading ? 'Verifying...' : appliedCoupon ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                      {couponError && <p className={styles.couponError}>{couponError}</p>}
                      {appliedCoupon && (
                        <p className={styles.couponSuccess}>
                          Code '{appliedCoupon.code}' active. -{formatPrice(discountAmountCapped)}
                        </p>
                      )}
                    </div>
                  </div>
                </form>

              </motion.section>
            )}

            {step === 'payment' && (
              <motion.section 
                key="payment"
                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={styles.formSection}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3.5rem' }}>
                  <h2 className={styles.sectionTitle} style={{ marginBottom: 0 }}>Payment Method</h2>
                  <button type="button" onClick={() => setStep('shipping')} style={{ background: 'none', border: 'none', color: '#D4AF37', textDecoration: 'underline', cursor: 'pointer', fontFamily: 'Inter', fontSize: '0.8rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Edit Details</button>
                </div>
                
                {paymentMethodsBlock}


              </motion.section>
            )}

            {step === 'qr-payment' && (
              <motion.section 
                key="qr-payment"
                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={styles.formSection}
              >
                <h2 className={styles.sectionTitle}>Authorization Terminal</h2>
                <div style={{ padding: '2rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', backdropFilter: 'blur(20px)' }}>
                  <p style={{ marginBottom: '15px', fontSize: '1rem', color: '#FFF', letterSpacing: '0.05em' }}>
                    Scan code to authorize transfer of <strong style={{color: '#D4AF37', fontSize: '1.2rem'}}>{renderPrice(total)}</strong>
                  </p>
                  
                  <div style={{ background: '#FFF', padding: '1rem', borderRadius: '12px', display: 'inline-block', marginBottom: '2rem', position: 'relative', boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)' }}>
                     {qrTimeLeft === '00:00' ? (
                       <div style={{ width: '220px', height: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5', borderRadius: '8px' }}>
                          <span style={{ color: '#d32f2f', fontWeight: '600', letterSpacing: '0.1em' }}>QR Expired</span>
                          <button onClick={() => setStep('payment')} style={{ marginTop: '15px', padding: '8px 16px', cursor: 'pointer', background: '#000', color: '#D4AF37', border: '1px solid #D4AF37' }}>Regenerate</button>
                       </div>
                     ) : (
                       <div style={{ 
                          width: '220px', 
                          height: '220px', 
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
                              objectFit: 'cover',
                              transform: 'scale(1.1)', 
                              transformOrigin: 'center center',
                              maxWidth: 'none'
                            }}
                         />
                       </div>
                     )}
                  </div>
                  
                  <div style={{ marginBottom: '2rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#888', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.15em' }}>Connection closes in:</p>
                    <div style={{ fontSize: '1.8rem', fontFamily: 'Cinzel', color: qrTimeLeft === '00:00' ? '#d32f2f' : '#D4AF37', letterSpacing: '0.1em', textShadow: '0 0 10px rgba(212, 175, 55, 0.4)' }}>
                      {qrTimeLeft}
                    </div>
                  </div>
  
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: '#888', fontSize: '0.85rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                     <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                     Awaiting Secure Handshake...
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN */}
        <div className={styles.rightColumn}>
          <motion.section 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className={styles.summarySection}
          >
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          
          <div className={styles.cartItems}>
            {activeItems.map((item: any, idx: number) => (
              <div key={idx} className={styles.cartItem}>
                <div className={styles.itemImageWrap}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <div className={styles.itemMeta}>Size: {item.size}</div>
                  <div className={styles.itemMeta} style={{ marginTop: '0.2rem', textTransform: 'none' }}>Quantity: {item.quantity}</div>
                </div>
                <div className={styles.itemPrice}>
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.costBreakdown}>
            <div className={styles.costRow}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discountAmountCapped > 0 && (
              <div className={styles.costRow} style={{ color: '#D4AF37' }}>
                <span>Discount ({appliedCoupon?.code})</span>
                <span>-{formatPrice(discountAmountCapped)}</span>
              </div>
            )}
            {shipping > 0 && (
              <div className={styles.costRow}>
                <span>Encrypted Transport</span>
                <span>{formatPrice(shipping)}</span>
              </div>
            )}
            <div className={`${styles.costRow} ${styles.total}`}>
              <span>Authorized Amount</span>
              <span className={styles.totalValue}>{formatPrice(total)}</span>
            </div>
          </div>
        </motion.section>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className={styles.mobileButtonTop}
        >
          {step === 'shipping' ? (
            <button 
              form="premium-checkout-form"
              type="submit"
              className={styles.placeOrderBtn}
            >
              Proceed to Payment
            </button>
          ) : step === 'payment' ? (
            <button 
              className={styles.placeOrderBtn}
              onClick={handleSubmitOrder}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Authenticating...' : 'Authorize Purchase'}
            </button>
          ) : null}
        </motion.div>
      </div>

      </div>
    </motion.div>
  );
}
