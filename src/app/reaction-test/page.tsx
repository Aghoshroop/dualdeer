"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { getReactionTestSetting, getUserReactionScore, submitReactionScoreV2, getReactionScoresForCycle, ReactionScoreV2 } from '@/lib/firebaseUtils';
import styles from './ReactionTest.module.css';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';

type TestState = 'auth_check' | 'unauthorized' | 'rules' | 'playing' | 'result' | 'leaderboard';
type PlayState = 'idle' | 'waiting' | 'ready' | 'false_start' | 'scored';

export default function ReactionTestV2() {
  const router = useRouter();
  
  // App State
  const [appState, setAppState] = useState<TestState>('auth_check');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Game Config & Data
  const [cycleId, setCycleId] = useState<string>('');
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [userScore, setUserScore] = useState<ReactionScoreV2 | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReactionScoreV2[]>([]);
  
  // Play State
  const [playState, setPlayState] = useState<PlayState>('idle');
  const [attempts, setAttempts] = useState<number[]>([]);
  const [currentAttemptTime, setCurrentAttemptTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Authenticate & Load Rules
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAppState('unauthorized');
        sessionStorage.setItem('dualdeer_return_url', '/reaction-test');
      } else {
        setCurrentUser(user);
        await initGame(user.uid);
      }
    });
    return () => {
      unsub();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const initGame = async (uid: string) => {
    const setting = await getReactionTestSetting();
    if (!setting) {
       console.error("Game not initialized by admin.");
       return;
    }
    setCycleId(setting.activeCycleId);
    setGameActive(setting.gameActive);
    
    if (!setting.gameActive) {
       await loadLeaderboard(setting.activeCycleId);
       setAppState('leaderboard');
       return;
    }

    const previousScore = await getUserReactionScore(uid, setting.activeCycleId);
    if (previousScore) {
       setUserScore(previousScore);
       await loadLeaderboard(setting.activeCycleId);
       setAppState('leaderboard'); // already played
       return;
    }

    setAppState('rules');
  };

  const loadLeaderboard = async (cid: string) => {
    const data = await getReactionScoresForCycle(cid);
    setLeaderboard(data);
  };

  const startPlaying = () => {
    setAppState('playing');
    setPlayState('idle');
  };

  const beginAttempt = () => {
    setPlayState('waiting');
    const delay = Math.random() * 2500 + 1500; // 1.5 to 4 seconds
    
    timeoutRef.current = setTimeout(() => {
      setPlayState('ready');
      startTimeRef.current = performance.now();
    }, delay);
  };

  const handleTapAreaClick = () => {
    if (playState === 'idle') {
      beginAttempt();
    } else if (playState === 'waiting') {
      // False start!
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setPlayState('false_start');
    } else if (playState === 'ready') {
      // Valid hit!
      const elapsed = performance.now() - startTimeRef.current;
      
      // Too fast to be human (<80ms) is treated as a false start / anticipation by professional standards
      if (elapsed < 80) {
        setPlayState('false_start');
        return;
      }

      setCurrentAttemptTime(elapsed);
      setPlayState('scored');
      const newAttempts = [...attempts, elapsed];
      setAttempts(newAttempts);

      if (newAttempts.length >= 3) {
        setTimeout(() => {
          finishGame(newAttempts);
        }, 1500);
      }
    } else if (playState === 'false_start' || playState === 'scored') {
      // Reset for next attempt or do nothing if finished
      if (attempts.length < 3) {
         beginAttempt();
      }
    }
  };

  const finishGame = async (finalAttempts: number[]) => {
    const best = Math.min(...finalAttempts);
    const scoreData: Omit<ReactionScoreV2, 'id' | 'createdAt'> = {
      userId: currentUser.uid,
      name: currentUser.displayName || 'Elite Athlete',
      attempt1: finalAttempts[0],
      attempt2: finalAttempts[1],
      attempt3: finalAttempts[2],
      bestTime: Math.round(best),
      cycleId
    };
    await submitReactionScoreV2(scoreData);
    setUserScore(scoreData as ReactionScoreV2);
    setAppState('result');
    await loadLeaderboard(cycleId);
  };

  const getTier = (ms: number) => {
    if (ms < 180) return 'ELITE';
    if (ms >= 180 && ms < 240) return 'PRO';
    if (ms >= 240 && ms < 300) return 'COMPETITIVE';
    return 'SLOW';
  };

  return (
    <div className={styles.container}>
      <div className={styles.navBarSpacer} />
      
      <Link href="/" className={styles.backBtn}>
        <ChevronLeft size={20} /> EXIT
      </Link>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          
          {appState === 'auth_check' && (
             <motion.div key="auth" className={styles.instructionBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <h2>Loading Game Engine...</h2>
             </motion.div>
          )}

          {appState === 'unauthorized' && (
             <motion.div key="unauth" className={styles.instructionBox} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
               <h1 className={styles.title}>RESTRICTED ACCESS</h1>
               <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>You must sign in to play the Reaction Test.</p>
               <button className={styles.champagneBtn} onClick={() => router.push('/auth')}>SIGN IN TO PROCEED</button>
             </motion.div>
          )}

          {appState === 'rules' && (
             <motion.div key="rules" className={styles.instructionBox} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
               <h1 className={styles.title}>RULES</h1>
               <ul style={{ textAlign: 'left', margin: '0 auto 2rem auto', maxWidth: '400px', fontSize: '1.2rem', lineHeight: '2rem', color: 'var(--text-muted)' }}>
                 <li>You get <strong>3 attempts</strong>.</li>
                 <li>Only your <strong>best score</strong> counts.</li>
                 <li>One participation <strong>per week</strong>.</li>
                 <li>False taps are <strong>invalid</strong>.</li>
                 <li>When screen turns green, TAP instantly!</li>
               </ul>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                 <button className={styles.champagneBtn} onClick={startPlaying} style={{ width: '100%', maxWidth: '300px' }}>START TEST</button>
                 <button className={styles.champagneBtnOutline} onClick={async () => {
                   await loadLeaderboard(cycleId);
                   setAppState('leaderboard');
                 }} style={{ width: '100%', maxWidth: '300px' }}>VIEW LEADERBOARD</button>
               </div>
             </motion.div>
          )}

          {appState === 'playing' && (
            <motion.div 
               key="playing" 
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }} 
               exit={{ opacity: 0 }}
               style={{
                 width: '100%',
                 height: '60vh',
                 display: 'flex',
                 flexDirection: 'column',
                 alignItems: 'center',
                 justifyContent: 'center',
                 background: playState === 'ready' ? 'var(--accent-color)' : playState === 'false_start' ? 'var(--red-500)' : 'transparent',
                 border: `2px solid ${playState === 'ready' ? 'var(--accent-color)' : 'var(--card-border)'}`,
                 borderRadius: '20px',
                 cursor: 'pointer',
                 transition: 'background-color 0.1s ease',
                 position: 'relative'
               }}
               onMouseDown={handleTapAreaClick}
               onTouchStart={(e) => { e.preventDefault(); handleTapAreaClick(); }}
            >
               <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>ATTEMPT {Math.min(attempts.length + 1, 3)}/3</div>
               
               {playState === 'idle' && <h2 className={styles.hugeText} style={{ fontSize: '3rem' }}>TAP TO START</h2>}
               {playState === 'waiting' && <h2 className={styles.hugeText} style={{ fontSize: '4rem', color: 'var(--red-500)' }}>WAIT...</h2>}
               {playState === 'ready' && <h2 className={styles.hugeText} style={{ fontSize: '6rem', color: '#fff' }}>TAP!</h2>}
               {playState === 'false_start' && (
                  <>
                     <h2 className={styles.hugeText} style={{ fontSize: '4rem', color: '#fff' }}>FALSE START</h2>
                     <p>Tap to retry</p>
                  </>
               )}
               {playState === 'scored' && (
                  <>
                     <h2 className={styles.resultTime}>{currentAttemptTime?.toFixed(0)} <span style={{fontSize: '2rem'}}>ms</span></h2>
                     {attempts.length < 3 && <p>Tap to continue</p>}
                  </>
               )}
            </motion.div>
          )}

          {appState === 'result' && userScore && (
             <motion.div key="result" className={styles.instructionBox} initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
               <h3 className={styles.resultTitle}>PERFORMANCE TIER</h3>
               <h1 className={styles.hugeText} style={{ fontSize: '4rem', color: 'var(--accent-color)', marginBottom: '1rem' }}>
                  {getTier(userScore.bestTime)}
               </h1>
               <div className={styles.resultTime} style={{ fontSize: '4rem' }}>{userScore.bestTime} <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>ms</span></div>
               
               <button className={styles.champagneBtnOutline} onClick={() => setAppState('leaderboard')} style={{ marginTop: '2rem' }}>VIEW LEADERBOARD</button>
             </motion.div>
          )}

          {appState === 'leaderboard' && (
             <motion.div key="lb" className={styles.instructionBox} style={{ width: '100%', maxWidth: '800px', border: 'none', background: 'transparent', boxShadow: 'none', padding: '0' }}>
                {!gameActive && <h2 style={{ color: 'var(--red-500)', marginBottom: '1rem' }}>GAME CURRENTLY STOPPED</h2>}
                {userScore && gameActive && (
                   <p style={{ color: 'var(--accent-color)', marginBottom: '2rem', fontWeight: 700 }}>You have already completed this week's test.</p>
                )}
                <h2 className={styles.title} style={{ fontSize: '3rem' }}>GLOBAL <span className={styles.accent}>LEADERBOARD</span></h2>
                
                <div className={styles.leaderboardContainer} style={{ background: 'transparent', padding: '0', border: 'none', boxShadow: 'none' }}>
                 {leaderboard.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No entries yet.</p> : (
                    <>
                      {/* ELITE TIER */}
                      {leaderboard.filter(lb => getTier(lb.bestTime) === 'ELITE').length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <h3 style={{ color: 'var(--accent-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', textAlign: 'left' }}>ELITE TIER (&lt; 180ms)</h3>
                          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                            {leaderboard.filter(lb => getTier(lb.bestTime) === 'ELITE').map((lb, idx) => (
                               <div key={lb.id} className={`${styles.leaderboardRow} ${styles.topThree}`}>
                                 <div className={styles.rank}>#{idx + 1}</div>
                                 <div className={styles.playerInfo} style={{ textAlign: 'left' }}>
                                   <div className={styles.playerName}>{lb.name}</div>
                                 </div>
                                 <div className={styles.playerTime}>{lb.bestTime} ms</div>
                               </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* PRO TIER */}
                      {leaderboard.filter(lb => getTier(lb.bestTime) === 'PRO').length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', textAlign: 'left' }}>PRO TIER (180ms - 239ms)</h3>
                          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                            {leaderboard.filter(lb => getTier(lb.bestTime) === 'PRO').map((lb, idx) => (
                               <div key={lb.id} className={styles.leaderboardRow}>
                                 <div className={styles.rank}>-</div>
                                 <div className={styles.playerInfo} style={{ textAlign: 'left' }}>
                                   <div className={styles.playerName}>{lb.name}</div>
                                 </div>
                                 <div className={styles.playerTime} style={{ color: 'var(--text-color)' }}>{lb.bestTime} ms</div>
                               </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* COMPETITIVE TIER */}
                      {leaderboard.filter(lb => getTier(lb.bestTime) === 'COMPETITIVE').length > 0 && (
                        <div style={{ marginBottom: '2rem' }}>
                          <h3 style={{ color: 'var(--text-color)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', textAlign: 'left' }}>COMPETITIVE TIER (240ms - 299ms)</h3>
                          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                            {leaderboard.filter(lb => getTier(lb.bestTime) === 'COMPETITIVE').map((lb, idx) => (
                               <div key={lb.id} className={styles.leaderboardRow}>
                                 <div className={styles.rank}>-</div>
                                 <div className={styles.playerInfo} style={{ textAlign: 'left' }}>
                                   <div className={styles.playerName}>{lb.name}</div>
                                 </div>
                                 <div className={styles.playerTime} style={{ color: 'var(--text-muted)' }}>{lb.bestTime} ms</div>
                               </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* SLOW TIER */}
                      {leaderboard.filter(lb => getTier(lb.bestTime) === 'SLOW').length > 0 && (
                        <div>
                          <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.5rem', textAlign: 'left' }}>DEVELOPING (300ms+)</h3>
                          <div style={{ background: 'var(--card-bg)', borderRadius: '12px', overflow: 'hidden' }}>
                            {leaderboard.filter(lb => getTier(lb.bestTime) === 'SLOW').map((lb, idx) => (
                               <div key={lb.id} className={styles.leaderboardRow}>
                                 <div className={styles.rank} style={{ opacity: 0.5 }}>-</div>
                                 <div className={styles.playerInfo} style={{ textAlign: 'left' }}>
                                   <div className={styles.playerName} style={{ opacity: 0.7 }}>{lb.name}</div>
                                 </div>
                                 <div className={styles.playerTime} style={{ color: 'var(--text-muted)', opacity: 0.5 }}>{lb.bestTime} ms</div>
                               </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                 )}
               </div>
             </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
