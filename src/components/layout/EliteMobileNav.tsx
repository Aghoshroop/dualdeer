"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import styles from './EliteMobileNav.module.css';

interface EliteMobileNavProps {
  onSearchClick: () => void;
}

export default function EliteMobileNav({ onSearchClick }: EliteMobileNavProps) {
  const router = useRouter();
  
  return (
    <div className={styles.wrapper}>
      {/* Thin metallic gold hairline at the bottom edge */}
      <div className={styles.shimmerLine} />

      <motion.nav 
        className={styles.contentContainer}
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.leftSection}>
          <button onClick={() => router.back()} className={styles.backButton} aria-label="Go Back">
            <ArrowLeft size={22} strokeWidth={1} />
          </button>
        </div>

        <div className={styles.centerSection}>
          <Link href="/" className={styles.logoWrapper}>
            <div className={styles.logoIcon} />
            <span className={styles.eliteText}>DUAL DEER</span>
          </Link>
        </div>

        <div className={styles.rightSection}>
          <button className={styles.profileButton} aria-label="Search" onClick={onSearchClick}>
            <Search size={18} strokeWidth={1} />
          </button>
        </div>
      </motion.nav>
    </div>
  );
}
