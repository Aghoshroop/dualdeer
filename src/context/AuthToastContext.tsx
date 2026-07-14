"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Lock, X } from 'lucide-react';
import styles from './AuthToast.module.css';

interface AuthToastContextType {
  showAuthToast: (message?: string) => void;
  hideAuthToast: () => void;
}

const AuthToastContext = createContext<AuthToastContextType | undefined>(undefined);

export function AuthToastProvider({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('Please log in to continue.');
  const router = useRouter();
  const pathname = usePathname();

  const showAuthToast = (msg?: string) => {
    if (msg) setMessage(msg);
    setIsVisible(true);
    
    // Auto hide after 8 seconds if not clicked
    setTimeout(() => {
      setIsVisible(false);
    }, 8000);
  };

  const hideAuthToast = () => {
    setIsVisible(false);
  };

  const handleLoginClick = () => {
    sessionStorage.setItem('dualdeer_return_url', pathname || '/');
    setIsVisible(false);
    router.push('/auth');
  };

  return (
    <AuthToastContext.Provider value={{ showAuthToast, hideAuthToast }}>
      {children}
      
      {isVisible && (
        <div className={styles.toastOverlay}>
          <div className={styles.toastModal}>
            <button className={styles.closeBtn} onClick={hideAuthToast}>
              <X size={20} />
            </button>
            <div className={styles.iconContainer}>
              <Lock size={24} />
            </div>
            <div className={styles.textContent}>
              <h4>Authentication Required</h4>
              <p>{message}</p>
            </div>
            <button className={styles.loginBtn} onClick={handleLoginClick}>
              Login / Sign Up
            </button>
          </div>
        </div>
      )}
    </AuthToastContext.Provider>
  );
}

export function useAuthToast() {
  const context = useContext(AuthToastContext);
  if (context === undefined) {
    throw new Error('useAuthToast must be used within an AuthToastProvider');
  }
  return context;
}
