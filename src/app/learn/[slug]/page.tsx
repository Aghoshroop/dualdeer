import { notFound } from 'next/navigation';
import Link from 'next/link';
import { guides } from '../guidesData';
import { getGuideContent } from './guideContent';
import styles from './page.module.css';
import Breadcrumb from '@/components/ui/Breadcrumb';

export const revalidate = 86400; // Cache for 24 hours

export async function generateStaticParams() {
  return guides.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  
  if (!guide) {
    return {
      title: 'Guide Not Found | DualDeer',
    };
  }

  return {
    title: `${guide.title} | DualDeer Knowledge Center`,
    description: guide.description,
    alternates: {
      canonical: `https://dualdeer.com/learn/${guide.slug}`,
    },
    openGraph: {
      title: `${guide.title} | DualDeer Knowledge Center`,
      description: guide.description,
      url: `https://dualdeer.com/learn/${guide.slug}`,
      type: 'article',
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function LearnArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  
  if (!guide) {
    notFound();
  }

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": ["Article", "TechArticle"],
    "headline": guide.title,
    "description": guide.description,
    "author": {
      "@type": "Organization",
      "name": "DualDeer Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "DualDeer",
      "logo": {
        "@type": "ImageObject",
        "url": "https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=200"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://dualdeer.com/learn/${guide.slug}`
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className={styles.articleContainer}>
        <div style={{ marginBottom: '2rem' }}>
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Knowledge Center', href: '/learn' },
            { label: guide.title }
          ]} />
        </div>
        
        <header className={styles.header}>
          <h1 className={styles.title}>{guide.title}</h1>
          <p className={styles.description}>{guide.description}</p>
        </header>
        
        {getGuideContent(guide.slug)}
      </article>
    </>
  );
}
