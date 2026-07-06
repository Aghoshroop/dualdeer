import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Return & Exchange Policy | DualDeer Activewear',
  description: 'Understand the return and exchange process for DualDeer premium activewear. We offer a hassle-free 7-day return window.',
};

export default function ReturnsPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Return Policy",
    "description": "Return and exchange process for DualDeer activewear."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Return & Exchange Policy</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>7-Day Guarantee</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            We accept returns up to 7 days after delivery, if the item is unused and in its original condition. We will refund the full order amount minus the shipping costs for the return.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How to Return</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            To initiate a return, please <Link href="/contact" style={{ color: 'var(--color-primary)' }}>contact our support team</Link> with your order number. We will provide you with a return shipping label and instructions.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Exchanges</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            If you need a different size, we offer free exchanges within the 7-day window, subject to inventory availability. The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
          </p>
        </section>
      </main>
    </>
  );
}
