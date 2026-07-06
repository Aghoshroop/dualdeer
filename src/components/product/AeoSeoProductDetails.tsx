import React from 'react';
import { Product } from '@/lib/firebaseUtils';
import styles from './AeoSeoProductDetails.module.css';

interface Props {
  product: Product;
}

export default function AeoSeoProductDetails({ product }: Props) {
  // Generate dynamic FAQs based on product category or name
  const isCompression = product.name.toLowerCase().includes('compression') || product.category?.toLowerCase() === 'compression';
  const isSpeedSuit = product.name.toLowerCase().includes('speedsuit');

  const faqs = [
    {
      q: `What is the ${product.name} best used for?`,
      a: `The ${product.name} is designed for high-intensity training, lifting, and cardiovascular workouts. It provides optimal moisture management and durability for elite athletes.`,
      direct: `High-intensity training and active sports.`
    },
    {
      q: `How does the fit of the ${product.name} compare to standard gym wear?`,
      a: `${isCompression ? 'This garment features an ultra-tight, compression fit designed to support muscles and improve circulation. Order your true size for compression, or size up for a relaxed fit.' : 'It features a tailored, athletic fit that skims the body without restricting movement. It is significantly more structured than standard loose cotton gym wear.'}`,
      direct: `${isCompression ? 'Compression fit.' : 'Athletic tailored fit.'}`
    },
    {
      q: `What materials is the ${product.name} made from?`,
      a: `It is crafted from a proprietary hydrophobic blend, typically consisting of advanced polyester for moisture-wicking and elastane (spandex) for 4-way kinetic stretch.`,
      direct: `Hydrophobic synthetic blend (Polyester & Elastane).`
    },
    {
      q: `How should I wash the ${product.name}?`,
      a: `Machine wash cold with similar colors inside out. Do not use fabric softeners or bleach, as they destroy the moisture-wicking properties and elasticity. Air dry or tumble dry on low.`,
      direct: `Machine wash cold, no fabric softener, air dry.`
    },
    {
      q: `Is the ${product.name} suitable for the Indian climate?`,
      a: `Yes. The fabric is engineered specifically to handle high heat and humidity by rapidly pulling sweat away from the skin to evaporate on the surface.`,
      direct: `Yes, highly breathable and moisture-wicking.`
    },
    {
      q: `Does the ${product.name} lose its shape over time?`,
      a: `No. The inclusion of premium elastane gives the fabric strong shape-retention memory, meaning it snaps back to its original fit even after intense, repetitive stretching.`,
      direct: `No, it features shape-retention memory.`
    }
  ];

  return (
    <section className={styles.aeoContainer} aria-labelledby="technical-specs-heading">
      <header className={styles.header}>
        <h2 id="technical-specs-heading" className={styles.title}>Technical Specifications & Details</h2>
        <p className={styles.subtitle}>
          Comprehensive product information for the {product.name}, detailing materials, fit, care instructions, and use cases.
        </p>
      </header>

      <div className={styles.grid}>
        <div>
          <h3 className={styles.sectionTitle}>Material & Construction</h3>
          <dl className={styles.specsList}>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Primary Fabric</dt>
              <dd className={styles.specDesc}>Hydrophobic Polyester Blend</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Stretch Technology</dt>
              <dd className={styles.specDesc}>4-Way Kinetic Elastane</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Seam Construction</dt>
              <dd className={styles.specDesc}>Anti-chafe Flatlock Stitching</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Breathability</dt>
              <dd className={styles.specDesc}>High (Targeted Micro-ventilation)</dd>
            </div>
          </dl>
        </div>

        <div>
          <h3 className={styles.sectionTitle}>Fit & Usage</h3>
          <dl className={styles.specsList}>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Intended Sport</dt>
              <dd className={styles.specDesc}>{isSpeedSuit ? 'Track, Sprinting, Agility' : 'Weightlifting, HIIT, Running'}</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Fit Profile</dt>
              <dd className={styles.specDesc}>{isCompression ? 'Second-Skin Compression' : 'Athletic / Tailored'}</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Climate Suitability</dt>
              <dd className={styles.specDesc}>Hot & Humid (Indian Summers)</dd>
            </div>
            <div className={styles.specItem}>
              <dt className={styles.specTerm}>Care Instructions</dt>
              <dd className={styles.specDesc}>Cold Wash, No Softener, Air Dry</dd>
            </div>
          </dl>
        </div>
      </div>
      
      <div className={styles.tableContainer}>
        <h3 className={styles.sectionTitle} style={{ borderBottom: 'none' }}>Usage Recommendations</h3>
        <table className={styles.recommendationTable}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Recommendation</th>
              <th>Benefits</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Best Season</strong></td>
              <td>All Year (Optimized for Summer/Monsoon)</td>
              <td>Rapid moisture evaporation prevents overheating and keeps you dry.</td>
            </tr>
            <tr>
              <td><strong>Primary Sports</strong></td>
              <td>{isSpeedSuit ? 'Track, Sprinting, Racing' : 'HIIT, Weightlifting, Running'}</td>
              <td>{isCompression ? 'Muscle support, reduced vibration, improved proprioception.' : 'Unrestricted mobility and breathability.'}</td>
            </tr>
            <tr>
              <td><strong>Layering</strong></td>
              <td>Base Layer (Wear directly against skin)</td>
              <td>Maximizes sweat-wicking capillary action of the hydrophobic fibers.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className={styles.faqContainer}>
        <h3 className={styles.sectionTitle} style={{ textAlign: 'center', display: 'block', borderBottom: 'none' }}>Frequently Asked Questions</h3>
        <div itemScope itemType="https://schema.org/FAQPage">
          {faqs.map((faq, idx) => (
            <details key={idx} className={styles.faqItem} itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
              <summary className={styles.faqQuestion} itemProp="name">{faq.q}</summary>
              <div className={styles.faqAnswer} itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                <div itemProp="text">
                  <span className={styles.directAnswer}>{faq.direct}</span>
                  <p>{faq.a}</p>
                </div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
