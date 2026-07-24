"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, Crown, Compass, Sun, Moon, User, Bell, ShoppingBag } from 'lucide-react';
import styles from './EliteDesktopNav.module.css';
import { usePathname } from 'next/navigation';

interface EliteDesktopNavProps {
  onSearchClick: () => void;
  theme: string;
  onThemeToggle: () => void;
  unreadNotifCount: number;
  onNotifClick: () => void;
  cartCount: number;
}

export default function EliteDesktopNav({
  onSearchClick,
  theme,
  onThemeToggle,
  unreadNotifCount,
  onNotifClick,
  cartCount
}: EliteDesktopNavProps) {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      {/* 
        Signature Animated Element: 
        A single continuous gold hairline that travels across the bottom of the navbar.
      */}
      <div className={styles.shimmerLine} />

      {/* Promo Bar - Minimal, almost invisible */}
      <div className={styles.promoBar}>
        <span className={styles.promoText}>Complimentary Shipping & Returns on all orders</span>
      </div>

      {/* Main Navigation Row - Architectural & Symmetrical */}
      <nav className={styles.navBar}>
        
        {/* Left: flex-1 */}
        <div className={styles.leftSection}>
          <Link href="/collections" className={`${styles.navLinkItem} ${pathname === '/collections' ? styles.active : ''}`}>
            <Compass size={24} strokeWidth={0.75} className={styles.navLinkIcon} />
            <span className={styles.navLinkText}>DISCOVER</span>
            {pathname === '/collections' && (
              <>
                <div className={styles.activeLine} />
                <div className={styles.activeDot} />
              </>
            )}
          </Link>
          
          <Link href="/elite" className={`${styles.navLinkItem} ${pathname === '/elite' ? styles.active : ''}`}>
            <Crown size={24} strokeWidth={0.75} className={styles.navLinkIcon} />
            <span className={styles.navLinkText}>EXCLUSIVE</span>
            {pathname === '/elite' && (
              <>
                <div className={styles.activeLine} />
                <div className={styles.activeDot} />
              </>
            )}
          </Link>
        </div>

        {/* Center: The Hero - Massive Typography & Emblem */}
        <div className={styles.centerSection}>
          <Link href="/" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textDecoration: 'none', gap: '16px' }}>
            <div className={styles.logoIcon} />
            <span className={styles.eliteText}>DUAL DEER</span>
          </Link>
        </div>

        {/* Right: flex-1, aligned right */}
        <div className={styles.rightSection}>
          <button aria-label="Search" className={styles.iconBtn} onClick={onSearchClick}>
            <Search size={24} strokeWidth={0.75} />
          </button>
          
          <button aria-label="Toggle Theme" className={styles.iconBtn} onClick={onThemeToggle}>
            {theme === 'dark' ? <Sun size={24} strokeWidth={0.75} /> : <Moon size={24} strokeWidth={0.75} />}
          </button>

          <Link href="/auth">
            <button aria-label="Account" className={styles.iconBtn}>
              <User size={24} strokeWidth={0.75} />
            </button>
          </Link>
          
          <button aria-label="Notifications" className={styles.iconBtn} onClick={onNotifClick}>
            <Bell size={24} strokeWidth={0.75} />
            {unreadNotifCount > 0 && (
              <span className={styles.badge}>{unreadNotifCount}</span>
            )}
          </button>
          
          <Link href="/cart">
            <button aria-label="Cart" className={styles.iconBtn}>
              <ShoppingBag size={24} strokeWidth={0.75} />
              {cartCount > 0 && (
                <span className={styles.badge}>{cartCount}</span>
              )}
            </button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
