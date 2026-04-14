"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, User, Home, Grip, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <nav className={styles.bottomNav}>
      <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
        <Home size={22} strokeWidth={pathname === '/' ? 2 : 1.5} />
        <span>Home</span>
      </Link>
      
      <Link href="/shop" className={`${styles.navItem} ${pathname?.startsWith('/shop') ? styles.active : ''}`}>
        <Grip size={22} strokeWidth={pathname?.startsWith('/shop') ? 2 : 1.5} />
        <span>Shop</span>
      </Link>
      
      <Link href="/reaction-test" className={`${styles.navItem} ${pathname?.startsWith('/reaction-test') ? styles.active : ''}`}>
        <Zap size={22} strokeWidth={pathname?.startsWith('/reaction-test') ? 2 : 1.5} />
        <span>Test</span>
      </Link>
      
      <Link href="/auth" className={`${styles.navItem} ${pathname?.startsWith('/profile') || pathname?.startsWith('/auth') ? styles.active : ''}`}>
        <User size={22} strokeWidth={pathname?.startsWith('/profile') || pathname?.startsWith('/auth') ? 2 : 1.5} />
        <span>Profile</span>
      </Link>
      
      <Link href="/project-x" className={`${styles.navItem} ${pathname?.startsWith('/project-x') ? styles.active : ''}`} style={{ color: 'var(--red-500)' }}>
        <Zap size={22} strokeWidth={pathname?.startsWith('/project-x') ? 2 : 1.5} />
        <span>DROP</span>
      </Link>
      
      <Link href="/cart" className={`${styles.navItem} ${pathname?.startsWith('/cart') ? styles.active : ''} ${styles.cartTab}`}>
        <ShoppingBag size={22} strokeWidth={pathname?.startsWith('/cart') ? 2 : 1.5} />
        <span>Cart</span>
        {mounted && cartCount > 0 && (
          <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
        )}
      </Link>
    </nav>
  );
}
