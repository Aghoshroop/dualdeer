import React from 'react';

export const metadata = {
  title: 'Terms of Service | DualDeer Activewear',
  description: 'Terms and conditions for using the DualDeer website and purchasing our premium activewear.',
};

export default function TermsOfServicePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms of Service",
    "description": "Terms and conditions for DualDeer."
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', maxWidth: '800px', margin: '0 auto', padding: '8rem 2rem 4rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--color-primary)', paddingBottom: '0.5rem', display: 'inline-block' }}>Terms of Service</h1>
        
        <section style={{ marginBottom: '2rem' }}>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            This website is operated by DualDeer. Throughout the site, the terms “we”, “us” and “our” refer to DualDeer.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Online Store Terms</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            By agreeing to these Terms of Service, you represent that you are at least the age of majority in your state or province of residence.
          </p>
        </section>

        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Products or Services</h2>
          <p style={{ opacity: 0.8, lineHeight: 1.6, marginBottom: '1rem' }}>
            Certain products or services may be available exclusively online through the website. These products or services may have limited quantities and are subject to return or exchange only according to our Return Policy.
          </p>
        </section>
      </main>
    </>
  );
}
