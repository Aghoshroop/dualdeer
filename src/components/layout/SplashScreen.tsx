'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';

export default function SplashScreen() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSplash, setShowSplash] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setShowSplash(false);
      return;
    }

    const hasVisited = sessionStorage.getItem('dualdeer_visited');
    // Set duration to at least 5 seconds per instructions
    let splashDuration = 5000; 

    if (!hasVisited) {
      setIsFirstLoad(true);
      splashDuration = 6000; // 6 seconds for the very first entry
      sessionStorage.setItem('dualdeer_visited', 'true');
    }

    setShowSplash(true); 

    const timer = setTimeout(() => {
      setShowSplash(false);
      setIsFirstLoad(false); 
    }, splashDuration);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]); 

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          key="splash-screen-overlay"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            transition: { duration: 0.8, ease: "easeInOut" } 
          }}
          style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999999,
            backgroundColor: '#ffffff', // BRIGHT fully white background
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}
        >
          {/* Extremely Bright & Animated Ambient Glows */}
          <motion.div
            initial={{ opacity: 0, scale: 0.2, rotate: 0 }}
            animate={{ 
              opacity: [0.4, 0.8, 0.4], 
              scale: [1, 1.5, 1],
              rotate: [0, 90, 180] 
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              top: '15%',
              right: '15%',
              width: '50vh',
              height: '50vh',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(123, 47, 247, 0.2) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(60px)'
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3], 
              scale: [1.2, 1, 1.2],
              rotate: [0, -90, -180] 
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            style={{
              position: 'absolute',
              bottom: '15%',
              left: '15%',
              width: '60vh',
              height: '60vh',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(90, 15, 200, 0.15) 0%, rgba(255,255,255,0) 70%)',
              filter: 'blur(80px)'
            }}
          />

          {/* Core Splash Content Container */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              ease: [0.22, 1, 0.36, 1] 
            }}
            style={{
              position: 'relative',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            {/* Highly Animated Logo Array */}
            <motion.div
              initial={{ rotateY: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotateY: 0, scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{
                position: 'relative',
                marginBottom: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '140px',
                height: '140px'
              }}
            >
              {/* Continuous Floating/Pulsing Animation for the Logo */}
              <motion.div
                animate={{ y: [0, -15, 0], scale: [1, 1.05, 1], filter: ['drop-shadow(0px 10px 20px rgba(123, 47, 247, 0.2))', 'drop-shadow(0px 20px 30px rgba(123, 47, 247, 0.6))', 'drop-shadow(0px 10px 20px rgba(123, 47, 247, 0.2))'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '100%', height: '100%' }}
              >
                <img
                  src="/favicon.ico"
                  alt="DualDeer Premium Splash"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </motion.div>
            </motion.div>

            {/* Bright, Crisp Brand Typography */}
            <motion.h1
              initial={{ opacity: 0, y: 20, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.3em" }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
              style={{
                color: '#111111', // Stark black for high contrast brightness
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-logo, sans-serif)',
                textShadow: '0 4px 20px rgba(123, 47, 247, 0.15)',
                margin: '0',
                textAlign: 'center'
              }}
            >
              DualDeer
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, filter: "blur(10px)" }}
              animate={{ opacity: 0.8, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.8 }}
              style={{
                color: '#5A0FC8', // Deep Violet accent
                fontSize: 'clamp(0.75rem, 2vw, 1.1rem)',
                fontWeight: '600',
                letterSpacing: '0.4em',
                marginTop: '1rem',
                textTransform: 'uppercase',
                margin: '1rem 0 0 0'
              }}
            >
              Luxury Athleisure
            </motion.p>

            {/* Highly Animated Bright Loading Line */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "100%", opacity: 1 }}
              transition={{ duration: 1.5, delay: 1, ease: "easeInOut" }}
              style={{
                height: '2px',
                background: 'linear-gradient(90deg, transparent, rgba(123, 47, 247, 0.2), transparent)',
                marginTop: '3.5rem',
                width: '18rem',
                maxWidth: '80vw',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: '50%',
                  background: 'linear-gradient(90deg, transparent, #7B2FF7, transparent)',
                  boxShadow: '0 0 10px #7B2FF7',
                  filter: 'blur(1px)'
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
