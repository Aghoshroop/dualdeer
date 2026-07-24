import React from 'react';
import Link from 'next/link';

export default function LeadershipSection() {
  const EXECUTIVES = [
    { id: 'deer', name: 'Deer', title: 'Founder & Creative Architect', initials: 'D' },
    { id: 'aritra-sharma', name: 'Aritra Sharma', title: 'Head of Operations & Lead Editor', initials: 'AS' },
    { id: 'abir-dey', name: 'Abir Dey', title: 'Lead Brand Model', initials: 'AD' },
    { id: 'ayushman-haldar', name: 'Ayushman Haldar', title: 'Head of Marketing & Social', initials: 'AH' },
  ];

  return (
    <section style={{ padding: '2rem 0 0 0', textAlign: 'center', background: 'transparent' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '3rem', letterSpacing: '1px', color: 'var(--color-text)' }}>Meet the Minds Behind DualDeer</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {EXECUTIVES.map((exec) => (
            <Link key={exec.id} href={`/leadership/${exec.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ 
                background: 'rgba(var(--foreground-rgb), 0.02)', 
                padding: '2.5rem 1.5rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(var(--foreground-rgb), 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transition: 'transform 0.4s ease, background 0.4s ease',
                height: '100%'
              }} className="homepage-leadership-card">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: exec.id === 'deer' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(var(--foreground-rgb), 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '2rem', 
                  color: exec.id === 'deer' ? '#fff' : 'var(--color-text)', 
                  fontWeight: 900,
                  marginBottom: '1.5rem'
                }}>
                  {exec.initials}
                </div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--color-text)' }}>{exec.name}</h3>
                <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', margin: 0 }}>{exec.title}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .homepage-leadership-card:hover {
          transform: translateY(-8px);
          background: rgba(var(--foreground-rgb), 0.04) !important;
          border-color: rgba(var(--foreground-rgb), 0.1) !important;
        }
      `}} />
    </section>
  );
}
