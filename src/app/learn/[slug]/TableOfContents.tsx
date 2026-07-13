"use client";
import React, { useEffect, useState } from 'react';

interface Heading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    // Small delay to ensure content is fully rendered
    setTimeout(() => {
      const contentDiv = document.getElementById('article-content');
      if (!contentDiv) return;

      const elements = Array.from(contentDiv.querySelectorAll('h2, h3'));
      const parsedHeadings: Heading[] = elements.map((el, index) => {
        // Ensure element has an ID
        if (!el.id) {
          el.id = el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `heading-${index}`;
        }
        return {
          id: el.id,
          text: el.textContent || '',
          level: el.tagName === 'H2' ? 2 : 3
        };
      });

      setHeadings(parsedHeadings);

      // Setup Intersection Observer for scroll spy
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      }, { rootMargin: '0px 0px -80% 0px' });

      elements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    }, 100);
  }, []);

  if (headings.length === 0) return null;

  return (
    <div style={{ padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-text)' }}>Table of Contents</h3>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
        {headings.map(heading => (
          <li key={heading.id} style={{ paddingLeft: heading.level === 3 ? '1.5rem' : '0' }}>
            <a 
              href={`#${heading.id}`}
              style={{
                fontSize: '0.9rem',
                textDecoration: 'none',
                color: activeId === heading.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
                fontWeight: activeId === heading.id ? 600 : 400,
                transition: 'color 0.2s',
                display: 'block'
              }}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(heading.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
