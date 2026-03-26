"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag } from 'lucide-react';
import { getWishlist, getProducts, removeFromWishlist, Product, WishlistItem } from '@/lib/firebaseUtils';
import { useCart } from '@/context/CartContext';
import styles from './ProfileWishlist.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfileWishlist({ user }: { user: any }) {
  const [wishlistItems, setWishlistItems] = useState<{ id: string, product: Product }[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      try {
        const [wList, pList] = await Promise.all([
          getWishlist(user.uid),
          getProducts()
        ]);
        
        // Map products
        const mapped = wList.map(item => {
          const product = pList.find(p => p.id === item.productId);
          return product ? { id: item.id as string, product } : null;
        }).filter(Boolean) as { id: string, product: Product }[];
        
        setWishlistItems(mapped);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchWishlist();
  }, [user]);

  const handleRemove = async (id: string) => {
    await removeFromWishlist(id);
    setWishlistItems(prev => prev.filter(item => item.id !== id));
  };

  if (loading) {
    return <div className={styles.loading}>Loading your saved selections...</div>;
  }

  if (wishlistItems.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2>Your Wishlist is Empty</h2>
        <p>You haven't saved any items yet. Discover our premium collection and save your favorites here.</p>
        <button className={styles.shopBtn} onClick={() => router.push('/shop')}>EXPLORE COLLECTION</button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Saved Products</h2>
      <div className={styles.grid}>
        <AnimatePresence>
          {wishlistItems.map(({ id, product }) => (
            <motion.div 
              key={id} 
              className={styles.card}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className={styles.imageBox}>
                <Link href={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                  <img src={product.image} alt={product.name} />
                </Link>
                <button className={styles.removeBtn} onClick={() => handleRemove(id)}>
                  <Trash2 size={16} />
                </button>
              </div>
              <div className={styles.infoBox}>
                <Link href={`/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h4>{product.name}</h4>
                </Link>
                <p className={styles.price}>₹{product.price.toFixed(2)}</p>
                <button 
                  className={styles.addCartBtn}
                  onClick={() => {
                    addToCart({
                      id: product.id as string,
                      name: product.name,
                      price: product.price,
                      mrp: product.mrp,
                      image: product.image,
                      size: product.sizes?.[0] || 'M',
                      quantity: 1
                    });
                    handleRemove(id);
                  }}
                >
                  <ShoppingBag size={16} /> Move to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
