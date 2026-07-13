"use client";
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderItem } from '@/lib/firebaseUtils';
import styles from './MyGear.module.css';
import { Package, ShieldCheck, Droplets, Wind, ArrowRight, X, BookOpen, Clock, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface OwnedGear extends OrderItem {
  id?: string;
  userId?: string;
  purchaseDate: Date;
  orderId: string;
  passportId: string;
  gearHealth: string;
  productVersion: string;
  status: string;
  manufacturingBatch?: string;
  originalPrice?: number;
}

interface GearEvent {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
}

export default function MyGear({ user }: { user: any }) {
  const [gear, setGear] = useState<OwnedGear[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGear, setSelectedGear] = useState<OwnedGear | null>(null);
  const [events, setEvents] = useState<GearEvent[]>([]);
  const [careReminderDismissed, setCareReminderDismissed] = useState(false);

  useEffect(() => {
    if (selectedGear) {
      // Fetch events for selected gear
      const fetchEvents = async () => {
        const q = query(collection(db, 'gearEvents'), where('ownedGearId', '==', selectedGear.id));
        const snap = await getDocs(q);
        const evts = snap.docs.map(doc => {
          const d = doc.data();
          return {
            id: doc.id,
            ...d,
            timestamp: d.timestamp?.toDate ? d.timestamp.toDate() : new Date(d.timestamp)
          } as GearEvent;
        });
        evts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setEvents(evts);
      };
      fetchEvents();
      setCareReminderDismissed(false);
    }
  }, [selectedGear]);

  useEffect(() => {
    const fetchGear = async () => {
      if (!user?.uid) return;
      try {
        // Query owned gear first
        const gearQ = query(collection(db, 'ownedGear'), where('userId', '==', user.uid));
        const gearSnapshot = await getDocs(gearQ);
        
        const ownedItems: OwnedGear[] = [];

        if (!gearSnapshot.empty) {
          // Normal load
          gearSnapshot.docs.forEach(doc => {
            const data = doc.data();
            ownedItems.push({
              id: doc.id,
              ...data,
              purchaseDate: data.purchaseDate?.toDate ? data.purchaseDate.toDate() : new Date(data.purchaseDate)
            } as OwnedGear);
          });
        } else {
          // Migration logic: No gear found, but maybe they have old orders?
          const orderQ = query(collection(db, 'orders'), where('userId', '==', user.uid), where('status', '==', 'delivered'));
          const orderSnapshot = await getDocs(orderQ);
          
          if (!orderSnapshot.empty) {
            const seenProductIds = new Set<string>();

            for (const orderDoc of orderSnapshot.docs) {
              const order = { id: orderDoc.id, ...orderDoc.data() } as Order;
              const purchaseDate = order.updatedAt?.toDate ? order.updatedAt.toDate() : new Date((order.updatedAt as any) || Date.now());
              
              for (const item of order.items) {
                const uniqueKey = `${item.productId}-${item.size || ''}`;
                if (!seenProductIds.has(uniqueKey)) {
                  seenProductIds.add(uniqueKey);
                  
                  const gearId = `${order.id}_${item.productId}_${item.size || 'STD'}`;
                  const passportId = `DD-${Math.floor(Math.random() * 0xFFFFFFFF).toString(16).toUpperCase().padStart(8, '0')}`;
                  
                  const newGear: OwnedGear = {
                    ...item,
                    userId: user.uid,
                    orderId: order.id!,
                    originalPrice: item.pricePaid || item.mrp || 0,
                    purchaseDate: purchaseDate as Date,
                    status: 'active',
                    gearHealth: 'new',
                    passportId,
                    productVersion: 'v1.0',
                    manufacturingBatch: 'B-001'
                  };

                  // Store in Firebase
                  await setDoc(doc(db, 'ownedGear', gearId), {
                    ...newGear,
                    purchaseDate: Timestamp.fromDate(purchaseDate)
                  }, { merge: true });

                  // Warranty
                  await setDoc(doc(db, 'warrantyRecords', `WAR-${gearId}`), {
                    ownedGearId: gearId,
                    userId: user.uid,
                    status: 'active',
                    activationDate: Timestamp.fromDate(purchaseDate),
                    expirationDate: Timestamp.fromDate(new Date(purchaseDate.getTime() + 31536000000)),
                    coverageDetails: '1-Year Performance Guarantee covering material and manufacturing defects.'
                  }, { merge: true });

                  // Event
                  await setDoc(doc(db, 'gearEvents', `EVT-PURCHASE-${gearId}`), {
                    ownedGearId: gearId,
                    userId: user.uid,
                    type: 'purchased',
                    description: 'Product purchased and digital passport created.',
                    timestamp: Timestamp.fromDate(purchaseDate)
                  }, { merge: true });
                  
                  ownedItems.push({
                    ...newGear,
                    id: gearId,
                    purchaseDate // Use local Date object for UI
                  } as unknown as OwnedGear);
                }
              }
            }
          }
        }

        // Sort by most recently purchased
        ownedItems.sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime());
        setGear(ownedItems);
      } catch (e) {
        console.error("Failed to fetch gear", e);
      }
      setLoading(false);
    };
    fetchGear();
  }, [user]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading your gear vault...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Package size={32} color="var(--color-primary)" />
        <div>
          <h2 className={styles.title}>My Gear Vault</h2>
          <p className={styles.subtitle}>Manage your DualDeer equipment, access care guides, and view warranties.</p>
        </div>
      </div>

      {gear.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} className={styles.emptyIcon} />
          <h3>No Gear Yet</h3>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>Your purchased DualDeer equipment will appear here for easy management.</p>
          <Link href="/shop" style={{ background: 'var(--color-primary)', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '30px', textDecoration: 'none', fontWeight: 600 }}>
            Shop Collection
          </Link>
        </div>
      ) : (
        <div className={styles.grid}>
          {gear.map(item => (
            <div key={`${item.productId}-${item.size}`} className={styles.gearCard} onClick={() => setSelectedGear(item)}>
              <div className={styles.purchaseDate}>
                {item.purchaseDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
              <div className={styles.imageContainer}>
                {item.image ? (
                  <img src={item.image} alt={item.name} className={styles.productImage} />
                ) : (
                  <span className={styles.noImage}>No Image</span>
                )}
              </div>
              <div className={styles.gearInfo}>
                <div className={styles.gearName}>{item.name}</div>
                <div className={styles.gearMeta}>
                  <span>Size: {item.size || 'Standard'}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#4CAF50' }}>
                    <ShieldCheck size={14} /> Active
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedGear && (
        <div className={styles.modalOverlay} onClick={() => setSelectedGear(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <button className={styles.modalClose} onClick={() => setSelectedGear(null)}>
              <X size={18} />
            </button>
            
            <div className={styles.passportHero}>
              {selectedGear.image && (
                <img src={selectedGear.image} alt={selectedGear.name} className={styles.passportImage} />
              )}
              <div>
                <span className={styles.passportBadge}>Digital Product Passport</span>
                <h2 className={styles.passportTitle}>{selectedGear.name}</h2>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <span className={styles.passportId}>SIZE: {selectedGear.size || 'STD'}</span>
                  <span className={styles.passportId}>ORDER: {selectedGear.orderId.substring(0,8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className={styles.passportGrid}>
              <div className={styles.leftCol}>
                <div className={styles.passportSection}>
                  <h3 className={styles.sectionHeading}><ShieldCheck size={18} /> Authenticity & Warranty</h3>
                  <div className={styles.warrantyCard}>
                    <ShieldCheck size={24} className={styles.warrantyIcon} />
                    <div style={{ width: '100%' }}>
                      <div className={styles.warrantyTitle}>Product Authenticity Verified</div>
                      <div className={styles.warrantyText}>
                        Digital Passport ID: <strong>{selectedGear.passportId}</strong><br/>
                        1-Year Performance Guarantee Active. Covered until {new Date(selectedGear.purchaseDate.getTime() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
                      </div>
                      <button className={styles.warrantyButton}>Start Warranty Claim</button>
                    </div>
                  </div>
                </div>

                <div className={styles.passportSection}>
                  <h3 className={styles.sectionHeading}><Activity size={18} /> Gear Health</h3>
                  <select className={styles.gearHealthSelect} defaultValue={selectedGear.gearHealth}>
                    <option value="new">New</option>
                    <option value="excellent">Excellent Condition</option>
                    <option value="good">Good (Normal Wear)</option>
                    <option value="worn">Worn (Heavy Use)</option>
                    <option value="retired">Retired</option>
                  </select>
                </div>

                <div className={styles.passportSection}>
                  <h3 className={styles.sectionHeading}><Clock size={18} /> Ownership Timeline</h3>
                  <div className={styles.timeline}>
                    {events.map((evt, idx) => (
                      <div key={idx} className={styles.timelineItem}>
                        <div className={styles.timelineDot} />
                        <div className={styles.timelineDate}>{evt.timestamp.toLocaleDateString()}</div>
                        <div className={styles.timelineDesc}>{evt.description}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.passportSection}>
                  <h3 className={styles.sectionHeading}><BookOpen size={18} /> Ecosystem & Education</h3>
                  <div className={styles.knowledgeList}>
                    {/* Mocked Links based on product name - In Phase 3 this will be fully dynamic via schema */}
                    <Link href="/learn/how-to-choose-gym-clothing" className={styles.knowledgeLink}>
                      <div>
                        <div className={styles.knowledgeTitle}>Performance Optimization Guide</div>
                        <div className={styles.knowledgeMeta}>How to get the most out of your {selectedGear.name}</div>
                      </div>
                      <ArrowRight size={16} color="var(--color-primary)" />
                    </Link>
                    <Link href="/trust/fabric-development" className={styles.knowledgeLink}>
                      <div>
                        <div className={styles.knowledgeTitle}>Fabric Intelligence</div>
                        <div className={styles.knowledgeMeta}>Understand the engineering behind this garment</div>
                      </div>
                      <ArrowRight size={16} color="var(--color-primary)" />
                    </Link>
                  </div>
                </div>
              </div>

              <div className={styles.rightCol}>
                <div className={styles.passportSection}>
                  <h3 className={styles.sectionHeading}><AlertCircle size={18} /> Care Assistant</h3>
                  
                  {!careReminderDismissed && (
                    <div className={styles.careReminder}>
                      <div className={styles.careReminderText}>
                        <Droplets size={16} /> Time to wash this gear?
                      </div>
                      <button className={styles.careReminderAction} onClick={() => setCareReminderDismissed(true)}>Dismiss</button>
                    </div>
                  )}

                  <ul className={styles.careList}>
                    <li className={styles.careItem}>
                      <Droplets size={16} className={styles.careIcon} /> Machine wash cold
                    </li>
                    <li className={styles.careItem}>
                      <Wind size={16} className={styles.careIcon} /> Tumble dry low or air dry
                    </li>
                    <li className={styles.careItem}>
                      <X size={16} className={styles.careIcon} style={{ color: '#ef4444' }} /> Do not use fabric softeners
                    </li>
                    <li className={styles.careItem}>
                      <X size={16} className={styles.careIcon} style={{ color: '#ef4444' }} /> Do not iron
                    </li>
                  </ul>
                  <Link href="/trust/care-instructions" style={{ display: 'inline-block', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                    View Full Care Guide &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
