"use client";
import Link from "next/link";
import { CreditCard, ShieldCheck } from "lucide-react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.newsletter}>
          <span className={styles.label}>NEXUS LOYALTY</span>
          <h3 className={styles.heading}>Stay Optimized</h3>
          <p className={styles.subtext}>Join the elite for exclusive drops, performance briefs, and tactical updates.</p>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="COMM LINK @ EMAIL" required className={styles.input} />
            <button type="submit" className={styles.submitBtn}>JOIN</button>
          </form>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.column}>
            <h4 className={styles.colHeading}>Inventory</h4>
            <Link href="/shop" className={styles.link}>All Equipment</Link>
            <Link href="/shop" className={styles.link}>New Arrivals</Link>
            <Link href="/shop" className={styles.link}>Elite Series</Link>
            <Link href="/shop" className={styles.link}>Sale Components</Link>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.colHeading}>Support</h4>
            <Link href="#" className={styles.link}>Logistics & Shipping</Link>
            <Link href="#" className={styles.link}>Returns Nexus</Link>
            <Link href="#" className={styles.link}>Payment Security</Link>
            <Link href="/profile" className={styles.link}>Account Portal</Link>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.colHeading}>Nexus</h4>
            <Link href="#" className={styles.link}>Our Story</Link>
            <Link href="#" className={styles.link}>Sustainability</Link>
            <Link href="#" className={styles.link}>Store Locator</Link>
            <Link href="/admin" className={styles.link}>Central Command</Link>
          </div>
        </div>

      </div>
      
      <div className={styles.bottomBar}>
        <div className={styles.legal}>
           <span className={styles.brand}>DUALDEER &copy; {new Date().getFullYear()}</span>
           <div className={styles.legalLinks}>
             <Link href="#">Privacy Directive</Link>
             <Link href="#">Terms of Engagement</Link>
           </div>
        </div>

        <div className={styles.paymentIcons}>
           <div className={styles.paymentStrip}>
              <ShieldCheck size={16} /> <span>SSL SECURED</span>
           </div>
           <div className={styles.cards}>
              <CreditCard size={24} />
              <div className={styles.miniCard}>VISA</div>
              <div className={styles.miniCard}>MC</div>
              <div className={styles.miniCard}>UPI</div>
           </div>
        </div>
      </div>
    </footer>
  );
}
