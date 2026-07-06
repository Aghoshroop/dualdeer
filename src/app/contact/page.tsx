import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | DualDeer Activewear',
  description: 'Get in touch with the DualDeer customer support team for inquiries about orders, sizing, or general questions.',
};

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@type": "Organization",
      "name": "DualDeer",
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@dualdeer.com",
        "availableLanguage": ["English", "Hindi"]
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
      />
      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Contact DualDeer</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '2rem', lineHeight: 1.6 }}>
          We are dedicated to providing you with the highest level of service. If you have any questions regarding our performance apparel, your order, or wholesale inquiries, please reach out.
        </p>

        <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '2rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Customer Support</h2>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}><strong>Email:</strong> <a href="mailto:support@dualdeer.com" style={{ color: 'var(--color-primary)' }}>support@dualdeer.com</a></p>
          <p style={{ marginBottom: '1rem', opacity: 0.8 }}><strong>Response Time:</strong> We aim to respond to all inquiries within 24 hours.</p>
          
          <h3 style={{ fontSize: '1.2rem', marginTop: '2rem', marginBottom: '1rem' }}>Frequently Asked Questions</h3>
          <p style={{ opacity: 0.8 }}>
            Before reaching out, you might find the answer you need in our <Link href="/learn" style={{ color: 'var(--color-primary)' }}>Knowledge Center</Link> or by checking our <Link href="/policies/returns" style={{ color: 'var(--color-primary)' }}>Return Policy</Link>.
          </p>
        </div>
      </main>
    </>
  );
}
