"use client";
import { motion } from 'framer-motion';
import Spline from '@splinetool/react-spline';
import styles from './MaintenanceScreen.module.css';

export default function MaintenanceScreen() {
  return (
    <div className={styles.container}>
      <motion.div 
        className={styles.bgGlow}
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5] 
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <div className={styles.splineContainer}>
        <Spline scene="https://prod.spline.design/PdQF6UCIH4BbvSzR/scene.splinecode" />
      </div>
      
      <div className={styles.content}>
        <motion.div 
          className={styles.logo}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          DualDeer
        </motion.div>

        <motion.h1 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          ELEVATING THE EXPERIENCE
        </motion.h1>

        <motion.div 
          className={styles.divider}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
        />

        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
        >
          We are upgrading our systems for the next generation of gear. While you wait, play the interactive 3D experience above!
        </motion.p>

        <motion.div 
          className={styles.loader}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={styles.dot}
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
