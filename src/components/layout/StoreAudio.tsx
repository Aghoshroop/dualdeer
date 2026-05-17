"use client";
import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './StoreAudio.module.css';

export default function StoreAudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasInteractedRef = useRef(false);

  useEffect(() => {
    const audio = new Audio('/cinematic.mp3'); 
    audio.loop = false; 
    audio.volume = 0.4; 
    audioRef.current = audio;

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    const attemptPlay = () => {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.log("Autoplay prevented:", err);
      });
    };

    // Attempt to play immediately on mount
    attemptPlay();

    const handleFirstInteraction = () => {
      if (!hasInteractedRef.current && audio.paused) {
        hasInteractedRef.current = true;
        setHasInteracted(true);
        attemptPlay();
      }
    };

    // Listen for any interaction to trigger the music safely
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, { once: true });
    document.addEventListener('keydown', handleFirstInteraction, { once: true });

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.log("Playback failed", e));
      }
      setIsPlaying(!isPlaying);
      setHasInteracted(true); // User took manual control
    }
  };

  return (
    <motion.div 
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.8 }}
    >
      <button 
        onClick={togglePlay} 
        className={`${styles.button} ${isPlaying ? styles.playing : ''}`}
        aria-label={isPlaying ? "Mute Store Music" : "Play Store Music"}
      >
        <AnimatePresence mode="wait">
          {isPlaying ? (
            <motion.div
              key="playing"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.iconWrapper}
            >
              <Volume2 size={18} strokeWidth={2} />
              <div className={styles.soundWaves}>
                <span className={styles.wave} />
                <span className={styles.wave} />
                <span className={styles.wave} />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="muted"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={styles.iconWrapper}
            >
              <VolumeX size={18} strokeWidth={2} opacity={0.6} />
              <span className={styles.mutedText}>MUSIC</span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
