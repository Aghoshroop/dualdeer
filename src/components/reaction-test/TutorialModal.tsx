import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Focus, Activity } from 'lucide-react';
import styles from '../../app/reaction-test/ReactionTest.module.css';

interface TutorialModalProps {
    onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
    return (
        <div className={styles.modalBackdrop}>
            <motion.div 
                className={styles.modalContent}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
            >
                <button className={styles.modalCloseBtn} onClick={onClose}><X size={24} /></button>
                <h2 className={styles.modalTitle}>HOW TO TEST</h2>
                <div className={styles.modalSteps}>
                    <div className={styles.modalStep}>
                        <div className={styles.modalIcon}><Focus size={24} /></div>
                        <div>
                            <h3>1. Setup & Stance</h3>
                            <p>Ensure your device camera can see your movements clearly. Get into your starting stance.</p>
                        </div>
                    </div>
                    <div className={styles.modalStep}>
                        <div className={styles.modalIcon}><Activity size={24} /></div>
                        <div>
                            <h3>2. Do Not Anticipate</h3>
                            <p>Wait for the "SET..." command. Stay perfectly still. Any movement before the flash is a False Start.</p>
                        </div>
                    </div>
                    <div className={styles.modalStep}>
                        <div className={styles.modalIcon}><Zap size={24} /></div>
                        <div>
                            <h3>3. Explode!</h3>
                            <p>When you hear the beep and see the flash, explode instantly! The camera detects the first large movement.</p>
                        </div>
                    </div>
                </div>
                <button className={styles.champagneBtn} onClick={onClose} style={{ width: '100%', marginTop: '2rem' }}>GOT IT</button>
            </motion.div>
        </div>
    );
};
