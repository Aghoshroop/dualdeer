import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { trustPages, getTrustPage } from '../trustData';
import { getTrustContent } from './trustContent';
import styles from '../Trust.module.css';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

export async function generateStaticParams() {
  return trustPages.map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const page = getTrustPage(params.slug);
  if (!page) {
    return { title: 'Not Found | DualDeer Trust Center' };
  }
  return {
    title: `${page.title} | DualDeer Trust Center`,
    description: page.description,
  };
}

export default function TrustDocumentPage({ params }: { params: { slug: string } }) {
  const page = getTrustPage(params.slug);
  if (!page) {
    notFound();
  }

  const ContentBody = getTrustContent(params.slug);

  return (
    <div className={styles.container} style={{ maxWidth: '800px' }}>
      <Link href="/trust" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '3rem', fontSize: '0.9rem', fontWeight: 500 }}>
        <ArrowLeft size={16} /> Back to Trust Center
      </Link>
      
      <div className={styles.hero} style={{ textAlign: 'left', marginBottom: '3rem' }}>
        <h1 className={styles.title} style={{ fontSize: '2.5rem' }}>{page.title}</h1>
        <p className={styles.subtitle} style={{ marginLeft: 0 }}>{page.description}</p>
        <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: 600 }}>
          Last Updated: {new Date(page.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      <article style={{ fontSize: '1.1rem', lineHeight: 1.8, color: 'var(--color-text)' }}>
        <ContentBody />
      </article>
      
      <div style={{ marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between' }}>
        <Link href="/trust" style={{ color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Trust Center Index
        </Link>
      </div>
    </div>
  );
}
