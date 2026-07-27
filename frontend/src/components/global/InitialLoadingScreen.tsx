"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

// easeOutCubic implementation
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

interface InitialLoadingScreenProps {
  percent?: number;
  isFadingOut?: boolean;
}

export default function InitialLoadingScreen({ percent = 0, isFadingOut = false }: InitialLoadingScreenProps) {
  const [smoothPercent, setSmoothPercent] = useState(0);
  
  // To handle the animation
  const currentAnimatedValueRef = useRef(0);
  const targetPercent = Math.min(100, Math.max(0, percent));

  useEffect(() => {
    let animationFrame: number;
    let startTime: number | null = null;
    
    // We must capture the current smoothPercent value to animate FROM it
    // We can't just read smoothPercent directly because it's a state and might be stale in the closure,
    // so we use a ref to track the actual current animated value.
    const startValue = currentAnimatedValueRef.current;
    const endValue = targetPercent;
    const duration = 800;

    if (startValue === endValue) return;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easedProgress = easeOutCubic(progress);
      const currentValue = startValue + (endValue - startValue) * easedProgress;
      
      currentAnimatedValueRef.current = currentValue;
      setSmoothPercent(currentValue);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetPercent]);

  const displayPercent = Math.round(smoothPercent);
  const statusText = "Curating the best experience for you...";

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const content = (
    <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-all duration-500 ${isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="flex flex-col items-center gap-8 max-w-xs w-full px-6">
        {/* Minimalist Progress Tracker */}
        <div className="relative w-full">
          {/* Percentage indicator */}
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Initializing</span>
            <span className="text-white text-4xl font-light font-sans tracking-tighter">
              {displayPercent}<span className="text-sm opacity-50 ml-0.5">%</span>
            </span>
          </div>

          {/* Progress Bar (Thin & Elegant) */}
          <div className="w-full h-[2px] bg-[#ffffff]/10 overflow-hidden rounded-full">
            <div
              className="h-full bg-[#ffffff] shadow-[0_0_8px_rgba(255,255,255,0.5)]"
              style={{ width: `${smoothPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Subtle Status Message */}
        <p className="text-white/60 text-[10px] md:text-xs font-medium tracking-[0.2em] uppercase text-center animate-pulse">
          {statusText}
        </p>
      </div>

      {/* Decorative subtle glow in corners for premium feel */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ffffff]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#ffffff]/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
    </div>
  );

  if (!mounted || typeof document === 'undefined') return null;

  return createPortal(content, document.body);
}
