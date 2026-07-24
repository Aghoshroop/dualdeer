import React from 'react';
import Link from 'next/link';
import { ArrowDown } from 'lucide-react';

type Executive = 'deer' | 'aritra-sharma' | 'abir-dey' | 'ayushman-haldar';

const EXECUTIVES = [
  { id: 'deer', name: 'Deer', title: 'Founder & Creative Architect', initials: 'D' },
  { id: 'aritra-sharma', name: 'Aritra Sharma', title: 'Head of Operations & Lead Editor', initials: 'AS' },
  { id: 'abir-dey', name: 'Abir Dey', title: 'Lead Brand Model', initials: 'AD' },
  { id: 'ayushman-haldar', name: 'Ayushman Haldar', title: 'Head of Marketing & Social', initials: 'AH' },
];

export default function LeadershipCrossLinks({ currentExecutive }: { currentExecutive: Executive }) {
  const others = EXECUTIVES.filter(exec => exec.id !== currentExecutive);

  return (
    <section style={{ marginTop: '5rem', paddingTop: '4rem', borderTop: '1px solid rgba(var(--foreground-rgb), 0.1)', textAlign: 'center' }}>
      <h3 style={{ fontSize: '2rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '3rem', letterSpacing: '1px' }}>Meet the Leadership Team</h3>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        {others.map((exec, index) => (
          <React.Fragment key={exec.id}>
            <Link href={`/leadership/${exec.id}`} style={{ textDecoration: 'none', width: '100%', maxWidth: '400px' }}>
              <div style={{ 
                background: 'rgba(var(--foreground-rgb), 0.02)', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                border: '1px solid rgba(var(--foreground-rgb), 0.05)',
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                transition: 'transform 0.3s',
              }} 
              className="cross-link-card">
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '50%', 
                  background: exec.id === 'deer' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'rgba(var(--foreground-rgb), 0.1)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '1.2rem', 
                  color: exec.id === 'deer' ? '#fff' : 'var(--color-text)', 
                  fontWeight: 800 
                }}>
                  {exec.initials}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem', color: 'var(--color-text)' }}>{exec.name}</h4>
                  <p style={{ color: 'var(--color-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', margin: 0 }}>{exec.title}</p>
                </div>
              </div>
            </Link>
            {index < others.length - 1 && (
              <ArrowDown size={24} color="var(--color-text)" style={{ opacity: 0.3 }} />
            )}
          </React.Fragment>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `
        .cross-link-card:hover {
          transform: translateY(-5px);
          background: rgba(var(--foreground-rgb), 0.04) !important;
        }
      `}} />
    </section>
  );
}
