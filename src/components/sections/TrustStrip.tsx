"use client";
import React from 'react';
import { 
  Zap, 
  Wind, 
  Maximize2, 
  Shield, 
  Truck, 
  RotateCcw 
} from 'lucide-react';
import styles from './TrustStrip.module.css';

interface Benefit {
  id: number;
  tag: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
}

const benefitsData: Benefit[] = [
  {
    id: 1,
    tag: "TECH",
    title: "AERODYNAMIC COMPRESSION",
    subtitle: "Optimized circulation & rapid recovery",
    icon: Zap,
    color: "#7B2FF7",
  },
  {
    id: 2,
    tag: "FABRIC",
    title: "CLIMATE CONTROL WEAVE",
    subtitle: "Advanced thermoregulatory cooling",
    icon: Wind,
    color: "#00E5FF",
  },
  {
    id: 3,
    tag: "MOBILITY",
    title: "4-WAY ACTIVE STRETCH",
    subtitle: "Infinite range of motion & recovery",
    icon: Maximize2,
    color: "#FF007F",
  },
  {
    id: 4,
    tag: "SEAMLESS",
    title: "CHAFE-FREE SEAMLESS",
    subtitle: "Flat-lock seams for absolute comfort",
    icon: Shield,
    color: "#00FF66",
  },
  {
    id: 5,
    tag: "LOGISTICS",
    title: "FREE EXPRESS DELIVERY",
    subtitle: "Dispatched in 24h via air shipping",
    icon: Truck,
    color: "#FF9900",
  },
  {
    id: 6,
    tag: "WARRANTY",
    title: "7-DAY EASY EXCHANGES",
    subtitle: "Hassle-free size warranty & returns",
    icon: RotateCcw,
    color: "#ffffff",
  }
];

// Triplicate the data to ensure smooth, infinite looping on any viewport size
const infiniteBenefits = [...benefitsData, ...benefitsData, ...benefitsData];

export default function TrustStrip() {
  return (
    <section 
      className={styles.section}
      data-cursor="pointer"
    >
      {/* Top shifting gradient line */}
      <div className={styles.gradientBorderTop} />

      {/* Infinite Scroll Wrapper */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {infiniteBenefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            
            return (
              <div 
                key={`${benefit.id}-${idx}`}
                className={styles.marqueeItem}
                style={{ '--benefit-color': benefit.color } as React.CSSProperties}
              >
                {/* Category Pill Tag */}
                <span className={styles.pillTag}>
                  {benefit.tag}
                </span>

                {/* Styled Active Icon */}
                <div className={styles.iconWrapper}>
                  <Icon size={16} strokeWidth={2} />
                </div>

                {/* Inline text description */}
                <div className={styles.textContainer}>
                  <span className={styles.cardTitle}>{benefit.title}</span>
                  <span className={styles.divider}>|</span>
                  <span className={styles.cardSubtitle}>{benefit.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom shifting gradient line */}
      <div className={styles.gradientBorderBottom} />
    </section>
  );
}
