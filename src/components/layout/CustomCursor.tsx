"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useMotionValue, useSpring } from "framer-motion";
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

  if (!isVisible) return null;

  const isPointer = cursorState === "pointer";

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        * {
          cursor: none !important;
        }
      `}} />
      <motion.div 
        className={styles.cursorWrapper}
        style={{ 
          x: cursorSpringX, 
          y: cursorSpringY,
          mixBlendMode: 'difference' // Must be on the element with z-index/transform!
        }}
      >
        {/* Default Target Cursor - Always spinning */}
        <motion.img
          src="/target.png"
          alt="Cursor Target"
          animate={{
            opacity: isPointer ? 0 : 1,
            scale: isPointer ? 1.2 : 1, // Expands slightly as it fades out
            width: isPointer ? 56 : 40,
            height: isPointer ? 56 : 40,
            rotate: 360
          }}
          transition={{
            opacity: { duration: 0.4, ease: "easeInOut" },
            scale: { duration: 0.4, ease: "easeOut" },
            width: { type: "spring", stiffness: 200, damping: 20 },
            height: { type: "spring", stiffness: 200, damping: 20 },
            rotate: { repeat: Infinity, duration: 15, ease: "linear" },
          }}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            objectFit: 'contain',
            filter: 'invert(1) grayscale(1)', 
          }}
        />

        {/* Hover Hunting Cursor - 100% Static */}
        <motion.img
          src="/hunting.png"
          alt="Cursor Hunting"
          animate={{
            opacity: isPointer ? 1 : 0,
            scale: isPointer ? 1 : 0.8, // Gently zooms in as it appears
            width: isPointer ? 56 : 40,
            height: isPointer ? 56 : 40,
            rotate: 0
          }}
          transition={{
            opacity: { duration: 0.3, ease: "easeInOut" },
            scale: { duration: 0.3, ease: "easeOut" },
            width: { type: "spring", stiffness: 200, damping: 20 },
            height: { type: "spring", stiffness: 200, damping: 20 },
            rotate: { duration: 0 }
          }}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            objectFit: 'contain',
            filter: 'invert(1) grayscale(1)', 
          }}
        />
      </motion.div>
    </>
  );
}
