"use client";

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `https://dualdeer.com${item.href}` : undefined
    }))
  };

  return (
    <>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '1.5rem' }}>
        <ol style={{ 
          listStyle: 'none', 
          padding: 0, 
          margin: 0, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          opacity: 0.8
        }}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {item.href && !isLast ? (
                  <Link href={item.href} style={{ textDecoration: 'none', color: 'inherit', transition: 'opacity 0.2s' }} onMouseOver={(e) => (e.currentTarget.style.opacity = '1')} onMouseOut={(e) => (e.currentTarget.style.opacity = '0.8')}>
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? "page" : undefined} style={{ fontWeight: isLast ? '600' : 'normal', opacity: isLast ? 1 : 0.8 }}>
                    {item.label}
                  </span>
                )}
                {!isLast && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
              </li>
            );
          })}
        </ol>
      </nav>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
    </>
  );
}
