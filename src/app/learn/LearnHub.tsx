"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { guides, GuideCategory } from './guidesData';
import styles from './page.module.css';
import { motion } from 'framer-motion';

const categories: GuideCategory[] = [
  'SpeedSuits', 'Compression Wear', 'Performance Fabrics', 
  'Recovery', 'Buying Guides', 'Athlete Education', 'Product Care'
];

export default function LearnHub() {
  const [activeCategory, setActiveCategory] = useState<GuideCategory | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGuides = guides.filter(guide => {
    const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
    const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.learnContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Knowledge Center</h1>
        <p className={styles.subtitle}>
          Expert guides, material deep-dives, and performance insights to help you get the most out of your DualDeer activewear.
        </p>
        
        <div className={styles.searchWrapper}>
          <input 
            type="text" 
            placeholder="Search articles, guides, fabrics..." 
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>
      
      <div className={styles.filters}>
        <button 
          className={`${styles.filterBtn} ${activeCategory === 'All' ? styles.active : ''}`}
          onClick={() => setActiveCategory('All')}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.active : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <motion.div layout className={styles.grid}>
        {filteredGuides.length > 0 ? (
          filteredGuides.map((guide) => (
            <Link key={guide.slug} href={`/learn/${guide.slug}`} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image src={guide.heroImage} alt={guide.title} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 33vw" />
                <div className={styles.categoryBadge}>{guide.category}</div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.metaInfo}>
                  <span>{guide.readingTime}</span>
                  <span>&bull;</span>
                  <span>{new Date(guide.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
                <h2 className={styles.cardTitle}>{guide.title}</h2>
                <p className={styles.cardDesc}>{guide.description}</p>
                <div className={styles.authorSection}>
                  <span className={styles.authorName}>{guide.author}</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className={styles.noResults}>
            <h3>No articles found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
