import { useRef, useCallback, useEffect } from 'react';

type TestState = 'intro' | 'setup' | 'waiting' | 'ready' | 'reacting' | 'result' | 'submit' | 'leaderboard';

export const useReactionTimer = (setState: (s: TestState) => void, stateRef: React.RefObject<TestState>) => {
    const timeoutRefs = useRef<NodeJS.Timeout[]>([]);
    const startTimeRef = useRef<number | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);

    const clearTimers = useCallback(() => {
        timeoutRefs.current.forEach(clearTimeout);
        timeoutRefs.current = [];
    }, []);

    const playGunshot = useCallback(() => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
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
    }, []);

    const speak = useCallback((text: string) => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const u = new SpeechSynthesisUtterance(text);
            u.rate = 1.2;
            u.pitch = 0.9;
            window.speechSynthesis.speak(u);
        }
    }, []);

    const initAudio = useCallback(() => {
        if (typeof window !== 'undefined') {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        }
    }, []);

    const beginSequence = useCallback(() => {
        clearTimers();
        setState('waiting');
        speak("On your marks");
        
        const t1 = setTimeout(() => {
            speak("Set");
            setState('ready');
            
            const randomDelay = Math.random() * 2000 + 1000;
            const t2 = setTimeout(() => {
                if (stateRef.current === 'ready') {
                    playGunshot();
                    setState('reacting');
                    startTimeRef.current = performance.now();
                }
            }, randomDelay);
            timeoutRefs.current.push(t2);
        }, 3000);
        
        timeoutRefs.current.push(t1);
    }, [setState, stateRef, speak, playGunshot, clearTimers]);

    useEffect(() => {
        return clearTimers;
    }, [clearTimers]);

    return { beginSequence, clearTimers, initAudio, startTimeRef };
};
