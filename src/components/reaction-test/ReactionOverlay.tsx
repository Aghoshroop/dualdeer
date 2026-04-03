import React from 'react';
import { motion } from 'framer-motion';
import styles from '../../app/reaction-test/ReactionTest.module.css';

type TestState = 'intro' | 'setup' | 'waiting' | 'ready' | 'reacting' | 'result' | 'submit' | 'leaderboard';

interface ReactionOverlayProps {
    state: TestState;
    errorMsg: string;
    startTest: () => void;
    beginSequence: () => void;
    handleSkipToLeaderboard: () => void;
}

export const ReactionOverlay: React.FC<ReactionOverlayProps> = ({ state, errorMsg, startTest, beginSequence, handleSkipToLeaderboard }) => {
    return (
        <>
          {state === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={styles.instructionBox} style={{ background: 'transparent', border: 'none' }}>
              <h1 className={styles.title}>TEST YOUR <span className={styles.accent}>REACTION</span></h1>
              <p className={styles.subtitle}>Measure your explosive start like elite athletes.<br/>Uses your device camera to detect motion accurately. Step back, wait for the signal, and go.</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                 <button className={styles.champagneBtn} onClick={startTest}>START TEST</button>
                 <button className={styles.champagneBtnOutline} onClick={handleSkipToLeaderboard}>VIEW LEADERBOARD</button>
              </div>
            </motion.div>
          )}

          {state === 'setup' && (
             <motion.div key="setup" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} className={styles.instructionBox}>
               {errorMsg ? (
                 <>
                  <p className={styles.errText}>{errorMsg}</p>
                  <button className={styles.champagneBtnOutline} onClick={startTest}>RETRY PERMISSION</button>
                 </>
               ) : (
                 <>
                  <h2 className={styles.title} style={{ fontSize: '2rem', marginBottom: '1rem' }}>POSITION YOURSELF</h2>
                  <p className={styles.subtitle} style={{ marginBottom: '2rem' }}>Ensure you are fully visible.<br/>Explode out of your stance as fast as possible when you see the flash and hear the beep. Stay perfectly still during "SET".</p>
                  <button className={styles.champagneBtn} onClick={beginSequence}>I'M READY</button>
                 </>
               )}
             </motion.div>
          )}

          {state === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={styles.instructionBox}>
               <p className={styles.hugeText}>ON YOUR MARKS</p>
            </motion.div>
          )}

          {state === 'ready' && (
            <motion.div key="ready" className={styles.instructionBox} initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
               <p className={styles.hugeText} style={{ color: '#D4AF37' }}>SET...</p>
               <p style={{ marginTop: '1rem', color: '#ff4444', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '2px' }}>Do not move</p>
            </motion.div>
          )}

          {state === 'reacting' && (
            <motion.div key="reacting" className={styles.instructionBox}>
              <div className={styles.signalBox + " " + styles.flash} />
              <p className={styles.hugeText} style={{ color: '#fff' }}>EXPLODE GO!</p>
            </motion.div>
          )}
        </>
    );
};
