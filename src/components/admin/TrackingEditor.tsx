"use client";
import React, { useState } from 'react';
import { Order, TrackingStage, TrackingInfo, updateOrder } from '@/lib/firebaseUtils';
import { Timestamp } from 'firebase/firestore';
import { X, Truck } from 'lucide-react';
import styles from './TrackingEditor.module.css';

interface TrackingEditorProps {
  order: Order;
  onClose: () => void;
  onUpdate: (orderId: string, tracking: TrackingInfo) => void;
}

const PREDEFINED_STAGES = [
  'Order Placed',
  'Payment Confirmed',
  'Inventory Reserved',
  'Quality Inspection',
  'Packed',
  'Pickup Scheduled',
  'Picked Up',
  'In Transit',
  'Regional Hub',
  'Destination Hub',
  'Out for Delivery',
  'Delivered',
  'Cancelled',
  'Return Requested',
  'Return Picked Up',
  'Refund Processed'
];

export default function TrackingEditor({ order, onClose, onUpdate }: TrackingEditorProps) {
  const [loading, setLoading] = useState(false);
  const [courier, setCourier] = useState(order.tracking?.courier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.tracking?.trackingNumber || '');
  const [estimatedDelivery, setEstimatedDelivery] = useState(
    order.tracking?.estimatedDelivery ? new Date(order.tracking.estimatedDelivery.toMillis()).toISOString().split('T')[0] : ''
  );

  const [newStageName, setNewStageName] = useState(PREDEFINED_STAGES[3]);
  const [newStageStatus, setNewStageStatus] = useState<'pending' | 'active' | 'completed'>('completed');
  const [newStageNote, setNewStageNote] = useState('');

  const handleUpdateMeta = async () => {
    setLoading(true);
    try {
      const trackingData: TrackingInfo = {
        ...order.tracking,
        courier,
        trackingNumber,
        stages: order.tracking?.stages || [],
      };

      if (estimatedDelivery) {
        trackingData.estimatedDelivery = Timestamp.fromDate(new Date(estimatedDelivery));
      }

      await updateOrder(order.id!, { tracking: trackingData });
      onUpdate(order.id!, trackingData);
      alert('Tracking info updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update tracking info');
    }
    setLoading(false);
  };

  const handleAddStage = async () => {
    setLoading(true);
    try {
      const newStage: TrackingStage = {
        stage: newStageName,
        status: newStageStatus,
        timestamp: Timestamp.now(),
        note: newStageNote
      };

      const currentStages = order.tracking?.stages || [];
      const trackingData: TrackingInfo = {
        courier,
        trackingNumber,
        stages: [...currentStages, newStage],
      };

      if (order.tracking?.estimatedDelivery) {
        trackingData.estimatedDelivery = order.tracking.estimatedDelivery;
      } else if (estimatedDelivery) {
        trackingData.estimatedDelivery = Timestamp.fromDate(new Date(estimatedDelivery));
      }

      await updateOrder(order.id!, { tracking: trackingData });
      setNewStageNote('');
      onUpdate(order.id!, trackingData);
    } catch (error) {
      console.error(error);
      alert('Failed to add tracking stage');
    }
    setLoading(false);
  };

  const handleDeleteStage = async (index: number) => {
    if (!confirm('Are you sure you want to delete this timeline stage?')) return;
    
    setLoading(true);
    try {
      const currentStages = [...(order.tracking?.stages || [])];
      currentStages.splice(index, 1);
      
      const trackingData: TrackingInfo = {
        ...order.tracking,
        stages: currentStages
      } as TrackingInfo;
      
      await updateOrder(order.id!, { tracking: trackingData });
      onUpdate(order.id!, trackingData);
    } catch (error) {
      console.error(error);
      alert('Failed to delete tracking stage');
    }
    setLoading(false);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'completed': return styles.statusCompleted;
      case 'active': return styles.statusActive;
      case 'pending': return styles.statusPending;
      default: return '';
    }
  };

  return (
    <div className={styles.trackerContainer}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 className={styles.title} style={{ borderBottom: 'none', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Truck size={18} color="var(--color-primary)" /> Live Order Tracking
        </h3>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text)' }}>
          <X size={18} />
        </button>
      </div>
      
      <div className={styles.infoGrid}>
        <div className={styles.inputGroup}>
          <label>Courier Name</label>
          <input 
            type="text" 
            className={styles.input} 
            value={courier} 
            onChange={(e) => setCourier(e.target.value)} 
            placeholder="e.g. BlueDart, Delhivery"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Tracking Number</label>
          <input 
            type="text" 
            className={styles.input} 
            value={trackingNumber} 
            onChange={(e) => setTrackingNumber(e.target.value)} 
            placeholder="AWB or Tracking ID"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Estimated Delivery Date</label>
          <input 
            type="date" 
            className={styles.input} 
            value={estimatedDelivery} 
            onChange={(e) => setEstimatedDelivery(e.target.value)} 
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button className={styles.saveBtn} onClick={handleUpdateMeta} disabled={loading}>
            {loading ? 'Saving...' : 'Save Meta Info'}
          </button>
        </div>
      </div>

      <div className={styles.timeline}>
        <h4 style={{ marginBottom: '0.5rem' }}>Timeline Stages</h4>
        {order.tracking?.stages && order.tracking.stages.length > 0 ? (
          order.tracking.stages.map((stage, idx) => (
            <div key={idx} className={styles.timelineStage}>
              <div className={styles.stageInfo}>
                <span className={styles.stageName}>{stage.stage}</span>
                {stage.note && <span className={styles.stageMeta}>{stage.note}</span>}
                {stage.timestamp && (
                  <span className={styles.stageMeta} style={{ color: 'var(--color-primary)' }}>
                    {new Date(stage.timestamp.toMillis()).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className={`${styles.stageStatus} ${getStatusClass(stage.status)}`}>
                  {stage.status}
                </span>
                <button onClick={() => handleDeleteStage(idx)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontSize: '0.8rem' }}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>No tracking timeline added yet.</p>
        )}

        <div className={styles.addStageForm}>
          <h5 style={{ margin: 0 }}>Add New Event</h5>
          <div className={styles.addStageRow}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Event Stage</label>
              <select className={styles.select} value={newStageName} onChange={(e) => setNewStageName(e.target.value)}>
                {PREDEFINED_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>Status</label>
              <select className={styles.select} value={newStageStatus} onChange={(e) => setNewStageStatus(e.target.value as any)}>
                <option value="completed">Completed</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div className={styles.addStageRow}>
            <div className={styles.inputGroup} style={{ flex: 1 }}>
              <label>Note (Optional)</label>
              <input type="text" className={styles.input} value={newStageNote} onChange={(e) => setNewStageNote(e.target.value)} placeholder="e.g. Arrived at facility" />
            </div>
            <button className={styles.addBtn} onClick={handleAddStage} disabled={loading}>
              {loading ? 'Adding...' : '+ Push Event'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
