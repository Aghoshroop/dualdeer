"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { submitReactionScore, getReactionLeaderboard, ReactionScore } from '@/lib/firebaseUtils';
import styles from './ReactionTest.module.css';

type TestState = 'intro' | 'setup' | 'waiting' | 'ready' | 'reacting' | 'result' | 'submit' | 'leaderboard';

export default function ReactionTestPage() {
  const [state, setState] = useState<TestState>('intro');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [leaderboard, setLeaderboard] = useState<ReactionScore[]>([]);
  
  const [name, setName] = useState('');
  const [sport, setSport] = useState('');

  // Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);

  // We need to keep track of animation frame
  const requestRef = useRef<number>();
  const prevFrameRef = useRef<ImageData | null>(null);
  
  const stateRef = useRef(state);
  // Keep ref up to date
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // Timers
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
  const startTimeRef = useRef<number>(0);
  
  const clearTimers = () => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  const playGunshot = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    
    // Synthesize a sharp ping mimicking a starter pistol / loud beep
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };
  
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = 1.2;
        u.pitch = 0.9;
        window.speechSynthesis.speak(u);
    }
  };

  const initAudio = () => {
    if (typeof window !== 'undefined') {
        if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
        }
    }
  };

  const startTest = async () => {
    initAudio();
    setState('setup');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.error("Camera access error:", e);
      // We will allow it to proceed with error. The UI handles it.
      setErrorMsg("Camera access required. Please allow camera and retry.");
    }
  };

  const beginSequence = () => {
    setState('waiting');
    speak("On your marks");
    
    const t1 = setTimeout(() => {
      speak("Set");
      setState('ready');
      
      const randomDelay = Math.random() * 2000 + 1000; // 1s to 3s delay
      const t2 = setTimeout(() => {
        if (stateRef.current === 'ready') {
          playGunshot();
          setState('reacting');
          startTimeRef.current = performance.now();
        }
      }, randomDelay);
      timeoutRefs.current.push(t2);
    }, 3000); // Wait 3s after "On your marks"
    
    timeoutRefs.current.push(t1);
  };

  // Video processing loop for motion detection
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || videoRef.current.readyState < 2) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx || video.videoWidth === 0) {
      requestRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // draw scaled down video to canvas for extremely fast processing
    canvas.width = 64;
    canvas.height = 48;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    if (prevFrameRef.current) {
      let diff = 0;
      // We skip alpha channel so i += 4
      for (let i = 0; i < frameData.data.length; i += 4) {
        const r1 = frameData.data[i];
        const g1 = frameData.data[i+1];
        const b1 = frameData.data[i+2];
        const r2 = prevFrameRef.current.data[i];
        const g2 = prevFrameRef.current.data[i+1];
        const b2 = prevFrameRef.current.data[i+2];
        
        diff += Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
      }
      
      const avgDiff = diff / (canvas.width * canvas.height * 3);
      
      const current = stateRef.current;
      
      // CHEAT / MOVEMENT DETECTION
      if (current === 'ready') {
        if (avgDiff > 12) { // Moved during "Set"
           clearTimers();
           setState('result');
           setErrorMsg('FALSE START. You moved before the signal.');
        }
      }
      // REACTION DETECTION
      else if (current === 'reacting') {
        if (avgDiff > 15) { // Meaningful explosive movement detected
           const time = performance.now() - startTimeRef.current;
           if (time < 80) { // < 0.08 sec is physically impossible reaction without anticipation cheating
             setState('result');
             setErrorMsg('INVALID (ANTICIPATION). Reaction too fast to be humanly possible (< 80ms).');
           } else {
             setReactionTime(time);
             setState('result');
             setErrorMsg('');
           }
        }
      }
    }
    
    prevFrameRef.current = frameData;
    requestRef.current = requestAnimationFrame(processFrame);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(processFrame);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearTimers();
      // stop stream if unmounting
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [processFrame]);

  const fetchLeaderboard = async () => {
    const data = await getReactionLeaderboard();
    setLeaderboard(data);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    await submitReactionScore({
      name,
      sport,
      reactionTime
    });
    fetchLeaderboard();
    setState('leaderboard');
  };

  const resetTest = () => {
    setErrorMsg('');
    setState('setup');
  };

  const handleSkipToLeaderboard = async () => {
      await fetchLeaderboard();
      setState('leaderboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.navBarSpacer} />
      {/* Background Video Layer */}
      <video ref={videoRef} className={styles.video} autoPlay playsInline muted />
      <div className={styles.overlay} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <Link href="/" className={styles.backBtn}>
        <ChevronLeft size={20} /> EXIT
      </Link>

      <div className={styles.content}>
        <AnimatePresence mode="wait">
          
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

          {state === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className={styles.instructionBox}>
              {errorMsg ? (
                <>
                  <h2 className={styles.errText}>{errorMsg}</h2>
                  <button className={styles.champagneBtnOutline} onClick={resetTest}>TRY AGAIN</button>
                </>
              ) : (
                <>
                  <h3 className={styles.resultTitle}>Your Reaction Speed</h3>
                  <div className={styles.resultTime}>{reactionTime.toFixed(0)} <span style={{ fontSize: '2rem', color: '#888' }}>ms</span></div>
                  <div className={styles.resultControls}>
                     <button className={styles.champagneBtnOutline} onClick={resetTest}>RETRY</button>
                     <button className={styles.champagneBtn} onClick={() => setState('submit')}>SUBMIT SCORE</button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {state === 'submit' && (
            <motion.div key="submit" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className={styles.formBox}>
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
                 <button className={styles.champagneBtn} onClick={handleSubmit} style={{ width: '100%' }} disabled={!name.trim()}>SUBMIT TO LEADERBOARD</button>
              </div>
            </motion.div>
          )}

          {state === 'leaderboard' && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
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
                 {leaderboard.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: '2rem 0' }}>No verified scores yet.</p>}
               </div>
               <button className={styles.champagneBtnOutline} onClick={resetTest} style={{ marginTop: '2rem', background: '#000' }}>GO TO TEST</button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
