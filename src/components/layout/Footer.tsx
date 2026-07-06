"use client";
import { useRef, useEffect, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import styles from "./Footer.module.css";
import { useCurrency, Currency } from "@/context/CurrencyContext";
import { ChevronDown, Check } from "lucide-react";

export default function Footer() {
  const { currency, setRegion } = useCurrency();
  const [regionOpen, setRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [footerHeight, setFooterHeight] = useState(800);
  const [windowHeight, setWindowHeight] = useState(1000);

  // Track window height
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Measure footer height for the sticky reveal container
  useEffect(() => {
    if (!innerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setFooterHeight(entry.contentRect.height);
      }
    });
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle region dropdown click outside
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

  // The sticky reveal breaks if the footer is taller than the screen, so we disable it.
  const isSticky = footerHeight < windowHeight - 20;

  // --- PARALLAX SCROLL SETUP ---
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });

  // Layer mappings (0 to 1 scroll progress)
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "0%"]);
  const lightsY = useTransform(scrollYProgress, [0, 1], ["-20%", "0%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["-30%", "0%"]);
  
  // Product floats up faster to create depth
  const rawProductY = useTransform(scrollYProgress, [0, 1], ["50%", "0%"]);
  const productY = useSpring(rawProductY, { stiffness: 100, damping: 20, mass: 0.5 });
  
  // Also rotate product slightly based on scroll
  const rawProductRotate = useTransform(scrollYProgress, [0, 1], [-10, 0]);
  const productRotate = useSpring(rawProductRotate, { stiffness: 100, damping: 20 });

  // --- MOUSE TILT FOR 3D SHIRT ---
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!innerRef.current) return;
    const rect = innerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };
  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  const tiltX = useSpring(mousePos.y * -15, { stiffness: 150, damping: 20 });
  const tiltY = useSpring(mousePos.x * 15, { stiffness: 150, damping: 20 });

  return (
    <div 
      className={styles.footerWrapper} 
      ref={containerRef}
      style={{ 
        height: isSticky ? footerHeight : 'auto',
        clipPath: isSticky ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' : 'none'
      }} 
    >
      <div 
        className={styles.footerFixed} 
        ref={innerRef}
        style={{ 
          height: isSticky ? footerHeight : 'auto',
          position: isSticky ? 'fixed' : 'relative',
          bottom: isSticky ? 0 : 'auto'
        }}
      >
        
        {/* Layer 1: Background & Grain */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className={styles.grainOverlay} />
        </motion.div>

        {/* Layer 2: Light Beams & Spotlight */}
        <motion.div style={{ y: lightsY }} className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <div className={styles.lightBeam1} />
          <div className={styles.lightBeam2} />
          <div className={styles.spotlight} />
        </motion.div>

        {/* Layer 3: Oversized Typography */}
        <motion.div style={{ y: textY }} className={styles.oversizedTextContainer}>
          <h1 className={styles.oversizedText}>DUAL<br/>DEER</h1>
        </motion.div>

        {/* Layer 5: Foreground Content */}
        <div className={styles.foregroundContent}>
          <div className={styles.gridContainer}>
            
            {/* Column 1 */}
            <motion.div 
              className={styles.column}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.brandLogoMask} />
              
              <h2 className={styles.missionStatement}>
                The vanguard of human performance.<br/>
                Engineered for the elite.
              </h2>
              
              {/* Premium CTA Button */}
              <div className={styles.premiumCtaWrapper}>
                <div className={styles.ctaGlow} />
                <button className={styles.premiumCtaBtn}>
                  <svg className={styles.svgBorder}>
                    <rect className={styles.svgBorderRect} />
                  </svg>
                  Join the Syndicate
                </button>
              </div>
            </motion.div>

            {/* Column 2 */}
            <motion.div 
              className={styles.column}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            >
              <div className={styles.columnHeader}>Collections</div>
              <motion.div 
                className={styles.divider}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              />
              <div className={styles.linkList}>
                <Link href="/speedsuits-india" className={styles.linkItem}>SPEEDSUITS</Link>
                <Link href="/gym-wear-men-india" className={styles.linkItem}>MENS WEAR</Link>
                <Link href="/shop" className={styles.linkItem}>ALL APPAREL</Link>
              </div>
            </motion.div>

            {/* Column 3 */}
            <motion.div 
              className={styles.column}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <div className={styles.columnHeader}>Directives</div>
              <motion.div 
                className={styles.divider}
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              />
              <div className={styles.linkList}>
                <Link href="/reaction-test" className={styles.linkItem}>REACTION ARENA</Link>
                <Link href="/profile" className={styles.linkItem}>OPERATIVE PORTAL</Link>
                <Link href="/policies/shipping" className={styles.linkItem}>SHIPPING POLICY</Link>
                <Link href="/policies/returns" className={styles.linkItem}>RETURN POLICY</Link>
                <Link href="/policies/privacy" className={styles.linkItem}>PRIVACY POLICY</Link>
                <Link href="/policies/terms" className={styles.linkItem}>TERMS OF SERVICE</Link>
                <Link href="/contact" className={styles.linkItem}>CONTACT SUPPORT</Link>
                <Link href="/learn" className={styles.linkItem}>KNOWLEDGE CENTER</Link>
              </div>
            </motion.div>
          </div>

          {/* Bottom Bar */}
          <motion.div 
            className={styles.bottomBar}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false, amount: 0.1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className={styles.copyright}>
              © {new Date().getFullYear()} DUALDEER. ALL RIGHTS RESERVED.
            </div>
            
            <div className={styles.regionSelector} ref={regionRef}>
              <button 
                className={`${styles.regionToggle} ${regionOpen ? styles.regionToggleActive : ''}`}
                onClick={() => setRegionOpen(!regionOpen)}
              >
                {currency === "INR" ? "INR (₹) / INDIA" : "USD ($) / INTL"}
                <ChevronDown size={14} style={{ transform: regionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
              </button>
              
              <AnimatePresence>
                {regionOpen && (
                  <motion.div 
                    className={styles.regionDropdown}
                    initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
                    transition={{ duration: 0.2 }}
                  >
                    <button 
                      className={`${styles.regionOption} ${currency === "INR" ? styles.regionActive : ""}`}
                      onClick={() => handleRegionSelect("IN", "INR")}
                    >
                      {currency === "INR" && <Check size={14} />} INDIA (INR ₹)
                    </button>
                    <button 
                      className={`${styles.regionOption} ${currency === "USD" ? styles.regionActive : ""}`}
                      onClick={() => handleRegionSelect("US", "USD")}
                    >
                      {currency === "USD" && <Check size={14} />} INTERNATIONAL (USD $)
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={styles.socials}>
              <Link href="#" className={styles.socialLink}>IG</Link>
              <Link href="#" className={styles.socialLink}>X</Link>
              <Link href="#" className={styles.socialLink}>YT</Link>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
