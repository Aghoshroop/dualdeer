"use client";
import { useState } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, ShoppingBag, Tags, Settings, LogOut, Ticket, FileText, Package, Menu, X } from 'lucide-react';
import styles from './AdminLayout.module.css';
import AdminAuthWrapper from '@/components/admin/AdminAuthWrapper';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <AdminAuthWrapper>
      <div className={styles.container}>
        
        {/* Mobile Header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileBrand}>DualDeer Admin</div>
          <button className={styles.hamburgerBtn} onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <aside className={`${styles.sidebar} ${isMobileMenuOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.brand}>DualDeer Admin</div>
          <nav className={styles.nav}>
            <Link href="/admin" className={styles.link} onClick={closeMenu}><LayoutDashboard size={20} /> Dashboard</Link>
            <Link href="/admin/orders" className={styles.link} onClick={closeMenu}><Package size={20} /> Orders</Link>
            <Link href="/admin/products" className={styles.link} onClick={closeMenu}><ShoppingBag size={20} /> Products</Link>
            <Link href="/admin/seasonal" className={styles.link} onClick={closeMenu}><Tags size={20} /> Season/Home</Link>
            <Link href="/admin/categories" className={styles.link} onClick={closeMenu}><Tags size={20} /> Categories</Link>
            <Link href="/admin/coupons" className={styles.link} onClick={closeMenu}><Ticket size={20} /> Coupons</Link>
            <Link href="/admin/content" className={styles.link} onClick={closeMenu}><FileText size={20} /> Site Content</Link>
            <Link href="/admin/banners" className={styles.link} onClick={closeMenu}><LayoutDashboard size={20} /> Hero Slider</Link>
            <Link href="/admin/project-x" className={styles.link} onClick={closeMenu}><Ticket size={20} /> Mystery Bookings</Link>
            <Link href="/admin/users" className={styles.link} onClick={closeMenu}><Users size={20} /> Users</Link>
            <Link href="/admin/settings" className={styles.link} onClick={closeMenu}><Settings size={20} /> Settings</Link>
          </nav>
          <button className={styles.logoutBtn} onClick={handleLogout}><LogOut size={20} /> Logout</button>
        </aside>
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </AdminAuthWrapper>
  );
}
