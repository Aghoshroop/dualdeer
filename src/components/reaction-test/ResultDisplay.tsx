import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '../../app/reaction-test/ReactionTest.module.css';
import { ReactionScore } from '@/lib/firebaseUtils';

type TestState = 'intro' | 'setup' | 'waiting' | 'ready' | 'reacting' | 'result' | 'submit' | 'leaderboard';

interface ResultDisplayProps {
    state: TestState;
    reactionTime: number;
    errorMsg: string;
    setState: (s: TestState) => void;
    resetTest: () => void;
    submitScore: (name: string, sport: string) => Promise<void>;
    leaderboard: ReactionScore[];
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ state, reactionTime, errorMsg, setState, resetTest, submitScore, leaderboard }) => {
    const [name, setName] = useState('');
    const [sport, setSport] = useState('');

    const onSubmit = async () => {
        if (!name.trim()) return;
        await submitScore(name, sport);
    };

    return (
        <AnimatePresence mode="wait">
          {state === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} className={styles.instructionBox}>
              {errorMsg ? (
                <>
                  <h2 className={styles.errText}>{errorMsg}</h2>
                  <button className={styles.champagneBtnOutline} onClick={resetTest}>TRY AGAIN</button>
                </>
              ) : (
                <>
                  <h3 className={styles.resultTitle}>Your Reaction Speed</h3>
                  <div className={styles.resultTime}>{reactionTime.toFixed(0)} <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>ms</span></div>
                  <div className={styles.resultControls}>
                     <button className={styles.champagneBtnOutline} onClick={resetTest}>RETRY</button>
                     <button className={styles.champagneBtn} onClick={() => setState('submit')}>SUBMIT SCORE</button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {state === 'submit' && (
            <motion.div key="submit" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className={styles.formBox}>
              <h2 className={styles.title} style={{ fontSize: '2rem', textAlign: 'left', marginBottom: '2rem' }}>VERIFY SCORE</h2>
              
              <div className={styles.inputGroup}>
                <label>Athlete Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" />
              </div>
              <div className={styles.inputGroup}>
                <label>Sport / Discipline (Optional)</label>
                <input type="text" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Sprints, Tennis" />
              </div>

              <div style={{ marginTop: '2rem' }}>
                 <button className={styles.champagneBtn} onClick={onSubmit} style={{ width: '100%' }} disabled={!name.trim()}>SUBMIT TO LEADERBOARD</button>
              </div>
            </motion.div>
          )}

          {state === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
               <h2 className={styles.title} style={{ fontSize: '3rem' }}>GLOBAL <span className={styles.accent}>LEADERBOARD</span></h2>
               <div className={styles.leaderboardContainer}>
                 {leaderboard.map((lb, i) => (
                    <div key={lb.id} className={`${styles.leaderboardRow} ${i < 10 ? styles.topThree : ''}`}>
                       <div className={styles.rank}>#{i + 1}</div>
                       <div className={styles.playerInfo}>
                         <div className={styles.playerName}>{lb.name}</div>
                         {lb.sport && <div className={styles.playerSport}>{lb.sport}</div>}
                       </div>
                       <div className={styles.playerTime}>{lb.reactionTime.toFixed(0)} ms</div>
                    </div>
                 ))}
                 {leaderboard.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>No verified scores yet.</p>}
               </div>
               <button className={styles.champagneBtnOutline} onClick={resetTest} style={{ marginTop: '2rem', background: 'var(--bg-color)' }}>GO TO TEST</button>
            </motion.div>
          )}
        </AnimatePresence>
    );
};
