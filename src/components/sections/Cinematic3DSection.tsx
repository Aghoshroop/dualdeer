"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import styles from "./Cinematic3DSection.module.css";
import Link from "next/link";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const frameCount = 50;
const currentFrame = (index: number) =>
  `/3dsection/WhatsApp%20Video%202026-05-16%20at%2010.48.48%20(2)_${index.toString().padStart(3, "0")}.jpg`;

export default function Cinematic3DSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyWrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      if (!canvasRef.current || !stickyWrapperRef.current || !sectionRef.current) return;

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d", { alpha: false }); 
      if (!context) return;

      const images: HTMLImageElement[] = [];
      const imageSeq = { frame: 0 };
      let renderRequested = false;
      let lastRenderedFrame = -1;

      // 1. Preload all frames
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        images.push(img);
      }

      // 2. Render engine via requestAnimationFrame
      const renderFrame = () => {
        renderRequested = false;
        const index = Math.round(imageSeq.frame);
        
        // Draw ONLY when frame changes to prevent redraw spam
        if (index === lastRenderedFrame) return;
        
        const img = images[index];

        if (img && img.complete) {
          // Grab precise CSS dimensions of viewport (the container)
          const cw = window.innerWidth;
          const ch = window.innerHeight;
          const iw = img.width;
          const ih = img.height;

          if (iw === 0 || ih === 0) return;

          // Proper aspect-ratio cover fit mathematically (no CSS stretching)
          const r = Math.max(cw / iw, ch / ih);
          const nw = iw * r;
          const nh = ih * r;
          const nx = cw / 2 - nw / 2;
          const ny = ch / 2 - nh / 2;

          context.drawImage(img, nx, ny, nw, nh);
          lastRenderedFrame = index;
        }
      };

      const requestRender = () => {
        if (!renderRequested) {
          renderRequested = true;
          requestAnimationFrame(renderFrame);
        }
      };

      // 3. Crisp Retina Rendering
      const updateCanvasSize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        
        canvas.width = cw * dpr;
        canvas.height = ch * dpr;
        
        context.scale(dpr, dpr);
        context.imageSmoothingEnabled = true;
        // @ts-ignore
        context.imageSmoothingQuality = "high";

        lastRenderedFrame = -1; 
        requestRender();
      };

      images[0].onload = () => {
        updateCanvasSize();
      };

      window.addEventListener("resize", updateCanvasSize);

      // 4. Clean ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: stickyWrapperRef.current,
          pin: true,
          start: "top top",
          end: "+=250%", 
          scrub: 1,      
          anticipatePin: 1, 
          fastScrollEnd: true,
        },
      });

      tl.to(imageSeq, {
        frame: frameCount - 1,
        snap: "frame",
        ease: "none",
        onUpdate: requestRender,
      }, 0);

      if (contentRef.current) {
        tl.fromTo(contentRef.current, 
          { opacity: 0, y: 50 },
          { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" },
          0.5 
        );
      }

      return () => {
        window.removeEventListener("resize", updateCanvasSize);
        tl.kill();
      };
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className={styles.sectionContainer}>
      
      {/* Mobile-Only Static View */}
      <div className={styles.mobileStaticWrapper}>
        <img src="/file_00000000c8e471fabb8aa20e8fed4be4.png" alt="Collection Preview" className={styles.mobileStaticImage} />
        <div className={styles.mobileOverlayContent}>
          <Link href="/shop" className={styles.ctaButton}>
            Explore Collection
          </Link>
        </div>
      </div>

      {/* Desktop-Only GSAP Scroll Sequence View */}
      <div ref={stickyWrapperRef} className={styles.stickyWrapper}>
        <canvas ref={canvasRef} className={styles.canvasElement} />
        
        <div className={styles.overlay} />

        <div className={styles.overlayContent} ref={contentRef}>
          <Link href="/shop" className={styles.ctaButton}>
            Explore Collection
          </Link>
        </div>
      </div>

    </section>
  );
}
