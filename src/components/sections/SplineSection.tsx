"use client";

import React from 'react';
import Spline from '@splinetool/react-spline';
import styles from './SplineSection.module.css';

interface SplineSectionProps {
  sceneUrl?: string;
}

export default function SplineSection({ sceneUrl }: SplineSectionProps) {
  // Using a sample geometric scene as a fallback if no URL is provided
  const defaultScene = "https://prod.spline.design/6Wq1Q7YGyM-iab9i/scene.splinecode"; 

  return (
    <section className={styles.splineContainer}>
      <Spline scene={sceneUrl || defaultScene} />
      <div className={styles.overlay}>
        <p>Interactive 3D Preview</p>
      </div>
    </section>
  );
}
