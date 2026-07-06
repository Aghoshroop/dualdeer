import { Metadata } from 'next';
import Link from 'next/link';
import styles from './page.module.css';
import { guides } from './guidesData';

export const metadata: Metadata = {
  title: 'Knowledge Center & Guides | DualDeer Activewear',
  description: 'Explore comprehensive guides on athletic apparel, moisture-wicking fabrics, compression wear, and sizing from DualDeer.',
  robots: {
    index: true,
    follow: true
  }
};

export default function LearnIndexPage() {
  return (
    <div className={styles.learnContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Knowledge Center</h1>
        <p className={styles.subtitle}>
          Expert guides, material deep-dives, and performance insights to help you get the most out of your DualDeer activewear.
        </p>
      </header>
      
      <div className={styles.grid}>
        {guides.map((guide) => (
          <Link key={guide.slug} href={`/learn/${guide.slug}`} className={styles.card}>
            <h2 className={styles.cardTitle}>{guide.title}</h2>
            <p className={styles.cardDesc}>{guide.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
