"use client";
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import MaintenanceScreen from './MaintenanceScreen';

export default function MaintenanceWrapper({ children }: { children: React.ReactNode }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to Global Settings
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMaintenanceMode(data.maintenanceMode === true);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Listen to Auth State
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const adminEmails = ['aviroopghosh283@gmail.com', 'hello@dualdeer.com'];
        setIsAdmin(adminEmails.includes(user.email));
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsub();
  }, []);

  if (loading) return null; // Don't show anything until we know the maintenance state

  if (maintenanceMode && !isAdmin) {
    return <MaintenanceScreen />;
  }

  return (
    <>
      {maintenanceMode && isAdmin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#ef4444',
          color: 'white',
          textAlign: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          padding: '4px',
          zIndex: 9999999,
          pointerEvents: 'none'
        }}>
          MAINTENANCE MODE IS ACTIVE — REGULAR USERS ARE BLOCKED
        </div>
      )}
      {children}
    </>
  );
}
