"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.06, // Lower value creates a long, buttery smooth glide (overrides duration/easing)
      wheelMultiplier: 1.1, // Slightly more distance per scroll tick
      smoothWheel: true,
      syncTouch: true, // Ensure mobile users get the same glide
      touchMultiplier: 1.5, // Amplify touch velocity for easier scrolling
      gestureOrientation: "vertical",
      orientation: "vertical",
    });

    // Synchronize Lenis scrolling with GSAP's ScrollTrigger
    lenis.on("scroll", ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0); // Prevents GSAP from skipping frames during heavy scroll

    return () => {
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
