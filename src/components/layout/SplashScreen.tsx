'use client';

import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname, useSearchParams } from 'next/navigation';

function SplashScreenContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showSplash, setShowSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) {
      setShowSplash(false);
      return;
    }

    const hasVisited = sessionStorage.getItem('dualdeer_visited');

    if (hasVisited) {
      setShowSplash(false);
      return;
    }

    sessionStorage.setItem('dualdeer_visited', 'true');
    setShowSplash(true); 

    let isLoaded = document.readyState === 'complete';
    const handleLoad = () => { isLoaded = true; };
    
    if (!isLoaded) {
      window.addEventListener('load', handleLoad);
    }

    let currentProgress = 0;
    const startTime = Date.now();
    const MIN_LOAD_TIME = 4000; // Force at least 4 seconds of magical splash

    const interval = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      if (isLoaded && elapsedTime >= MIN_LOAD_TIME) {
        // Shoot to 100% fast once the site is fully loaded AND time has passed
        currentProgress += 12;
      } else {
        let expectedProgress = (elapsedTime / MIN_LOAD_TIME) * 95;
        
        if (currentProgress < expectedProgress) {
          currentProgress += Math.random() * 3 + 0.5; 
        } else {
          currentProgress += 0.1; 
        }

        if (currentProgress > 95) {
          currentProgress = 95;
        }
      }

      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        clearInterval(interval);
        setIsReady(true);
      } else {
        setProgress(currentProgress);
      }
    }, 50);

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', handleLoad);
    };
  }, [pathname, searchParams]); 

  const handleEnter = () => {
    setIsEntering(true);
    // Hold for the zoom mask effect, then unmount
    setTimeout(() => {
      setShowSplash(false);
    }, 1200);
  };

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
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] } 
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999999,
            backgroundColor: '#030008', // Deep space dark base
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            margin: 0,
            padding: 0,
            willChange: 'transform'
          }}
        >
          {/* Magical Multi-Gradient Mesh Background */}
          <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
            {/* Top Left Deep Purple */}
            <motion.div
              animate={{ 
                x: ['-10%', '10%', '-20%', '-10%'], 
                y: ['-10%', '20%', '-10%', '-10%'],
                scale: [1, 1.2, 0.9, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vh',
                background: 'radial-gradient(circle, rgba(123, 47, 247, 0.4) 0%, rgba(var(--background-rgb), 0) 70%)',
                filter: 'blur(80px)', borderRadius: '50%'
              }}
            />
            {/* Bottom Right Electric Magenta */}
            <motion.div
              animate={{ 
                x: ['10%', '-20%', '10%', '10%'], 
                y: ['10%', '-10%', '20%', '10%'],
                scale: [1, 1.4, 1, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute', bottom: '-20%', right: '-10%', width: '70vw', height: '70vh',
                background: 'radial-gradient(circle, rgba(255, 0, 150, 0.25) 0%, rgba(var(--background-rgb), 0) 70%)',
                filter: 'blur(90px)', borderRadius: '50%'
              }}
            />
            {/* Center Core Blue/Indigo */}
            <motion.div
              animate={{ 
                scale: [0.8, 1.5, 0.8],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 90, 180]
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: 'absolute', top: '20%', left: '20%', width: '60vw', height: '60vw',
                background: 'radial-gradient(circle, rgba(0, 100, 255, 0.2) 0%, rgba(var(--background-rgb), 0) 60%)',
                filter: 'blur(100px)', borderRadius: '50%'
              }}
            />
            {/* Dynamic Starry Dust Overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
              mixBlendMode: 'screen',
              opacity: 0.05
            }} />
          </div>

          <motion.div
            initial={{ scale: 1.1, opacity: 0, filter: 'blur(20px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 0.9, opacity: 0, filter: 'blur(10px)', transition: { duration: 0.4, ease: "easeIn" } }} // Faster internal exit
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            {/* Glowing Filling Logo */}
            <motion.div
              initial={{ rotateY: 90, opacity: 0 }}
              animate={{ rotateY: 0, opacity: isEntering ? 0 : 1 }}
              transition={{ duration: 1.8, ease: "easeOut", delay: 0.2 }}
              style={{
                position: 'relative', marginBottom: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
                width: '130px', height: '130px'
              }}
            >
              <motion.div
                animate={{ 
                  y: [0, -12, 0],
                  filter: [
                    'drop-shadow(0px 0px 15px rgba(123,47,247,0.4))',
                    'drop-shadow(0px 0px 35px rgba(123,47,247,0.9))',
                    'drop-shadow(0px 0px 15px rgba(123,47,247,0.4))'
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ width: '100%', height: '100%', position: 'relative' }}
              >
                {/* Background Unfilled Logo */}
                <img 
                  src="/favicon.ico" 
                  alt="DualDeer Background" 
                  style={{ 
                    position: 'absolute', inset: 0, 
                    width: '100%', height: '100%', objectFit: 'contain',
                    filter: 'brightness(0) invert(1) opacity(0.15)' 
                  }} 
                />
                
                {/* Foreground Filled Logo */}
                <img 
                  src="/favicon.ico" 
                  alt="DualDeer Filled" 
                  style={{ 
                    position: 'absolute', inset: 0, 
                    width: '100%', height: '100%', objectFit: 'contain',
                    filter: 'brightness(0) invert(1)',
                    clipPath: `inset(${100 - progress}% 0 0 0)`, 
                    transition: 'clip-path 0.1s ease-out' 
                  }} 
                />
              </motion.div>
            </motion.div>

            {/* Brand Typography */}
            <motion.h1
              initial="hidden"
              animate={isEntering ? "zoom" : "visible"}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.3 }
                },
                zoom: {
                  scale: 120, // Massive zoom
                  opacity: 0,
                  transition: { duration: 1.1, ease: [0.76, 0, 0.24, 1] }
                }
              }}
              style={{
                color: '#ffffff',
                fontSize: 'clamp(2.5rem, 8vw, 6rem)',
                fontWeight: '900',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-logo, sans-serif)',
                textShadow: '0 0 30px rgba(123,47,247,0.6), 0 0 10px rgba(255,255,255, 0.4)',
                margin: '0', textAlign: 'center',
                display: 'flex', justifyContent: 'center',
                transformOrigin: '42% 50%' 
              }}
            >
              {"DUAL DEER".split("").map((char, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: { opacity: 0, y: 40, filter: 'blur(10px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: "spring", damping: 12, stiffness: 200 } },
                    zoom: { opacity: 1 } 
                  }}
                  style={{ display: "inline-block", whiteSpace: "pre" }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              animate={{ opacity: isEntering ? 0 : 0.8 }}
              transition={{ duration: 0.8 }}
              style={{
                color: '#e0d4fc',
                fontSize: 'clamp(0.8rem, 2vw, 1.1rem)',
                fontWeight: '600', letterSpacing: '0.5em', textTransform: 'uppercase',
                margin: '1rem 0 0 0', textShadow: '0 0 10px rgba(123,47,247,0.5)'
              }}
            >
              Luxury Athleisure
            </motion.p>

            {/* Interaction Area (Progress Bar or Enter Button) */}
            <div style={{ marginTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', height: '80px' }}>
              <AnimatePresence mode="wait">
                {!isReady ? (
                  <motion.div 
                    key="progress-bar"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
                  >
                    {/* Progress Text */}
                    <div style={{ position: 'relative', marginBottom: '1.2rem' }}>
                      <motion.div
                        style={{
                          color: '#ffffff', fontSize: '0.9rem', fontWeight: '700',
                          letterSpacing: '0.3em', fontFamily: 'monospace',
                          textShadow: '0 0 15px rgba(123,47,247,1)'
                        }}
                      >
                        {Math.floor(progress)}%
                      </motion.div>
                      <motion.div 
                        animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                          position: 'absolute', inset: '-10px', background: 'rgba(123,47,247,0.3)',
                          filter: 'blur(10px)', borderRadius: '50%', zIndex: -1
                        }}
                      />
                    </div>

                    {/* Progress Line */}
                    <div
                      style={{
                        height: '1px',
                        background: 'rgba(255,255,255, 0.1)',
                        width: '20rem', maxWidth: '75vw',
                        position: 'relative', overflow: 'visible',
                        borderRadius: '2px'
                      }}
                    >
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: "easeOut", duration: 0.15 }}
                        style={{
                          position: 'absolute', top: '-1px', bottom: '-1px', left: 0,
                          background: 'linear-gradient(90deg, transparent, #ffffff)',
                          boxShadow: '0 0 15px 2px rgba(123,47,247,0.8), 0 0 5px 1px rgba(255,255,255, 0.8)',
                          borderRadius: '2px'
                        }}
                      >
                        <motion.div 
                          animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.5, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                          style={{
                            position: 'absolute', right: 0, top: '50%', 
                            x: "50%", y: "-50%",
                            width: '4px', height: '4px', background: '#ffffff', borderRadius: '50%',
                            boxShadow: '0 0 15px 4px rgba(255,255,255, 0.9), 0 0 30px 10px rgba(123,47,247,0.8)'
                          }}
                        />
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  !isEntering && (
                    <motion.div
                      key="enter-btn"
                      initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      exit={{ opacity: 0, scale: 1.5, filter: 'blur(10px)' }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    >
                      <button
                        onClick={handleEnter}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          color: '#ffffff',
                          padding: '1rem 3.5rem',
                          borderRadius: '50px',
                          fontSize: '0.85rem',
                          fontWeight: 700,
                          letterSpacing: '4px',
                          textTransform: 'uppercase',
                          cursor: 'pointer',
                          boxShadow: '0 0 25px rgba(123,47,247,0.3), inset 0 0 10px rgba(255,255,255,0.1)',
                          transition: 'all 0.3s ease',
                          outline: 'none'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                          e.currentTarget.style.boxShadow = '0 0 35px rgba(123,47,247,0.6), inset 0 0 15px rgba(255,255,255,0.2)';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                          e.currentTarget.style.boxShadow = '0 0 25px rgba(123,47,247,0.3), inset 0 0 10px rgba(255,255,255,0.1)';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        Enter Experience
                      </button>
                    </motion.div>
                  )
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function SplashScreen() {
  return (
    <Suspense fallback={null}>
      <SplashScreenContent />
    </Suspense>
  );
}
