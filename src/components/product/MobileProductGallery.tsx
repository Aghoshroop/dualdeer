"use client";

import React, { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import styles from "./ProductDetails.module.css";

interface MobileProductGalleryProps {
  images: string[];
  productName: string;
  onImageTap: (index: number) => void;
}

export default function MobileProductGallery({ images, productName, onImageTap }: MobileProductGalleryProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, skipSnaps: false });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Preload next image
  useEffect(() => {
    if (images.length > 1) {
      const nextIndex = (selectedIndex + 1) % images.length;
      const img = new window.Image();
      img.src = images[nextIndex];
    }
  }, [selectedIndex, images]);

  return (
    <div className={styles.mobileCarouselWrapper}>
      <div className={styles.carouselCounter}>
        {selectedIndex + 1} / {images.length}
      </div>

      <div className={styles.embla} ref={emblaRef}>
        <div className={styles.embla__container}>
          {images.map((img, index) => (
            <div 
              className={styles.embla__slide} 
              key={index} 
              onClick={() => onImageTap(index)}
            >
              <img
                src={img}
                alt={`${productName} image ${index + 1}`}
                className={styles.carouselImage}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.carouselDots}>
        {images.map((_, idx) => (
          <div
            key={idx}
            className={`${styles.carouselDot} ${idx === selectedIndex ? styles.carouselDotActive : ""}`}
            onClick={() => scrollTo(idx)}
          />
        ))}
      </div>
    </div>
  );
}
