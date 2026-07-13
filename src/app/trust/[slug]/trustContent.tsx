import React from 'react';

// Mock content for trust pages
const contentMap: Record<string, React.FC> = {
  'mission-and-philosophy': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>The DualDeer Vision</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        DualDeer was founded on a singular principle: athletic apparel should be an asset, not a distraction. We exist to equip athletes with the highest quality, scientifically engineered gear that genuinely improves performance and comfort.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Our Philosophy</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        We do not believe in fast fashion. We believe in purposeful design. Every seam, every fiber, and every cut is meticulously planned and rigorously tested. We reject marketing fluff in favor of transparency and proven results.
      </p>
    </>
  ),
  'fabric-development': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>The Science of Stretch</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Our proprietary fabric blends are engineered to provide maximum four-way stretch without losing their structural integrity over time. We utilize advanced elastane structures wrapped in high-denier nylon for unparalleled durability and compression recovery.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Moisture Management</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Through capillary action technology embedded at the fiber level, our garments actively pull sweat away from the skin and disperse it across the fabric surface for rapid evaporation, keeping you dry during the most intense workouts.
      </p>
    </>
  ),
  'manufacturing-standards': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Ethical Engineering</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        We partner exclusively with manufacturing facilities that adhere to the strictest global standards for fair labor and environmental responsibility. Our supply chain is fully audited to ensure that the people who craft your gear are treated with the respect they deserve.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Precision Assembly</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        From laser-cut panels to flatlock stitching, our manufacturing process prioritizes precision. This reduces chafing, increases seam strength, and ensures a consistent, locked-in fit across every garment we produce.
      </p>
    </>
  ),
  'quality-control': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>The 50-Wash Guarantee</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Every fabric batch is subjected to a rigorous 50-wash cycle test. We measure colorfastness, elasticity retention, and pilling resistance. If a batch fails to maintain 95% of its original metrics, it is rejected.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Athlete Validation</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Before a product reaches the public, it spends months in the field. We rely on a diverse group of elite athletes—from sprinters to powerlifters—to push our prototypes to their absolute limits and provide uncompromising feedback.
      </p>
    </>
  ),
  'care-instructions': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Washing Best Practices</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <li>Machine wash cold with like colors.</li>
        <li>Use a mild detergent. Avoid fabric softeners as they degrade elastane fibers.</li>
        <li>Turn garments inside out to protect the outer surface.</li>
      </ul>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Drying & Storage</h2>
      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <li>Tumble dry low or, preferably, air dry flat away from direct sunlight.</li>
        <li>Do not iron. Do not dry clean.</li>
      </ul>
    </>
  ),
  'warranty-and-returns': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Our Performance Guarantee</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        We stand by our engineering. If your gear fails due to a defect in materials or workmanship within one year of purchase, we will replace it.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Hassle-Free Returns</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Unworn, unwashed items with tags attached can be returned within 30 days of delivery for a full refund or exchange. Use our automated portal for instant processing.
      </p>
    </>
  ),
  'shipping-process': () => (
    <>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Speed and Reliability</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Orders are processed within 24 hours. We utilize premium courier networks to ensure your gear arrives quickly and securely. You will receive real-time tracking updates at every stage of the journey.
      </p>
      <h2 style={{ fontSize: '1.8rem', marginTop: '2rem', marginBottom: '1rem' }}>Packaging Sustainability</h2>
      <p style={{ marginBottom: '1.5rem' }}>
        Our shipping materials are made from 100% post-consumer recycled materials and are fully recyclable. We minimize excess packaging without compromising the protection of your items.
      </p>
    </>
  ),
};

export const getTrustContent = (slug: string): React.FC => {
  return contentMap[slug] || (() => <p>Content is being updated.</p>);
};
