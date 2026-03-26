"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, X } from 'lucide-react';
import styles from './DeerAgent.module.css';

export default function DeerAgent() {
  const [user, setUser] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check if user is logged in
    const activeUser = localStorage.getItem('dualdeer_active_user');
    if (activeUser) {
      setUser(activeUser);
      
      // Auto-open agent exactly once per session randomly or wait 3s after landing on home
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isMounted || !user) return null;

  return (
    <div className={styles.agentWrapper}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={styles.agentPanel}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className={styles.panelHeader}>
              <h3><Cpu size={16} /> AGENT DEER</h3>
              <button className={styles.closeBtn} onClick={() => setIsOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className={styles.message}>
              <p>Welcome back, <strong>{user}</strong>. I am fully operational and monitoring your shopping session. Let me know if you need assistance verifying Elite Client drops.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button 
        className={styles.agentOrb} 
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", delay: 1 }}
      >
        <Cpu size={24} />
        {/* Pulsing ring */}
        <div className={styles.pulseRing}></div>
      </motion.button>
    </div>
  );
}
