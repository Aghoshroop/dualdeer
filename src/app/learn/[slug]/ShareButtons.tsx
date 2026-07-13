"use client";
import React from 'react';

export default function ShareButtons({ url, title }: { url: string, title: string }) {
  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
  };

  const shareLinkedin = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
  };

  const copyLink = () => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>Share this guide:</span>
      <button onClick={shareTwitter} style={{ padding: '0.5rem 1rem', background: '#1DA1F2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
        Twitter
      </button>
      <button onClick={shareLinkedin} style={{ padding: '0.5rem 1rem', background: '#0A66C2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
        LinkedIn
      </button>
      <button onClick={copyLink} style={{ padding: '0.5rem 1rem', background: 'var(--color-background-alt)', border: '1px solid var(--color-border)', color: 'var(--color-text)', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
        Copy Link
      </button>
    </div>
  );
}
