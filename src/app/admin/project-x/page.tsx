"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import styles from './page.module.css';

export default function MysteryBookingsAdmin() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projectX_bookings'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBookings(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Mystery Bookings (Project X)</h1>
      
      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.emptyState}>Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <div className={styles.emptyState}>No bookings found.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Size</th>
                <th>Payment ID</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.timestamp ? new Date((booking.timestamp as any).toMillis ? (booking.timestamp as any).toMillis() : typeof booking.timestamp === 'number' ? booking.timestamp : (booking.timestamp as any).toDate ? (booking.timestamp as any).toDate().getTime() : Date.now()).toLocaleString() : 'N/A'}</td>
                  <td>{booking.name}</td>
                  <td>{booking.email}</td>
                  <td>{booking.phone}</td>
                  <td>{booking.size}</td>
                  <td><span style={{ fontFamily: 'monospace', color: 'var(--red-400)' }}>{booking.transactionId}</span></td>
                  <td>₹{booking.amountPaid || 100}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
