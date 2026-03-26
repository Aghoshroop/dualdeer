"use client";
import { useState, useEffect } from 'react';
import styles from '../categories/CategoriesPage.module.css'; // Reusing forms styles
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    storeName: 'DualDeer Official',
    currency: 'USD',
    supportEmail: 'support@dualdeer.com',
    shippingFee: 0,
    taxRate: 8,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const docRef = doc(db, 'settings', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await setDoc(doc(db, 'settings', 'global'), settings);
      setMessage('Settings saved successfully!');
    } catch(e) {
      setMessage('Failed to save settings.');
    }
    setSaving(false);
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Global Settings</h1>
      </header>

      <div className={styles.tableContainer} style={{ maxWidth: '600px' }}>
        {loading ? (
          <p>Loading settings...</p>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div className={styles.formGroup} style={{ marginBottom: '0' }}>
              <label>Store Name</label>
              <input 
                type="text" 
                value={settings.storeName} 
                onChange={(e) => setSettings({...settings, storeName: e.target.value})}
                required
              />
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '0' }}>
              <label>Support Email</label>
              <input 
                type="email" 
                value={settings.supportEmail} 
                onChange={(e) => setSettings({...settings, supportEmail: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className={styles.formGroup} style={{ marginBottom: '0', flex: 1 }}>
                <label>Currency</label>
                <select 
                  value={settings.currency}
                  onChange={(e) => setSettings({...settings, currency: e.target.value})}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '0', flex: 1 }}>
                <label>Tax Rate (%)</label>
                <input 
                  type="number" 
                  value={settings.taxRate} 
                  onChange={(e) => setSettings({...settings, taxRate: Number(e.target.value)})}
                  min="0"
                  step="0.1"
                />
              </div>
            </div>

            <div className={styles.formGroup} style={{ marginBottom: '0' }}>
              <label>Standard Shipping Fee ($)</label>
              <input 
                type="number" 
                value={settings.shippingFee} 
                onChange={(e) => setSettings({...settings, shippingFee: Number(e.target.value)})}
                min="0"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: message.includes('success') ? '#10b981' : '#ef4444', fontSize: '0.9rem' }}>
                {message}
              </span>
              <button type="submit" className={styles.saveBtn} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
