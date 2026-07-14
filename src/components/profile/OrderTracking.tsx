"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Circle, Truck, Package, ChevronDown, ChevronUp } from 'lucide-react';
import { Order } from '@/lib/firebaseUtils';
import styles from './OrderTracking.module.css';

interface OrderTrackingProps {
  order: Order;
}

export default function OrderTracking({ order }: OrderTrackingProps) {
  const [expanded, setExpanded] = useState(false);

  const tracking = order.tracking || {};
  
  const stages = (tracking.stages && tracking.stages.length > 0) ? tracking.stages : [
    { stage: 'Order Placed', status: 'completed', timestamp: order.createdAt },
    { stage: 'Processing', status: order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'pending' },
    { stage: 'Shipped', status: order.status === 'shipped' || order.status === 'delivered' ? 'completed' : 'pending' },
    { stage: 'Delivered', status: order.status === 'delivered' ? 'completed' : 'pending' }
  ];
  
  let lastActiveIndex = -1;
  stages.forEach((stage, idx) => {
    if (stage.status === 'completed' || stage.status === 'active') {
      lastActiveIndex = idx;
    }
  });

  const currentStageText = lastActiveIndex >= 0 ? stages[lastActiveIndex].stage : 'Order Received';

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(typeof ts === 'number' ? ts : ts);
    return date.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (status: string, stageName: string) => {
    if (status === 'completed') return <Check size={16} />;
    if (status === 'active' && stageName.toLowerCase().includes('transit')) return <Truck size={16} />;
    if (status === 'active' && stageName.toLowerCase().includes('deliver')) return <Package size={16} />;
    if (status === 'active') return <Circle size={10} fill="currentColor" />;
    return <Circle size={10} />;
  };

  return (
    <div className={styles.trackingContainer}>
      <div className={styles.trackingHeader} onClick={() => setExpanded(!expanded)}>
        <div className={styles.trackingTitle}>
          <Truck size={20} color="var(--color-primary)" />
          {currentStageText}
        </div>
        <div className={styles.courierInfo}>
          {tracking.courier && tracking.trackingNumber && (
            <div>
              <div>{tracking.courier}</div>
              <div className={styles.trackingNumber}>{tracking.trackingNumber}</div>
            </div>
          )}
          <div className={styles.expandIcon} style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}>
            <ChevronDown size={20} />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!expanded ? (
          <motion.div 
            key="collapsed"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.timelineHorizontal}>
              <motion.div 
                className={styles.movingTruck}
                initial={{ left: "0%", x: "-50%" }}
                animate={{ left: `${((Math.max(0, lastActiveIndex) + 0.5) / stages.length) * 100}%`, x: "-50%" }}
                transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
              >
                <Truck size={24} color="var(--color-primary)" strokeWidth={1.5} />
              </motion.div>

              {stages.map((stage, idx) => (
                <div key={idx} className={`${styles.timelineItem} ${styles[stage.status]}`}>
                  <div className={styles.timelineIconWrapper}>
                    <div className={styles.timelineIcon}>
                      {getIcon(stage.status, stage.stage)}
                    </div>
                    {idx < stages.length - 1 && (
                      <div className={`${styles.connector} ${stage.status === 'completed' ? styles.connectorCompleted : ''}`} />
                    )}
                  </div>
                  <div className={styles.timelineContent}>
                    <div className={styles.timelineStage}>{stage.stage}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <div className={styles.timelineVertical}>
              {stages.map((stage, idx) => (
                <div key={idx} className={`${styles.verticalItem} ${styles[stage.status]}`}>
                  <div className={styles.verticalIcon}>
                    {getIcon(stage.status, stage.stage)}
                  </div>
                  <div className={styles.verticalContent}>
                    <div className={styles.verticalStage}>{stage.stage}</div>
                    {stage.timestamp && (
                      <div className={styles.verticalTime}>{formatTime(stage.timestamp)}</div>
                    )}
                    {stage.note && (
                      <div className={styles.verticalNote}>{stage.note}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {tracking.estimatedDelivery && (
        <div className={styles.estDelivery}>
          <strong>Estimated Delivery:</strong> {formatTime(tracking.estimatedDelivery).split(',')[0]}
        </div>
      )}
    </div>
  );
}
