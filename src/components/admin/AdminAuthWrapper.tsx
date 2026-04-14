"use client";
import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { notFound } from 'next/navigation';

const ALLOWED_ADMINS = [
  'aviroopghosh283@gmail.com', 
  'abirdey2007@gmail.com',
  'hello@dualdeer.com'
];

export default function AdminAuthWrapper({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email && ALLOWED_ADMINS.includes(currentUser.email)) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    // A brief instant while Firebase checks their credentials quietly
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-background)', color: 'var(--color-text)' }}>Verifying Security...</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'white' }}>
        <h2>Access Denied</h2>
        <p>Your current Firebase Auth Session State:</p>
        <pre style={{ background: '#222', padding: '1rem', marginTop: '1rem', textAlign: 'left', display: 'inline-block' }}>
          {user ? `Logged in successfully as: ${user.email}` : `Not logged in securely with Firebase Auth.`}
        </pre>
        {user && <p style={{ marginTop: '1rem' }}>This email is not explicitly in the ALLOWED_ADMINS secret list.</p>}
        {!user && <p style={{ marginTop: '1rem' }}>Please return to /auth, click the Google button, and log in to a Google account.</p>}
      </div>
    );
  }

  return <>{children}</>;
}
