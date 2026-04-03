import React from 'react';
import styles from '../../app/reaction-test/ReactionTest.module.css';

interface CameraViewProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const CameraView: React.FC<CameraViewProps> = ({ videoRef, canvasRef }) => {
    return (
        <>
            <video ref={videoRef as any} className={styles.video} autoPlay playsInline muted />
            <div className={styles.overlay} />
            <canvas ref={canvasRef as any} style={{ display: 'none' }} />
        </>
    );
};
