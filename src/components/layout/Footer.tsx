"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import styles from "./Footer.module.css";
import { useCurrency, Currency } from "@/context/CurrencyContext";

export default function Footer() {
  const { currency, setRegion } = useCurrency();
  const [regionOpen, setRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(event.target as Node)) {
        setRegionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRegionSelect = (code: string, curr: Currency) => {
    setRegion(code, curr);
    setRegionOpen(false);
  };
  return (
    <footer className={styles.footer}>
      


      {/* Massive Cinematic Panning Typography */}
      <div className={styles.heroSection}>
        <h1 className={styles.massiveText}>DUALDEER</h1>
        <div className={styles.taglineContainer}>
          <span className={styles.tagline}>THE VANGUARD OF HUMAN PERFORMANCE</span>
          <span className={styles.taglineLine}></span>
        </div>
      </div>

      {/* Razor-Sharp Editorial Grid */}
      <div className={styles.gridMatrix}>
        
        {/* Left: Syndicate Terminal */}
        <div className={styles.matrixColumn}>
          <span className={styles.matrixTitle}>01 // SYNDICATE NETWORK</span>
          <p className={styles.matrixDesc}>
            Intercept classified prototype drops and elite performance briefs. No spam.
          </p>
          <form className={styles.sleekForm} onSubmit={e => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="ENTER COMM LINK..." 
              className={styles.sleekInput} 
            />
            <button className={styles.sleekBtn}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>

        {/* Right: Magnetic Hover Links */}
        <div className={styles.matrixColumn}>
          <span className={styles.matrixTitle}>02 // DIRECTIVES</span>
          <div className={styles.linkList}>
            <MagneticHoverLink href="/shop" label="THE COLLECTION" />
            <MagneticHoverLink href="/reaction-test" label="REACTION ARENA" />
            <MagneticHoverLink href="/profile" label="OPERATIVE PORTAL" />
          </div>
        </div>

      </div>

      {/* Extreme Minimal Bottom Bar */}
      <div className={styles.bottomBar}>
        <div className={styles.copyright}>© {new Date().getFullYear()} DUALDEER. SYSTEM ACTIVE.</div>
        
        {/* Region Selector */}
        <div className={styles.regionSelector} ref={regionRef}>
          <button 
            className={styles.regionToggle}
            onClick={() => setRegionOpen(!regionOpen)}
          >
            {currency === "INR" ? "🇮🇳 INDIA (INR)" : "🌎 INTERNATIONAL (USD)"}
          </button>
          
          <AnimatePresence>
            {regionOpen && (
              <motion.div 
                className={styles.regionDropdown}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <button 
                  className={`${styles.regionOption} ${currency === "INR" ? styles.regionActive : ""}`}
                  onClick={() => handleRegionSelect("IN", "INR")}
                >
                  🇮🇳 INDIA (INR)
                </button>
                <button 
                  className={`${styles.regionOption} ${currency === "USD" ? styles.regionActive : ""}`}
                  onClick={() => handleRegionSelect("US", "USD")}
                >
                  🌎 INTERNATIONAL (USD)
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={styles.socials}>
          <Link href="#" className={styles.socialLink}>INSTAGRAM</Link>
          <Link href="#" className={styles.socialLink}>TWITTER</Link>
        </div>
      </div>
    </footer>
  );
}

// Magnetic Link 
function MagneticHoverLink({ href, label }: { href: string, label: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const springY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouse = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((e.clientX - centerX) * 0.2); // Subtle magnetic pull
    y.set((e.clientY - centerY) * 0.2);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.a 
      href={href}
      ref={ref}
      className={styles.magneticHoverLink}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      style={{ x: springX, y: springY }}
    >
      <span className={styles.linkArrow}>↗</span>
      <span className={styles.linkLabel}>{label}</span>
    </motion.a>
  );
}
