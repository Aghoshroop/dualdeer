import React from 'react';
import styles from '../../app/reaction-test/ReactionTest.module.css';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
    facingMode?: "user" | "environment";
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, canvasRef, facingMode = "user" }) => {
    const isMirrored = facingMode === 'user';
    return (
        <>
            <video 
                ref={videoRef as any} 
                className={styles.video} 
                autoPlay 
                playsInline 
                muted 
                style={{ transform: isMirrored ? 'scaleX(-1)' : 'scaleX(1)' }}
            />
            <div className={styles.overlay} />
            <canvas ref={canvasRef as any} style={{ display: 'none' }} />
        </>
    );
};
