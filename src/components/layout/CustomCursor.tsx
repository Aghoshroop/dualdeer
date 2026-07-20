"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import styles from "./CustomCursor.module.css";

export default function CustomCursor() {
  const pathname = usePathname();
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  // High-tension spring for snappy, liquid cursor feel
  const cursorSpringX = useSpring(mouseX, { damping: 25, stiffness: 400, mass: 0.1 });
  const cursorSpringY = useSpring(mouseY, { damping: 25, stiffness: 400, mass: 0.1 });
  
  const [cursorState, setCursorState] = useState<"default" | "pointer">("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    // Only show custom cursor on fine pointer devices (desktop/laptops)
    if (window.matchMedia("(pointer: coarse)").matches) return;
    
    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (typeof target.closest !== 'function') return;

      const isClickable = 
        target.tagName.toLowerCase() === 'a' || 
        target.tagName.toLowerCase() === 'button' || 
        target.tagName.toLowerCase() === 'input' || 
        target.tagName.toLowerCase() === 'select' || 
        target.tagName.toLowerCase() === 'textarea' || 
        target.closest('a') || 
        target.closest('button') ||
        target.closest('[data-cursor="pointer"]') ||
        window.getComputedStyle(target).cursor === 'pointer';
        
      setCursorState(isClickable ? "pointer" : "default");
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  useEffect(() => {
    // Check if we are on a premium page
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      if (pathname.startsWith('/product/') || search.includes('premium=true')) {
        setIsPremium(true);
      } else {
        setIsPremium(false);
      }
    }
  }, [pathname]);

  if (!isVisible) return null;

  const isPointer = cursorState === "pointer";

  // Filter for premium pages: Solid white (if original is black) with a golden glow
  // Standard pages: invert(1) grayscale(1)
  const cursorFilter = isPremium 
    ? 'invert(1) drop-shadow(0 0 6px rgba(212,175,55,0.8))' 
    : 'invert(1) grayscale(1)';

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        * {
          cursor: none !important;
        }
      `}} />
      <motion.div 
        id="global-custom-cursor"
        className={styles.cursorWrapper}
        style={{ 
          x: cursorSpringX, 
          y: cursorSpringY,
          mixBlendMode: isPremium ? 'normal' : 'difference'
        }}
      >
        <AnimatePresence mode="wait">
          {!isPointer ? (
            <motion.img
              key="target-cursor"
              src="/target.png"
              alt="Cursor Target"
              initial={{ opacity: 0, scale: 1.2, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, rotate: 360, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 1.2, x: "-50%", y: "-50%" }}
              transition={{
                opacity: { duration: 0.2, ease: "easeInOut" },
                scale: { duration: 0.2, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 15, ease: "linear" }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                objectFit: 'contain',
                width: 40,
                height: 40,
                filter: cursorFilter, 
              }}
            />
          ) : (
            <motion.img
              key="hunting-cursor"
              src="/hunting.png"
              alt="Cursor Hunting"
              initial={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
              animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, scale: 0.8, x: "-50%", y: "-50%" }}
              transition={{
                opacity: { duration: 0.2, ease: "easeInOut" },
                scale: { duration: 0.2, ease: "easeOut" }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                objectFit: 'contain',
                width: 56,
                height: 56,
                filter: cursorFilter, 
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
