"use client";
import { useState, useEffect } from 'react';
import styles from './Users.module.css';
import { User, Shield, Mail } from 'lucide-react';
import { getUsers, getSubscribers } from '@/lib/firebaseUtils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveUsers, liveSubs] = await Promise.all([getUsers(), getSubscribers()]);
        setUsers(liveUsers);
        setSubscribers(liveSubs);
      } catch (e) {
        console.error("Failed to sync live data", e);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Identity Vault</h1>
        <p>Live, intercepted data feed of magical customer signups</p>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Decrypting real-time identity stream...</h3>
          </div>
        ) : users.length === 0 ? (
          <div className={styles.emptyState}>
            <Shield size={40} className={styles.icon} />
            <h3>Data stream empty</h3>
            <p>Go to the Magical Auth Portal (/auth) and "Create ID". New users will stream directly here.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID Fingerprint</th>
                <th>Identity Name</th>
                <th>Secure Comm Node</th>
                <th>Private Dial</th>
                <th>Clearance</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => {
                // Handle different date formats (statically injected vs Firestore Timestamps)
                let dateStr = "Unknown";
                if (u.createdAt?.toDate) dateStr = u.createdAt.toDate().toLocaleString();
                else if (u.createdAt) dateStr = new Date(u.createdAt).toLocaleString();
                else if (u.joinDate) dateStr = new Date(u.joinDate).toLocaleString();

                return (
                  <tr key={u.id || i} className={styles.row}>
                    <td className={styles.idCell}>#{(u.id || '').toUpperCase().slice(-8)}</td>
                    <td className={styles.userCell}>
                      <div className={styles.avatar}><User size={16} /></div>
                      {u.name || 'Anonymous User'}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || 'None Provided'}</td>
                    <td>
                      <span className={styles.badge} style={{ backgroundColor: u.elitePoints > 0 ? '#fbbf24' : ''}}>
                        {u.elitePoints > 0 ? `${u.elitePoints} Points` : 'Elite Client'}
                      </span>
                    </td>
                    <td className={styles.subCell}>{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.header} style={{ marginTop: '4rem' }}>
        <h1>Newsletter Arsenal</h1>
        <p>VIP Leads Captured via 15% Off Acquisition Terminal</p>
      </div>

      <div className={styles.cardContainer}>
        {loading ? (
          <div className={styles.emptyState}>
            <h3>Decrypting email stream...</h3>
          </div>
        ) : subscribers.length === 0 ? (
          <div className={styles.emptyState}>
            <Mail size={40} className={styles.icon} />
            <h3>No Mailing Targets Extracted</h3>
            <p>Wait for inbound network traffic to interact with the Newsletter drop.</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Trace Fingerprint</th>
                <th>Global Electronic Coordinate</th>
                <th>Capture Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((s, i) => {
                let dateStr = "Unknown";
                if (s.createdAt?.toDate) dateStr = s.createdAt.toDate().toLocaleString();
                else if (s.createdAt) dateStr = new Date(s.createdAt).toLocaleString();
                else dateStr = "N/A - Direct Injection";
                return (
                  <tr key={s.id || i} className={styles.row}>
                    <td className={styles.idCell}>#{(s.id || '').toUpperCase().slice(-8)}</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{s.email}</td>
                    <td className={styles.subCell}>{dateStr}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
