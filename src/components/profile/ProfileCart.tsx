"use client";
import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { getProducts, Product } from '@/lib/firebaseUtils';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './ProfileCart.module.css';

export default function ProfileCart() {
  const { cart, removeFromCart, updateQuantity } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRelated = async () => {
      // Don't show recommendations if cart is empty, or show anyway as a fallback?
      // User requested: "SHOW EVERYTHING AND ALSO THEN AFTER SHOW REKLATED PRODUCTS"
      const allProducts = await getProducts();
      
      // Filter out items already in cart
      const cartIds = cart.map(item => item.id);
      const available = allProducts.filter(p => !cartIds.includes(p.id!));
      
      // Randomize array
      const shuffled = available.sort(() => 0.5 - Math.random());
      
      // Pick top 4
      setRelatedProducts(shuffled.slice(0, 4));
    };
    fetchRelated();
  }, [cart]);

  if (cart.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <ShoppingBag size={48} className={styles.emptyIcon} />
        <h2 className={styles.emptyTitle}>Your Cart is Empty</h2>
        <p className={styles.emptySubtitle}>Explore the arsenal to gear up.</p>
        <Link href="/shop" className={styles.shopBtn}>Browse Collection <ArrowRight size={16} /></Link>
      </div>
    );
  }

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className={styles.container}>
      <h2 className={styles.headerTitle}>Active Payload</h2>
      
      <div className={styles.cartList}>
        {cart.map(item => (
          <div key={`${item.id}-${item.size}`} className={styles.cartItem}>
            <div className={styles.itemImageWrapper}>
              <img src={item.image} alt={item.name} className={styles.itemImage} />
            </div>
            
            <div className={styles.itemMeta}>
              <h4>{item.name}</h4>
              {item.size && <span className={styles.itemSize}>Size: {item.size}</span>}
            </div>

            <div className={styles.quantityControls}>
              <button 
                onClick={() => updateQuantity(item.id, item.size, -1)}
                className={styles.qBtn}
              >-</button>
              <span className={styles.qText}>{item.quantity}</span>
              <button 
                onClick={() => updateQuantity(item.id, item.size, 1)}
                className={styles.qBtn}
              >+</button>
            </div>

            <div className={styles.itemPrice}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </div>

            <button onClick={() => removeFromCart(item.id, item.size)} className={styles.removeBtn} aria-label="Remove item">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.cartSummary}>
        <div className={styles.summaryRow}>
           <span>Subtotal</span>
           <span>₹{subtotal.toFixed(2)}</span>
        </div>
        <div className={styles.summaryActions}>
           <Link href="/checkout" className={styles.checkoutBtn}>Secure Checkout</Link>
        </div>
      </div>

      {/* Related Products Algorithm Block */}
      {relatedProducts.length > 0 && (
        <div className={styles.relatedSection}>
          <h3 className={styles.relatedTitle}>You Might Also Like</h3>
          <div className={styles.relatedGrid}>
            {relatedProducts.map(product => (
              <Link href={`/product/${product.slug}`} key={product.id} className={styles.relatedCard}>
                <div className={styles.relatedImageWrapper}>
                   <img src={product.image} alt={product.name} />
                </div>
                <div className={styles.relatedInfo}>
                  <h5>{product.name}</h5>
                  <span>₹{product.price.toFixed(2)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
