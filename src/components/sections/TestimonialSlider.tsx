"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Target } from 'lucide-react';
import styles from './TestimonialSlider.module.css';
import Image from 'next/image';
import { getAllSiteReviews, Review } from '@/lib/firebaseUtils';

// Helper to get initials
const getInitials = (name: string) => {
  const parts = name.split(' ');
  if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0].substring(0, 2).toUpperCase();
  return "AI"; // default
};

const defaultTestimonials = [
  {
    id: 'default_1',
    userName: "Ananya Iyer",
    location: "Chennai, India", // Not natively in Review, but we can pass it if we want. For Review it just uses text.
    text: "I love the minimalist aesthetic paired with high-performance fabrics. It breathes incredibly well during intense workouts while still looking sophisticated enough for the street.",
    rating: 5,
    userAvatar: ""
  },
  {
    id: 'default_2',
    userName: "Aarav Sharma",
    location: "Mumbai, India",
    text: "The aerodynamic compression fit on the Velocity series is unmatched. I've tested it on long metropolitan runs, and it breathes perfectly. Absolutely worth the investment.",
    rating: 5,
    userAvatar: ""
  },
  {
    id: 'default_3',
    userName: "Priya Patel",
    location: "Delhi, India",
    text: "Stunning quality. I wore the Cashmere trench to a flagship event and the luxury feel is extremely premium. DualDeer truly understands the blend of high-fashion and performance.",
    rating: 5,
    userAvatar: ""
  },
  {
    id: 'default_4',
    userName: "Rohan Desai",
    location: "Bangalore, India",
    text: "DualDeer's attention to detail is geometric perfection. The international shipping was incredibly fast, and the elite fabrics outlast any other activewear brand I own.",
    rating: 4,
    userAvatar: ""
  }
];

interface Testimonial {
  id: string;
  userName: string;
  location: string;
  text: string;
  rating: number;
  userAvatar: string;
}

export default function TestimonialSlider() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(defaultTestimonials);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    const fetchRealTimeReviews = async () => {
      try {
        const liveReviews = await getAllSiteReviews();
        if (liveReviews && liveReviews.length > 0) {
          // Merge live reviews with default ones, keeping live first
          // Map live reviews to match UI object structure
          const formattedLive = liveReviews.map(r => ({
            id: r.id,
            userName: r.userName,
            location: "Verified Buyer",
            text: r.text,
            rating: r.rating || 5,
            userAvatar: r.userAvatar || ""
          }));
          
          setTestimonials([...formattedLive, ...defaultTestimonials].slice(0, 10)); // keep max 10
        }
      } catch (e) {
        console.error("Failed to fetch real-time reviews", e);
      }
    };
    
    fetchRealTimeReviews();
  }, []);

  // Auto-scroll every 6 seconds
  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials]);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <Target className={styles.targetIcon} size={32} />
        
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <p className={styles.subtitle}>Voices of the Elite across India</p>
          <h2 className={styles.title}>CLIENT VERDICTS</h2>
        </motion.div>

        <div className={styles.sliderWrapper}>
          <button className={`${styles.arrowBtn} ${styles.leftArrow}`} onClick={handlePrev}>
            <ChevronLeft size={24} />
          </button>

          <div className={styles.carouselView}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentIndex}
                className={styles.testimonialCard}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                {/* Quote Badge Overlapping */}
                <div className={styles.quoteBadge}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                </div>
                
                {/* Background Watermarks */}
                <div className={styles.watermarkQuoteLeft}>“</div>
                <div className={styles.watermarkQuoteRight}>”</div>

                <p className={styles.reviewText}>"{testimonials[currentIndex].text}"</p>
                
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={20} 
                      fill={i < testimonials[currentIndex].rating ? "#eab308" : "none"} 
                      color={i < testimonials[currentIndex].rating ? "#eab308" : "rgba(123, 46, 255, 0.2)"} 
                    />
                  ))}
                </div>

                <div className={styles.clientProfile}>
                  {testimonials[currentIndex].userAvatar ? (
                    <Image 
                      src={testimonials[currentIndex].userAvatar} 
                      alt={testimonials[currentIndex].userName} 
                      className={styles.avatar}
                      width={48}
                      height={48}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.initialsAvatar}>
                      {getInitials(testimonials[currentIndex].userName)}
                    </div>
                  )}
                  <div className={styles.clientInfo}>
                    <h4>{testimonials[currentIndex].userName}</h4>
                    <span>{testimonials[currentIndex].location || 'Verified Client'}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <button className={`${styles.arrowBtn} ${styles.rightArrow}`} onClick={handleNext}>
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Progress Dots */}
        <div className={styles.dotsRow}>
          {testimonials.map((_, i) => (
            <button 
              key={i}
              className={`${styles.dot} ${i === currentIndex ? styles.activeDot : ''}`}
              onClick={() => {
                setDirection(i > currentIndex ? 1 : -1);
                setCurrentIndex(i);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
