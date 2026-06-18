"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, Maximize2 } from 'lucide-react';
import Spline from '@splinetool/react-spline';
import styles from './ReactionTest.module.css';

export default function ReactionTestV2() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000', position: 'relative', overflow: 'hidden' }}>
      
      {!isFullscreen && (
        <Link 
          href="/" 
          style={{ 
            position: 'absolute', top: '2rem', left: '2rem', zIndex: 50, 
            display: 'flex', alignItems: 'center', gap: '0.5rem', 
            color: 'white', textDecoration: 'none', fontFamily: 'var(--font-inter)', 
            fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}
        >
          <ChevronLeft size={20} /> EXIT
        </Link>
      )}

      {/* Fullscreen Toggle */}
      <button 
        onClick={() => setIsFullscreen(!isFullscreen)}
        style={{
          position: 'absolute', top: '2rem', right: '2rem', zIndex: 50,
          background: 'none', border: 'none', color: 'white', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0.5rem', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)'
        }}
        title="Toggle Fullscreen"
      >
        <Maximize2 size={20} />
      </button>

      {/* Spline 3D Game Embed */}
      <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
        <Spline scene="https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode" />
      </div>

    </div>
  );
}
