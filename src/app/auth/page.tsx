"use client";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight, Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, ShieldCheck, KeyRound, Crown } from 'lucide-react';
import styles from './AuthPage.module.css';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import * as metaPixel from '@/lib/metaPixel';

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
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();

  // Password strength logic
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 to 4
  };

  const strength = calculateStrength(password);
  const getStrengthColor = () => {
    if (strength === 0) return 'rgba(255,255,255,0.1)';
    if (strength === 1) return '#ef4444'; // Red
    if (strength === 2) return '#f59e0b'; // Orange
    if (strength === 3) return '#10b981'; // Green
    return '#9D4EDD'; // Purple (Max)
  };

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (strength <= 1) return 'Weak';
    if (strength === 2) return 'Fair';
    if (strength === 3) return 'Strong';
    return 'Elite';
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !isTransitioning) {
        // If already logged in, redirect directly unless we are showing transition
        const url = sessionStorage.getItem('dualdeer_return_url') || '/profile';
        sessionStorage.removeItem('dualdeer_return_url');
        router.push(url);
      }
    });
    return () => unsubscribe();
  }, [router, isTransitioning]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name || 'Elite User'
        });
        
        const newUser = { id: userCredential.user.uid, name: name || 'Elite User', email, phone, joinDate: new Date().toISOString() };
        const currentUsers = JSON.parse(localStorage.getItem('dualdeer_users') || '[]');
        localStorage.setItem('dualdeer_users', JSON.stringify([newUser, ...currentUsers]));
        localStorage.setItem('dualdeer_active_user', name || 'Elite User');
        
        metaPixel.initAdvancedMatching(email, phone);
        metaPixel.event('CompleteRegistration', { content_name: 'Email Signup' });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userName = userCredential.user.displayName || email.split('@')[0] || 'Elite User';
        localStorage.setItem('dualdeer_active_user', userName);
        metaPixel.initAdvancedMatching(email);
      }

      setLoading(false);
      setIsTransitioning(true); // Triggers cinematic black screen
    } catch (error: any) {
      console.error("Firebase Authentication Error:", error);
      alert(error.message); // Will eventually be replaced by inline error, keeping logic identical for now
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const userName = result.user.displayName || result.user.email?.split('@')[0] || 'Elite User';
      localStorage.setItem('dualdeer_active_user', userName);
      
      const newUser = { id: result.user.uid, name: userName, email: result.user.email || '', phone: result.user.phoneNumber || '', joinDate: new Date().toISOString() };
      const currentUsers = JSON.parse(localStorage.getItem('dualdeer_users') || '[]');
      
      if (!currentUsers.find((u: any) => u.email === result.user.email)) {
        localStorage.setItem('dualdeer_users', JSON.stringify([newUser, ...currentUsers]));
        metaPixel.event('CompleteRegistration', { content_name: 'Google Auth' });
      }

      metaPixel.initAdvancedMatching(result.user.email || '', result.user.phoneNumber || '');
      setIsTransitioning(true);
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        console.info("Google Sign In was cancelled by the user.");
        return;
      }
      console.error("Google Sign In Error", error);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Premium Cinematic Background */}
      <div className={styles.bgImage} />
      <div className={styles.noiseOverlay} />

      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div 
            key="auth-split" 
            className={styles.splitLayout}
            exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* LEFT PANEL - BRANDING */}
            <div className={styles.leftPanel}>
              <div className={styles.brandTop}>
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <motion.div 
                    className={styles.logoWrapper}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <Image src="/logo.png" alt="DualDeer" fill style={{ objectFit: 'contain' }} />
                  </motion.div>
                </Link>

                <div>
                  <h1 className={styles.vaultHeadline}>Enter<br/>The Vault</h1>
                  <p className={styles.brandStatement}>
                    Access the exclusive ecosystem designed for elite athletes and performance engineering.
                  </p>
                </div>
              </div>

              <div className={styles.trustIndicators}>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon}><ShieldCheck size={18} /></div>
                  <span>Secure Authentication</span>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon}><KeyRound size={18} /></div>
                  <span>Encrypted Identity</span>
                </div>
                <div className={styles.trustItem}>
                  <div className={styles.trustIcon}><Crown size={18} /></div>
                  <span>Premium Member Access</span>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - AUTHENTICATION */}
            <div className={styles.rightPanel}>
              <motion.div 
                className={styles.authSurface}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, y: [-3, 3, -3] }}
                transition={{ 
                  opacity: { duration: 0.8, ease: "easeOut", delay: 0.1 },
                  x: { duration: 0.8, ease: "easeOut", delay: 0.1 },
                  y: { repeat: Infinity, duration: 6, ease: "easeInOut" } 
                }}
              >
                <div className={styles.segmentedControl}>
                  <button 
                    type="button"
                    className={`${styles.segmentBtn} ${mode === 'login' ? styles.active : ''}`}
                    onClick={() => setMode('login')}
                  >
                    <span style={{ position: 'relative', zIndex: 10 }}>SIGN IN</span>
                    {mode === 'login' && (
                      <motion.div 
                        layoutId="auth-tab-indicator"
                        className={styles.segmentIndicator}
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      />
                    )}
                  </button>
                  <button 
                    type="button"
                    className={`${styles.segmentBtn} ${mode === 'signup' ? styles.active : ''}`}
                    onClick={() => setMode('signup')}
                  >
                    <span style={{ position: 'relative', zIndex: 10 }}>CREATE ID</span>
                    {mode === 'signup' && (
                      <motion.div 
                        layoutId="auth-tab-indicator"
                        className={styles.segmentIndicator}
                        transition={{ type: "spring", stiffness: 450, damping: 30 }}
                      />
                    )}
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuth} className={styles.form}>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {mode === 'signup' && (
                      <motion.div
                        key="name-input"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={styles.inputGroup}
                      >
                        <User className={styles.inputIcon} size={20} />
                        <input 
                          type="text" 
                          required 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={styles.inputField}
                          placeholder="Full Identity" 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="popLayout" initial={false}>
                    {mode === 'signup' && (
                      <motion.div
                        key="phone-input"
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.05 }}
                        className={styles.inputGroup}
                      >
                        <Phone className={styles.inputIcon} size={20} />
                        <input 
                          type="tel" 
                          required 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={styles.inputField}
                          placeholder="Private Comms (Phone)" 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div className={styles.inputGroup} layout="position">
                    <Mail className={styles.inputIcon} size={20} />
                    <input 
                      type="email" 
                      required 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={styles.inputField}
                      placeholder="Secure Email" 
                    />
                  </motion.div>

                  <motion.div className={styles.inputGroup} layout="position">
                    <Lock className={styles.inputIcon} size={20} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={styles.inputField}
                      placeholder="Passcode" 
                    />
                    <button 
                      type="button" 
                      className={styles.passwordToggle}
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </motion.div>

                  <AnimatePresence mode="popLayout">
                    {mode === 'signup' && (
                      <motion.div 
                        className={styles.passwordMeterContainer}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className={styles.meterBars}>
                          {[1, 2, 3, 4].map(level => (
                            <div 
                              key={level} 
                              className={styles.meterBar}
                              style={{
                                background: strength >= level ? getStrengthColor() : '',
                              }}
                            />
                          ))}
                        </div>
                        <div className={styles.meterText}>
                          <span>Security Level</span>
                          <span style={{ color: getStrengthColor(), fontWeight: 600 }}>{getStrengthLabel()}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button 
                    layout="position"
                    type="submit" 
                    className={styles.primaryBtn} 
                    disabled={loading || (mode === 'signup' && strength < 2)}
                  >
                    {loading ? (
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
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
                    layout="position"
                  >
                    <div className={styles.divider}>OR</div>
                    
                    <button 
                      type="button"
                      onClick={handleGoogleSignIn}
                      className={styles.googleBtn}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Authorize with Google
                    </button>
                  </motion.div>
                )}
              </motion.div>
            </div>
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
              text={`Hello ${typeof window !== 'undefined' ? (localStorage.getItem('dualdeer_active_user') || 'Elite') : 'Elite'}. Welcome. I am your personal intelligence agent, Deer. I will be stationed at the right bottom corner of your screen from now on.`} 
              onComplete={() => {
                const url = sessionStorage.getItem('dualdeer_return_url') || '/';
                sessionStorage.removeItem('dualdeer_return_url');
                router.push(url);
              }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
