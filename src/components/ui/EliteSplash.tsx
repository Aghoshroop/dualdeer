import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './EliteSplash.module.css';
import { EliteSplashSettings } from '@/lib/firebaseUtils';

interface EliteSplashProps {
  settings: EliteSplashSettings | null;
  onComplete: () => void;
}

export default function EliteSplash({ settings, onComplete }: EliteSplashProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // If no settings or inactive, skip splash immediately
    if (!settings || !settings.isActive) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const duration = settings.duration || 3000;
    
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 1000); // allow exit animation to finish
    }, duration);

    return () => clearTimeout(timer);
  }, [settings, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={styles.splashContainer}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
        >
          {/* Dynamic Background */}
          {settings?.mediaUrl ? (
            settings.mediaType === 'video' ? (
              <video 
                src={settings.mediaUrl} 
                className={styles.mediaBackground} 
                autoPlay 
                muted 
                loop 
                playsInline
              />
            ) : (
              <img 
                src={settings.mediaUrl} 
                className={styles.mediaBackground} 
                alt="Elite Background" 
              />
            )
          ) : (
            // Placeholder dark animation if no media provided
            <div className={styles.placeholderBackground} />
          )}

          {/* Overlay to ensure text readability */}
          <div className={styles.overlay} />

          {/* Dynamic Text */}
          <motion.div 
            className={styles.textContainer}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          >
            <h1 className={styles.splashText}>{settings?.text || "L'ÉLITE"}</h1>
            <div className={styles.loadingBar}>
              <motion.div 
                className={styles.loadingProgress}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: (settings?.duration || 3000) / 1000, ease: "linear" }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
