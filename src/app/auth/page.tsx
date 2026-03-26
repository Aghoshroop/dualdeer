"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles } from 'lucide-react';
import styles from './AuthPage.module.css';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth';

const TypewriterText = ({ text, onComplete }: { text: string; onComplete: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length + 15) {
        clearInterval(timer);
        onComplete();
      }
    }, 60);
    return () => clearInterval(timer);
  }, [text, onComplete]);

  return (
    <div className={styles.typewriterText}>
      {displayedText}<span className={styles.cursor}></span>
    </div>
  );
};

export default function AuthPage() {
  const [showGreeting, setShowGreeting] = useState(true);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        router.push('/profile');
      }
    });

    // Cinematic greeting delay
    const timer = setTimeout(() => setShowGreeting(false), 3000);
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate Magical Network Delay for the animation loop
    await new Promise(r => setTimeout(r, 1000));

    let userName = name || 'Elite User';
    if (mode === 'signup') {
      const newUser = { id: Date.now().toString(), name, email, phone, joinDate: new Date().toISOString() };
      const currentUsers = JSON.parse(localStorage.getItem('dualdeer_users') || '[]');
      localStorage.setItem('dualdeer_users', JSON.stringify([newUser, ...currentUsers]));
    } else {
      userName = email.split('@')[0] || 'Elite User';
    }

    localStorage.setItem('dualdeer_active_user', userName);

    setLoading(false);
    setIsTransitioning(true); // Triggers cinematic black screen
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userName = result.user.displayName || result.user.email?.split('@')[0] || 'Elite User';
      localStorage.setItem('dualdeer_active_user', userName);
      
      // Save full user locally for Identity Vault reference if needed
      const newUser = { id: result.user.uid, name: userName, email: result.user.email || '', phone: result.user.phoneNumber || '', joinDate: new Date().toISOString() };
      const currentUsers = JSON.parse(localStorage.getItem('dualdeer_users') || '[]');
      
      if (!currentUsers.find((u: any) => u.email === result.user.email)) {
        localStorage.setItem('dualdeer_users', JSON.stringify([newUser, ...currentUsers]));
      }

      setIsTransitioning(true);
    } catch (error) {
      console.error("Google Sign In Error", error);
    }
  };

  return (
    <div className={styles.authContainer}>
      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div 
            key="auth-content" 
            exit={{ opacity: 0, filter: 'blur(20px)' }}
            transition={{ duration: 1.5 }}
            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Background Magic Elements */}
      <motion.div 
        className={styles.ambientOrb}
        animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', top: '-20%', right: '-20%', width: '800px', height: '800px', background: 'radial-gradient(circle, rgba(157,78,221,0.2) 0%, transparent 60%)', filter: 'blur(60px)', pointerEvents: 'none' }}
      />
      
      <motion.div 
        className={styles.ambientOrb2}
        animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(90,15,200,0.15) 0%, transparent 60%)', filter: 'blur(50px)', pointerEvents: 'none' }}
      />
      
      {/* Cinematic God Rays */}
      <div className={styles.raysContainer}>
        <div className={styles.ray1}></div>
        <div className={styles.ray2}></div>
        <div className={styles.ray3}></div>
      </div>

      <AnimatePresence mode="wait">
        {showGreeting ? (
          <motion.div 
            key="greeting"
            className={styles.greeting}
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <h2>HELLO, ELITE.</h2>
            <p>Welcome to DualDeer</p>
          </motion.div>
        ) : (
          <motion.div 
            key="auth-form"
            className={styles.glassCard}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.2 }}
          >
            <Link href="/" style={{textDecoration: 'none'}}>
          <motion.div className={styles.logo} layout>
            <span>DUAL</span> <span className={styles.accentText}>DEER</span>
          </motion.div>
        </Link>
        <p className={styles.subtext}>Enter the Vault.</p>

        {/* Morphing Toggle */}
        <motion.div className={styles.toggleContainer} layout>
          <motion.div 
            className={styles.toggleIndicator}
            layout
            initial={false}
            animate={{ left: mode === 'login' ? '0.3rem' : 'calc(50% + 0.15rem)' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
          <button 
            type="button"
            className={`${styles.toggleBtn} ${mode === 'login' ? styles.active : ''}`}
            onClick={() => setMode('login')}
          >
            SIGN IN
          </button>
          <button 
            type="button"
            className={`${styles.toggleBtn} ${mode === 'signup' ? styles.active : ''}`}
            onClick={() => setMode('signup')}
          >
            CREATE ID
          </button>
        </motion.div>

        <form onSubmit={handleAuth} className={styles.form}>
          <AnimatePresence mode="popLayout" initial={false}>
            {mode === 'signup' && (
              <motion.div
                key="name-input"
                initial={{ opacity: 0, x: -30, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, x: 30, height: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={styles.inputGroup}
              >
                <label>Full Identity</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe" 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {mode === 'signup' && (
              <motion.div
                key="phone-input"
                initial={{ opacity: 0, x: 30, height: 0, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, x: -30, height: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
                className={styles.inputGroup}
              >
                <label>Private Comms (Phone)</label>
                <input 
                  type="tel" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000" 
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div className={styles.inputGroup} layout>
            <label>Secure Email</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@dualdeer.com" 
            />
          </motion.div>

          <motion.div className={styles.inputGroup} layout>
            <label>Passcode</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
            />
          </motion.div>

          <motion.button 
            layout
            type="submit" 
            className={styles.submitBtn} 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                <Sparkles size={20} />
              </motion.div>
            ) : (
              <>{mode === 'login' ? 'AUTHORIZE ACCESS' : 'MINT ELITE PASS'} <ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {mode === 'login' && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
              <span>&mdash; OR &mdash;</span>
            </div>
            
            <motion.button 
              type="button"
              onClick={handleGoogleSignIn}
              className={styles.googleBtn}
              whileHover={{ scale: 1.02, background: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className={styles.googleIcon} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </motion.button>
          </motion.div>
        )}
      </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div 
            key="black-transition"
            className={styles.transitionOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <TypewriterText 
              text={`Hello ${localStorage.getItem('dualdeer_active_user') || 'Elite'}. Welcome. I am your personal intelligence agent, Deer. I will be stationed at the right bottom corner of your screen from now on.`} 
              onComplete={() => router.push('/')} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
