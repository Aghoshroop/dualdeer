"use client";
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Video as VideoType } from '@/lib/firebaseUtils';

interface VideoPlayerProps {
  video: VideoType;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
  aspectRatio?: string;
}

export default function VideoPlayer({ 
  video, 
  autoPlay = true, 
  muted = true, 
  loop = true, 
  controls = false,
  aspectRatio = '56.25%' // 16:9 Default
}: VideoPlayerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it comes into view
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Cloudinary optimizations: f_auto, q_auto
  // Inject into the URL if it's a standard cloudinary upload URL
  const optimizedUrl = video.videoUrl.includes('cloudinary.com') 
    ? video.videoUrl.replace('/upload/', '/upload/f_auto,q_auto/') 
    : video.videoUrl;

  return (
    <div 
      ref={containerRef} 
      style={{ 
        position: 'relative', 
        width: '100%', 
        paddingBottom: aspectRatio, 
        backgroundColor: '#111', 
        borderRadius: '8px', 
        overflow: 'hidden' 
      }}
    >
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(90deg, #111 25%, #222 50%, #111 75%)',
          backgroundSize: '200% 100%',
          animation: 'pulse 1.5s infinite',
        }} />
      )}
      
      {isVisible && (
        <motion.video
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          src={optimizedUrl}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          controls={controls}
          playsInline
          onLoadedData={() => setIsLoaded(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />
      )}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  );
}
