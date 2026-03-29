import React from 'react';
import SeoIntroBlock from '@/components/sections/SeoIntroBlock';
import Link from 'next/link';

export const metadata = {
  title: 'Luxury Collections | DualDeer',
  description: 'Explore our specialized activewear collections and luxury athleisure lines.',
};

export default function CollectionsPage() {
  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', minHeight: '80vh', background: 'var(--color-background)' }}>
      <SeoIntroBlock
        h1="DualDeer Luxury Athletic Collections"
        h2="Curated Performance Gear for Every Pursuit"
        paragraphs={[
          <React.Fragment key="1">
            Welcome to the exclusive DualDeer collections portal. As India&apos;s leading premium activewear brand, we have meticulously curated specialized collections designed directly for your specific athletic and lifestyle needs. Whether you are actively seeking the ultimate compression gear for high-intensity training, lightweight aerodynamic fabrics for competitive endurance running, or simply sophisticated athleisure for your daily urban routine, our distinct collections flawlessly bridge the gap between supreme functionality and high-end fashion.
          </React.Fragment>,
          <React.Fragment key="2">
            Each unique collection represents a dedicated commitment to advanced fabric engineering. We combine state-of-the-art hydrophobic technology, which rapidly manages sweat and moisture, with four-way stretch materials that guarantee total, unrestricted kinetic movement. By categorizing our performance apparel into distinct, focused lines, we ensure that you can easily find the exact tools necessary to confidently crush your personal fitness goals while maintaining an undeniably sharp, commanding aesthetic. <Link href="/shop" style={{ textDecoration: 'underline', color: 'inherit' }}>View all products</Link> to fully discover how our premium collections can inherently elevate your luxury training wardrobe.
          </React.Fragment>,
          <React.Fragment key="3">
            Do not compromise your physical potential with generic sportswear. Our carefully grouped collections allow elite athletes and contemporary professionals to effortlessly build a comprehensive, highly versatile performance wardrobe. From seamless base layers engineered for optimal muscle stabilization to resilient outwear designed to withstand severe weather conditions, our collections provide absolute, uncompromising quality at every single level. Elevate your presence and enhance your resilience with our specialized series of luxury activewear.
          </React.Fragment>
        ]}
      />
      
      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <Link href="/shop" style={{ display: 'inline-block', padding: '1rem 3rem', background: 'var(--color-primary)', color: '#fff', textDecoration: 'none', fontWeight: 600, borderRadius: '30px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Explore Full Catalog
        </Link>
      </div>
    </main>
  );
}
