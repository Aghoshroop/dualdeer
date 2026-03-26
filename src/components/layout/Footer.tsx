"use client";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.newsletter}>
          <h3 className={styles.heading}>Sign Up For Emails</h3>
          <p className={styles.subtext}>Be the first to know about new arrivals, sales & promos.</p>
          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email address" required className={styles.input} />
            <button type="submit" className={styles.submitBtn}>Submit</button>
          </form>
        </div>

        <div className={styles.linksGrid}>
          <div className={styles.column}>
            <h4 className={styles.colHeading}>Account</h4>
            <Link href="/login" className={styles.link}>My Account</Link>
            <Link href="/orders" className={styles.link}>Order Status</Link>
            <Link href="/admin" className={styles.link}>Admin Dashboard</Link>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.colHeading}>Customer Service</h4>
            <Link href="#" className={styles.link}>Returns</Link>
            <Link href="#" className={styles.link}>Shipping Rates</Link>
            <Link href="#" className={styles.link}>Contact Us</Link>
          </div>
          
          <div className={styles.column}>
            <h4 className={styles.colHeading}>About DualDeer</h4>
            <Link href="#" className={styles.link}>Careers</Link>
            <Link href="#" className={styles.link}>Sustainability</Link>
            <Link href="#" className={styles.link}>Store Locator</Link>
          </div>
        </div>

      </div>
      
      <div className={styles.bottomBar}>
        <span className={styles.brand}>DualDeer &copy; {new Date().getFullYear()}</span>
        <div className={styles.legalLinks}>
          <Link href="#">Privacy Policy</Link>
          <Link href="#">Terms of Use</Link>
        </div>
      </div>
    </footer>
  );
}
