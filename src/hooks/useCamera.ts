import { useState, useRef, useEffect, useCallback } from 'react';

export const useCamera = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [cameraError, setCameraError] = useState<string>('');
    const streamRef = useRef<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const startCamera = useCallback(async (mode: "user" | "environment" = facingMode) => {
        stopCamera(); 
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: false });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setFacingMode(mode);
            setCameraError('');
        } catch (e) {
            console.error("Camera access error:", e);
            setCameraError("Camera access required. Please allow camera and retry.");
        }
    }, [facingMode, stopCamera]);

    const toggleCamera = useCallback(async () => {
        const nextMode = facingMode === "user" ? "environment" : "user";
        await startCamera(nextMode);
    }, [facingMode, startCamera]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    return { videoRef, startCamera, stopCamera, toggleCamera, facingMode, cameraError, setCameraError };
};
