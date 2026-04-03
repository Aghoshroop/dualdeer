import { useRef, useCallback, useEffect } from 'react';

const MOTION_THRESHOLD = 15;
const CHEAT_THRESHOLD = 12;

interface MotionDetectionProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    state: string;
    onCheat: () => void;
    onReaction: (time: number) => void;
    startTimeRef: React.RefObject<number | null>;
}

export const useMotionDetection = ({ videoRef, state, onCheat, onReaction, startTimeRef }: MotionDetectionProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const requestRef = useRef<number | null>(null);
    const prevFrameRef = useRef<ImageData | null>(null);
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

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

        // Downscale for performance
        canvas.width = 64; 
        canvas.height = 48;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const frameData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        if (prevFrameRef.current) {
            let diff = 0;
            const dataLength = frameData.data.length;
            const fd = frameData.data;
            const pd = prevFrameRef.current.data;

            // Only analyze every 4th pixel (step by 16 bytes: RGBA * 4 pixels = 16)
            for (let i = 0; i < dataLength; i += 16) {
                diff += Math.abs(fd[i] - pd[i]) + Math.abs(fd[i+1] - pd[i+1]) + Math.abs(fd[i+2] - pd[i+2]);
            }
            
            // Adjusted avg since we sampled only 1/4th pixels
            const avgDiff = (diff * 4) / (canvas.width * canvas.height * 3);
            const current = stateRef.current;
            
            if (current === 'ready') {
                if (avgDiff > CHEAT_THRESHOLD) {
                    onCheat();
                }
            } else if (current === 'reacting') {
                if (avgDiff > MOTION_THRESHOLD) {
                    if (startTimeRef.current !== null) {
                        const time = performance.now() - startTimeRef.current;
                        onReaction(time);
                    }
                }
            }
        }
        
        prevFrameRef.current = frameData;
        requestRef.current = requestAnimationFrame(processFrame);
    }, [onCheat, onReaction, startTimeRef]);

    useEffect(() => {
        requestRef.current = requestAnimationFrame(processFrame);
        return () => {
            if (requestRef.current !== null) {
                cancelAnimationFrame(requestRef.current);
                requestRef.current = null;
            }
        };
    }, [processFrame]);

    return { canvasRef };
};
