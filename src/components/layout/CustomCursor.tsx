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
  const cursorSpringX = useSpring(mouseX, { damping: 25, stiffness: 300, mass: 0.2 });
  const cursorSpringY = useSpring(mouseY, { damping: 25, stiffness: 300, mass: 0.2 });
  
  const [cursorState, setCursorState] = useState<"default" | "pointer" | "view">("default");
  const [cursorText, setCursorText] = useState("VIEW");
  const [isVisible, setIsVisible] = useState(false);
  
  // Dynamic contrast state for brand overlap checks
  const [isPurpleBg, setIsPurpleBg] = useState(false);

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

      // 1. Determine cursor state (default, pointer, or view)
      const viewEl = 
        target.closest('[data-cursor="view"]') ||
        target.closest('[class*="imageBox"]') ||
        target.closest('[class*="previewCard"]') ||
        target.closest('[class*="categoryCard"]') ||
        target.closest('[class*="CategoryCards_card"]') ||
        target.closest('[class*="ProductGrid_imageBox"]') ||
        target.closest('[class*="FeaturedProducts_imageBox"]') ||
        target.closest('[class*="SeasonalShowcaseSlider_previewCard"]');
        
      let nextState: "default" | "pointer" | "view" = "default";
      if (viewEl) {
        nextState = "view";
        const customText = (viewEl as HTMLElement).getAttribute('data-cursor-text') || "VIEW";
        setCursorText(customText);
      } else {
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
          
        nextState = isClickable ? "pointer" : "default";
      }
      setCursorState(nextState);

      // 2. Walk up DOM tree to find computed background color for same-color purple checks
      let elementBgColor = "";
      let el: HTMLElement | null = target;
      while (el && el !== document.documentElement) {
        const bg = window.getComputedStyle(el).backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") {
          elementBgColor = bg;
          break;
        }
        el = el.parentElement;
      }

      if (!elementBgColor && typeof window !== "undefined") {
        elementBgColor = window.getComputedStyle(document.body).backgroundColor;
      }

      // 3. Purple screen detection
      let purple = false;
      if (elementBgColor) {
        const rgb = elementBgColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          const r = parseInt(rgb[0]);
          const g = parseInt(rgb[1]);
          const b = parseInt(rgb[2]);
          purple = b > 150 && r > 80 && g < 120;
        }
      }
      setIsPurpleBg(purple);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  // 4. Define sandwich contrast styling parameters (solid colors instead of blend modes)
  const cursorBgColor = cursorState === "view"
    ? (isPurpleBg ? "#ffffff" : "rgba(123, 47, 247, 0.95)")
    : cursorState === "pointer"
      ? "rgba(255, 255, 255, 0.15)"
      : "#ffffff";

  // Strong solid black border for solid states, solid white border for pointer ring
  const cursorBorder = cursorState === "view"
    ? "2.5px solid #000000"
    : cursorState === "pointer"
      ? "2px solid #ffffff"
      : "2.5px solid #000000"; // Strong black rim over the solid white dot

  // Multi-layered shadow system to guarantee high contrast on both dark and light backdrops
  const cursorShadow = cursorState === "view"
    ? "0 0 0 2px #ffffff, 0 10px 30px rgba(0,0,0,0.3)"
    : cursorState === "pointer"
      ? "0 0 0 2px #000000, inset 0 0 0 1px #000000" // White ring sandwiched between black outer rim and black inner rim
      : "0 0 0 1.5px #ffffff"; // White outer halo to separate the strong black rim from dark backgrounds/photos

  const cursorTextColor = isPurpleBg ? "rgba(123, 47, 247, 0.95)" : "#ffffff";

  return (
    <motion.div 
      className={styles.cursorWrapper}
      style={{ x: cursorSpringX, y: cursorSpringY }}
    >
      <motion.div
        className={styles.customCursor}
        style={{
          mixBlendMode: "normal" // Keep colors pure and solid, relying on sandwich outlines for contrast
        }}
        animate={{
          width: cursorState === "view" ? 80 : cursorState === "pointer" ? 36 : 14,
          height: cursorState === "view" ? 80 : cursorState === "pointer" ? 36 : 14,
          backgroundColor: cursorBgColor,
          border: cursorBorder,
          boxShadow: cursorShadow
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.4 }}
      >
        <AnimatePresence>
          {cursorState === "view" && (
            <motion.span 
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={styles.cursorText}
              style={{ color: cursorTextColor }}
            >
              {cursorText}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
