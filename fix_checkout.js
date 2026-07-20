const fs = require('fs');

const code = fs.readFileSync('src/components/checkout/PremiumCheckout.tsx', 'utf8');

const newJSX = `
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (authLoading || loadingBuyNow) {
    return (
      <div className={styles.premiumCheckoutContainer} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: 'Cinzel', fontSize: '1.5rem', letterSpacing: '0.2em' }}>Establishing Secure Uplink...</h2>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.premiumCheckoutContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <Lock size={48} style={{ color: '#D4AF37' }} />
        <h2 style={{ fontFamily: 'Cinzel', fontSize: '2rem', letterSpacing: '0.1em' }}>Authentication Required</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', textAlign: 'center' }}>This secured gateway is strictly restricted. You must be signed in to purchase equipment.</p>
        <Link href='/' style={{ padding: '1rem 2rem', background: '#fff', color: '#000', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Return to Base</Link>
      </div>
    );
  }

  if (activeItems.length === 0 && !isSubmitting) {
    return (
      <div className={styles.premiumCheckoutContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
        <h2 style={{ fontFamily: 'Cinzel', fontSize: '2rem', letterSpacing: '0.1em' }}>Empty Allocation</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', textAlign: 'center' }}>Your arsenal requires equipment before passing through the gateway.</p>
        <Link href='/shop' style={{ padding: '1rem 2rem', background: '#fff', color: '#000', textDecoration: 'none', fontSize: '0.8rem', letterSpacing: '0.2em', textTransform: 'uppercase' }}>Return to Armory</Link>
      </div>
    );
  }

  const paymentMethodsBlock = (
    <div className={styles.paymentGrid}>
      <div 
         className={\`\${styles.paymentOption} \${paymentMethod === 'razorpay_qr' ? styles.paymentOptionActive : ''}\`}
         onClick={() => setPaymentMethod('razorpay_qr')}
      >
         <div className={styles.payInfo}>
           <div className={styles.payIcon}><QrCode size={24} /></div>
           <div>
             <h4 className={styles.payTitle}>QR Protocol (UPI)</h4>
             <p className={styles.paySubtitle}>Instant visual scanning</p>
           </div>
         </div>
         {paymentMethod === 'razorpay_qr' && <ShieldAlert size={16} color="#D4AF37" />}
      </div>

      <div 
         className={\`\${styles.paymentOption} \${paymentMethod === 'razorpay_link' ? styles.paymentOptionActive : ''}\`}
         onClick={() => setPaymentMethod('razorpay_link')}
      >
         <div className={styles.payInfo}>
           <div className={styles.payIcon}><Globe size={24} /></div>
           <div>
             <h4 className={styles.payTitle}>Encrypted Link</h4>
             <p className={styles.paySubtitle}>Cards, Netbanking, Wallets</p>
           </div>
         </div>
         {paymentMethod === 'razorpay_link' && <ShieldAlert size={16} color="#D4AF37" />}
      </div>

      {total >= 1500 && (
        <div 
           className={\`\${styles.paymentOption} \${paymentMethod === 'cod' ? styles.paymentOptionActive : ''}\`}
           onClick={() => setPaymentMethod('cod')}
        >
           <div className={styles.payInfo}>
             <div className={styles.payIcon}><Banknote size={24} /></div>
             <div>
               <h4 className={styles.payTitle}>Physical Tender (COD)</h4>
               <p className={styles.paySubtitle}>Cash on Delivery</p>
             </div>
           </div>
           {paymentMethod === 'cod' && <ShieldAlert size={16} color="#D4AF37" />}
        </div>
      )}
    </div>
  );

  return (
    <div className={styles.premiumCheckoutContainer}>
      {/* CUSTOM CURSOR */}
      <motion.div 
        className={styles.customCursor}
        animate={{ x: mousePosition.x, y: mousePosition.y }}
        transition={{ type: "tween", ease: "backOut", duration: 0.1 }}
      />
      <motion.div 
        className={styles.customCursorRing}
        animate={{ x: mousePosition.x, y: mousePosition.y }}
        transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
      />

      <header className={styles.checkoutHeader}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ChevronLeft size={16} /> Return to Arsenal
        </button>
        <div className={styles.secureBadge}>
          <ShieldAlert size={12} color="#D4AF37" /> SECURE ALLOCATION
        </div>
      </header>

      <div className={styles.checkoutGrid}>
        
        {/* LOGISTICS FORM */}
        <section className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Logistics Destination</h2>
          
          <form className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Full Name</label>
              <input type="text" className={styles.inputField} placeholder="Enter your registered name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Contact Point</label>
              <input type="tel" className={styles.inputField} placeholder="Phone number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className={\`\${styles.inputGroup} \${styles.fullWidth}\`}>
              <label className={styles.inputLabel}>Secure Address</label>
              <input type="text" className={styles.inputField} placeholder="Street Address, Apt, Suite" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>City</label>
              <input type="text" className={styles.inputField} placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Zip / Postal Code</label>
              <input type="text" className={styles.inputField} placeholder="ZIP Code" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
            </div>
          </form>

          <h2 className={styles.sectionTitle} style={{ marginTop: '5rem' }}>Wire Protocol</h2>
          {paymentMethodsBlock}

        </section>

        {/* SUMMARY */}
        <section className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>Allocation Summary</h3>
          
          <div className={styles.cartItems}>
            {activeItems.map((item: any, idx: number) => (
              <div key={idx} className={styles.cartItem}>
                <div className={styles.itemImageWrap}>
                  <img src={item.image} alt={item.name} className={styles.itemImage} />
                </div>
                <div className={styles.itemDetails}>
                  <h4 className={styles.itemName}>{item.name}</h4>
                  <div className={styles.itemMeta}>Qty: {item.quantity} | Dim: {item.size}</div>
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
            {shipping > 0 && (
              <div className={styles.costRow}>
                <span>Global Logistics</span>
                <span>{formatPrice(shipping)}</span>
              </div>
            )}
            <div className={\`\${styles.costRow} \${styles.total}\`}>
              <span>Required Investment</span>
              <span className={styles.totalValue}>{formatPrice(total)}</span>
            </div>
          </div>

          <button 
            className={styles.placeOrderBtn}
            onClick={handleSubmitOrder}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Establishing Connection...' : 'Confirm Allocation'}
          </button>
        </section>

      </div>
    </div>
  );
}
`;

const modifiedCode = code.replace(/  if \(authLoading \|\| loadingBuyNow\) \{[\s\S]*/, newJSX);

fs.writeFileSync('src/components/checkout/PremiumCheckout.tsx', modifiedCode);
console.log("Rewrite completed successfully!");
