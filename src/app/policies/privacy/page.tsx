import React from 'react';

export const metadata = {
  title: 'Privacy Policy | DualDeer Activewear',
  description: 'DualDeer privacy policy detailing how we collect, use, and protect your personal information.',
  alternates: {
    canonical: 'https://dualdeer.com/policies/privacy',
  },
};

export default function PrivacyPolicyPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Privacy Policy",
    "description": "Privacy policy for DualDeer."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Privacy Policy</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from dualdeer.com.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Information We Collect</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>How We Use Your Information</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
          </p>
        </section>
      </main>
    </>
  );
}
