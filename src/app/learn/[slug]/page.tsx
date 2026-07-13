import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { guides } from '../guidesData';
import { getGuideContent } from './guideContent';
import styles from './page.module.css';
import Breadcrumb from '@/components/ui/Breadcrumb';
import TableOfContents from './TableOfContents';
import ShareButtons from './ShareButtons';

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
      images: [{ url: guide.heroImage, width: 1200, height: 630 }],
      publishedTime: guide.lastUpdated,
      authors: [guide.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: guide.title,
      description: guide.description,
      images: [guide.heroImage],
    },
    robots: {
      index: true,
      follow: true,
    }
  };
}

export default async function LearnArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const currentIndex = guides.findIndex((g) => g.slug === slug);
  const guide = guides[currentIndex];
  
  if (!guide) {
    notFound();
  }

  const prevGuide = currentIndex > 0 ? guides[currentIndex - 1] : null;
  const nextGuide = currentIndex < guides.length - 1 ? guides[currentIndex + 1] : null;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.description,
    "image": guide.heroImage,
    "datePublished": guide.lastUpdated,
    "dateModified": guide.lastUpdated,
    "author": {
      "@type": "Person",
      "name": guide.author
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

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://dualdeer.com/" },
      { "@type": "ListItem", "position": 2, "name": "Knowledge Center", "item": "https://dualdeer.com/learn" },
      { "@type": "ListItem", "position": 3, "name": guide.title, "item": `https://dualdeer.com/learn/${guide.slug}` }
    ]
  };

  return (
    <main style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      
      <article className={styles.articleContainer}>
        <div style={{ marginBottom: '2rem' }}>
          <Breadcrumb items={[
            { label: 'Home', href: '/' },
            { label: 'Knowledge Center', href: '/learn' },
            { label: guide.category, href: `/learn?category=${guide.category}` },
            { label: guide.title }
          ]} />
        </div>
        
        <header className={styles.header}>
          <h1 className={styles.title}>{guide.title}</h1>
          <div className={styles.articleMeta}>
            <span>By <strong>{guide.author}</strong></span>
            <span>&bull;</span>
            <span>{new Date(guide.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span>&bull;</span>
            <span>{guide.readingTime}</span>
            <span>&bull;</span>
            <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{guide.category}</span>
          </div>
        </header>

        <div className={styles.articleHero}>
          <Image src={guide.heroImage} alt={guide.title} fill style={{ objectFit: 'cover' }} priority />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '3rem', marginTop: '3rem' }}>
          <div className={styles.content} id="article-content">
            {getGuideContent(guide.slug)}
            
            <ShareButtons url={`https://dualdeer.com/learn/${guide.slug}`} title={guide.title} />
          </div>
          
          <aside style={{ position: 'sticky', top: '100px', height: 'max-content' }}>
            <TableOfContents />
            
            <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--color-background-alt)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Related Guides</h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0 }}>
                {guide.relatedSlugs.map(relatedSlug => {
                  const related = guides.find(g => g.slug === relatedSlug);
                  if (!related) return null;
                  return (
                    <li key={related.slug}>
                      <Link href={`/learn/${related.slug}`} className={styles.relatedLink}>
                        {related.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5rem', paddingTop: '2rem', borderTop: '1px solid var(--color-border)' }}>
          {prevGuide ? (
            <Link href={`/learn/${prevGuide.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>&larr; Previous</span>
              <strong style={{ fontSize: '1.1rem' }}>{prevGuide.title}</strong>
            </Link>
          ) : <div />}
          
          {nextGuide ? (
            <Link href={`/learn/${nextGuide.slug}`} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textDecoration: 'none', color: 'inherit', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Next &rarr;</span>
              <strong style={{ fontSize: '1.1rem', textAlign: 'right' }}>{nextGuide.title}</strong>
            </Link>
          ) : <div />}
        </div>
      </article>
    </main>
  );
}
