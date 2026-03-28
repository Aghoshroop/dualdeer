"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, TrendingUp, History, Package, CreditCard, Award, ChevronRight } from 'lucide-react';
import { getUserOrders, Order } from '@/lib/firebaseUtils';
import styles from './ProfileComponents.module.css';

interface EliteOverviewProps {
  user: any;
  setActiveTab: (tab: string) => void;
}

export default function EliteOverview({ user, setActiveTab }: EliteOverviewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      getUserOrders(user.uid).then(data => {
        setOrders(data);
        setLoading(false);
      });
    }
  }, [user]);

  const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
  const activeOrders = orders.filter(o => o.status !== 'delivered').length;
  
  // Rank Logic
  let rank = "Elite Aspirant";
  let rankColor = "#94a3b8"; // slate
  let icon = <Shield size={24} />;

  if (totalSpent > 10000) {
    rank = "Obsidian Vanguard";
    rankColor = "#1e293b";
    icon = <Zap size={24} color="#f59e0b" />;
  } else if (totalSpent > 5000) {
    rank = "Platinum Operative";
    rankColor = "#94a3b8";
    icon = <Award size={24} color="#6366f1" />;
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className={styles.overviewWrapper}>
      <motion.h2 variants={item} className={styles.sectionTitle}>
        <TrendingUp size={24} color="var(--color-primary)" /> Command Center
      </motion.h2>

      {/* TIER BADGE */}
      <motion.div variants={item} className={styles.tierStatus} style={{ borderColor: rankColor }}>
        <div className={styles.tierIcon} style={{ background: `rgba(var(--color-primary-rgb), 0.1)` }}>
          {icon}
        </div>
        <div className={styles.tierInfo}>
          <span className={styles.tierLabel}>Tactical Clearance</span>
          <h3 className={styles.tierTitle}>{rank}</h3>
        </div>
        <div className={styles.tierProgress}>
           <div className={styles.progressLabel}>
              <span>Status Level</span>
              <span>{Math.min(100, Math.floor((totalSpent / 15000) * 100))}%</span>
           </div>
           <div className={styles.progressBar}>
              <motion.div 
                className={styles.progressFill} 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, (totalSpent / 15000) * 100)}%` }}
                transition={{ duration: 1, delay: 0.5 }}
              />
           </div>
        </div>
      </motion.div>

      {/* STATS GRID */}
      <motion.div variants={item} className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}><Package size={20} /></div>
          <div>
            <div className={styles.statValue}>{orders.length}</div>
            <div className={styles.statLabel}>Total Payloads</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}><History size={20} /></div>
          <div>
            <div className={styles.statValue}>{activeOrders}</div>
            <div className={styles.statLabel}>Active Missions</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconBox}><CreditCard size={20} /></div>
          <div>
            <div className={styles.statValue}>₹{totalSpent.toLocaleString()}</div>
            <div className={styles.statLabel}>Investment</div>
          </div>
        </div>
      </motion.div>

      {/* QUICK ACTIONS */}
      <div className={styles.quickActionsGrid}>
        <motion.div 
          variants={item} 
          className={styles.quickActionCard}
          onClick={() => setActiveTab('orders')}
        >
          <div className={styles.actionIcon}><History size={20} /></div>
          <div className={styles.actionText}>
            <h4>Tracking Nexus</h4>
            <p>Monitor current field operations</p>
          </div>
          <ChevronRight size={18} className={styles.actionArrow} />
        </motion.div>

        <motion.div 
          variants={item} 
          className={styles.quickActionCard}
          onClick={() => setActiveTab('rewards')}
        >
          <div className={styles.actionIcon}><Award size={20} /></div>
          <div className={styles.actionText}>
            <h4>Reward Synthesis</h4>
            <p>Redeem tactical advantages</p>
          </div>
          <ChevronRight size={18} className={styles.actionArrow} />
        </motion.div>
      </div>

      {/* LATEST ORDER SNEAK PEEK */}
      {!loading && orders.length > 0 && (
        <motion.div variants={item} className={styles.latestMission}>
           <h3>Latest Transmission</h3>
           <div className={styles.missionCard}>
             <div className={styles.missionDot} style={{ background: orders[0].status === 'delivered' ? '#10b981' : '#f59e0b' }} />
             <div className={styles.missionSummary}>
               <span className={styles.missionId}>#ORD-{orders[0].id?.slice(-6).toUpperCase()}</span>
               <span className={styles.missionStatus}>{orders[0].status}</span>
             </div>
             <div className={styles.missionPrice}>₹{orders[0].total.toLocaleString()}</div>
           </div>
        </motion.div>
      )}
    </motion.div>
  );
}
