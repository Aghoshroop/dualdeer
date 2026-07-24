"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Home, Crown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './BottomNav.module.css';

const DotGrid = ({ size = 24, strokeWidth = 1.5, className = "" }: any) => {
  const r = strokeWidth * 0.9;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="5" cy="5" r={r} />
      <circle cx="12" cy="5" r={r} />
      <circle cx="19" cy="5" r={r} />
      <circle cx="5" cy="12" r={r} />
      <circle cx="12" cy="12" r={r} />
      <circle cx="19" cy="12" r={r} />
      <circle cx="5" cy="19" r={r} />
      <circle cx="12" cy="19" r={r} />
      <circle cx="19" cy="19" r={r} />
    </svg>
  );
};

const CustomCart = ({ size = 24, strokeWidth = 1.5, className = "" }: any) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth={strokeWidth} 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <rect x="4" y="8" width="16" height="13" rx="2" ry="2" />
    <path d="M8 8V5a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: '/', icon: Home, label: 'Home', isExact: true },
    { href: '/shop', icon: DotGrid, label: 'Shop', isExact: false },
    { href: '/elite', icon: Crown, label: 'ELITE', isExact: false, isCenter: true },
    { href: '/auth', icon: User, label: 'Profile', isExact: false },
    { href: '/cart', icon: CustomCart, label: 'Cart', isCart: true, isExact: false },
  ];

  return (
    <nav className={styles.bottomNavContainer} data-pathname={pathname}>
      
      {/* Curved SVG Background */}
      <div className={styles.navCurveBg}>
        <div className={styles.navCurveLeft}></div>
        <div className={styles.navCurveCenter}>
          <svg width="100%" height="100%" viewBox="0 0 160 90" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                 <stop offset="0%" stopColor="rgba(196, 115, 255, 1)" />
                 <stop offset="35%" stopColor="rgba(196, 115, 255, 1)" />
                 <stop offset="50%" stopColor="#d4af37" />
                 <stop offset="65%" stopColor="rgba(196, 115, 255, 1)" />
                 <stop offset="100%" stopColor="rgba(196, 115, 255, 1)" />
              </linearGradient>
              <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur2" />
                  <feMergeNode in="blur1" />
                </feMerge>
              </filter>
            </defs>
            {/* Flawless true-circle cutout path */}
            <path className={styles.svgFill} d="M 0,25.75 L 35.1,25.75 A 10 10 0 0 1 44.8 33.58 A 36 36 0 0 0 115.2 33.58 A 10 10 0 0 1 124.9 25.75 L 160,25.75 L 160,90 L 0,90 Z" />
            <path d="M 0,25.75 L 35.1,25.75 A 10 10 0 0 1 44.8 33.58 A 36 36 0 0 0 115.2 33.58 A 10 10 0 0 1 124.9 25.75 L 160,25.75" fill="none" stroke="url(#goldGlow)" strokeWidth="1.5" filter="url(#neonGlow)" opacity="0.8" />
            <path d="M 0,25.75 L 35.1,25.75 A 10 10 0 0 1 44.8 33.58 A 36 36 0 0 0 115.2 33.58 A 10 10 0 0 1 124.9 25.75 L 160,25.75" fill="none" stroke="url(#goldGlow)" strokeWidth="1.5" />
          </svg>
        </div>
        <div className={styles.navCurveRight}></div>
      </div>

      <div className={styles.navItemsRow}>
        {navItems.map((item) => {
          const isActive = item.isExact ? pathname === item.href : pathname?.startsWith(item.href);
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <Link href={item.href} key={item.href} className={`${styles.navItemCenter} ${isActive ? styles.active : ''}`}>
                <div className={styles.eliteFabGlowEffect}></div>
                <div className={styles.eliteFabGoldRing}>
                  <div className={styles.eliteFabInnerDark}>
                    <Icon size={24} strokeWidth={1.5} className={styles.eliteCrown} />
                  </div>
                </div>
                <div className={styles.eliteLabelContainer}>
                  <span className={styles.eliteLabelText}>{item.label}</span>
                  <div className={styles.eliteLabelGlowLine}></div>
                </div>
              </Link>
            );
          }

          return (
            <Link href={item.href} key={item.href} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
              <div className={styles.iconCircle}>
                <Icon size={16} strokeWidth={isActive ? 1.5 : 1} className={styles.iconSVG} />
                {item.isCart && mounted && cartCount > 0 && (
                  <span className={styles.cartBadge}>{cartCount > 99 ? '99+' : cartCount}</span>
                )}
              </div>
              <span className={styles.iconLabel}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
