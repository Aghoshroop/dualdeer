"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { submitReactionScore, getReactionLeaderboard, ReactionScore } from '@/lib/firebaseUtils';
import styles from './ReactionTest.module.css';

import { useCamera } from '@/hooks/useCamera';
import { useMotionDetection } from '@/hooks/useMotionDetection';
import { useReactionTimer } from '@/hooks/useReactionTimer';

import { CameraView } from '@/components/reaction-test/CameraView';
import { ReactionOverlay } from '@/components/reaction-test/ReactionOverlay';
import { ResultDisplay } from '@/components/reaction-test/ResultDisplay';
import { TutorialModal } from '@/components/reaction-test/TutorialModal';

type TestState = 'intro' | 'setup' | 'waiting' | 'ready' | 'reacting' | 'result' | 'submit' | 'leaderboard';

export default function ReactionTestPage() {
  const [state, setState] = useState<TestState>('intro');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<ReactionScore[]>([]);
  const [showTutorial, setShowTutorial] = useState<boolean>(true);
  
  const stateRef = useRef<TestState>(state);
  
  useEffect(() => {
      stateRef.current = state;
  }, [state]);
  
  // Custom hooks
  const { videoRef, startCamera, stopCamera, toggleCamera, facingMode, cameraError, setCameraError } = useCamera();
  const { beginSequence, clearTimers, initAudio, startTimeRef } = useReactionTimer(setState, stateRef);

  const onCheat = useCallback(() => {
     clearTimers();
     setState('result');
     setErrorMsg('FALSE START. You moved before the signal.');
  }, [clearTimers]);

  const onReaction = useCallback((time: number) => {
      if (time < 80) { // < 80ms is anticipation
          setState('result');
          setErrorMsg('INVALID (ANTICIPATION). Reaction too fast to be humanly possible (< 80ms).');
      } else {
          setReactionTime(time);
          setState('result');
          setErrorMsg('');
      }
  }, []);

  const { canvasRef } = useMotionDetection({
      videoRef,
      state,
      onCheat,
      onReaction,
      startTimeRef
  });

  const fetchLeaderboard = async () => {
    const data = await getReactionLeaderboard();
    setLeaderboard(data);
  };

  const handleStartTest = async () => {
      // Must be called via user interaction to unlock audio
      initAudio();
      setState('setup');
      setCameraError('');
      setErrorMsg('');
      await startCamera();
  };

  const resetTest = () => {
      setErrorMsg('');
      setCameraError('');
      setState('setup');
  };

  const handleSkipToLeaderboard = async () => {
      await fetchLeaderboard();
      setState('leaderboard');
  };

  const handleSubmitScore = async (name: string, sport: string) => {
      await submitReactionScore({ name, sport, reactionTime });
      await fetchLeaderboard();
      setState('leaderboard');
  };

  return (
    <div className={styles.container}>
      <AnimatePresence>
         {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      </AnimatePresence>
      <div className={styles.navBarSpacer} />
      
      <CameraView videoRef={videoRef} canvasRef={canvasRef} facingMode={facingMode} />

      <Link href="/" className={styles.backBtn} onClick={stopCamera}>
        <ChevronLeft size={20} /> EXIT
      </Link>

      <div className={styles.content}>
           <ReactionOverlay 
               state={state} 
               errorMsg={errorMsg || cameraError} 
               startTest={handleStartTest} 
               beginSequence={beginSequence} 
               handleSkipToLeaderboard={handleSkipToLeaderboard} 
               toggleCamera={toggleCamera}
           />
           <ResultDisplay 
               state={state}
               reactionTime={reactionTime}
               errorMsg={errorMsg}
               setState={setState}
               resetTest={resetTest}
               submitScore={handleSubmitScore}
               leaderboard={leaderboard}
           />
      </div>
    </div>
  );
}
