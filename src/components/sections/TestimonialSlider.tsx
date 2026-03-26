"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import styles from './TestimonialSlider.module.css';

const testimonials = [
  {
    id: 1,
    name: "Aarav Sharma",
    location: "Mumbai, India",
    text: "The aerodynamic compression fit on the Velocity series is unmatched. I've tested it on long metropolitan runs, and it breathes perfectly. Absolutely worth the investment.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Aarav+Sharma&background=0D1117&color=fff"
  },
  {
    id: 2,
    name: "Priya Patel",
    location: "Delhi, India",
    text: "Stunning quality. I wore the Cashmere trench to a flagship event and the luxury feel is extremely premium. DualDeer truly understands the blend of high-fashion and performance.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Priya+Patel&background=0D1117&color=fff"
  },
  {
    id: 3,
    name: "Rohan Desai",
    location: "Bangalore, India",
    text: "DualDeer's attention to detail is geometric perfection. The international shipping was incredibly fast, and the elite fabrics outlast any other activewear brand I own.",
    rating: 4,
    avatar: "https://ui-avatars.com/api/?name=Rohan+Desai&background=0D1117&color=fff"
  },
  {
    id: 4,
    name: "Ananya Iyer",
    location: "Chennai, India",
    text: "I love the minimalist aesthetic paired with high-performance fabrics. It breathes incredibly well during intense workouts while still looking sophisticated enough for the street.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Ananya+Iyer&background=0D1117&color=fff"
  },
  {
    id: 5,
    name: "Vikram Singh",
    location: "Pune, India",
    text: "Customer service is impeccable. The materials are deeply luxurious. When you wear DualDeer, you instantly feel the engineering precision separating it from the rest.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Vikram+Singh&background=0D1117&color=fff"
  }
];

export default function TestimonialSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // Auto-scroll every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>CLIENT VERDICTS</h2>
          <p className={styles.subtitle}>Voices of the Elite across India</p>
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
                initial={{ opacity: 0, x: direction === 1 ? 50 : -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === 1 ? -50 : 50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <Quote size={40} className={styles.quoteIcon} />
                <p className={styles.reviewText}>"{testimonials[currentIndex].text}"</p>
                
                <div className={styles.starsRow}>
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      fill={i < testimonials[currentIndex].rating ? "#eab308" : "none"} 
                      color={i < testimonials[currentIndex].rating ? "#eab308" : "rgba(255,255,255,0.2)"} 
                    />
                  ))}
                </div>

                <div className={styles.clientProfile}>
                  <img 
                    src={testimonials[currentIndex].avatar} 
                    alt={testimonials[currentIndex].name} 
                    className={styles.avatar} 
                  />
                  <div className={styles.clientInfo}>
                    <h4>{testimonials[currentIndex].name}</h4>
                    <span>{testimonials[currentIndex].location}</span>
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
