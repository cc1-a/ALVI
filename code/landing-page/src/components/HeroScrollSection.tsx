"use client";

import React, { useRef, useState, useEffect } from "react";
import { RobotCanvas } from "./RobotCanvas";
import { WatchHeroLayer } from "./WatchHeroLayer";

interface HeroScrollSectionProps {
  onOpenWaitlist: () => void;
}

export function HeroScrollSection({ onOpenWaitlist }: HeroScrollSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    // Scroll listener for sticky 2.2-viewport sequence
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable = containerRef.current.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) return;

      const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));

      animationFrameId = requestAnimationFrame(() => {
        setScrollProgress(progress);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Effective progress (if reduced motion, fix at 0.85 static split state)
  const effectiveProgress = prefersReducedMotion ? 0.85 : scrollProgress;

  // Calculate wordmark opacity & transform
  // 0.0 -> 0.04: full opacity 1
  // 0.04 -> 0.32: slow cinematic fade out from 1 to 0
  const wordmarkOpacity =
    prefersReducedMotion
      ? 0
      : effectiveProgress <= 0.04
      ? 1
      : Math.max(0, 1 - (effectiveProgress - 0.04) / 0.28);
  const wordmarkTranslateY =
    effectiveProgress <= 0.04 ? 0 : -(effectiveProgress - 0.04) * 24;

  // Left column opacity & transform
  // 0.0 -> 0.12: opacity 0
  // 0.12 -> 0.38: smooth fade in as robot moves right, fully ready by 0.38
  const leftColOpacity =
    prefersReducedMotion
      ? 1
      : effectiveProgress <= 0.12
      ? 0
      : Math.min(1, (effectiveProgress - 0.12) / 0.26);
  const leftColTranslateY =
    prefersReducedMotion
      ? 0
      : effectiveProgress <= 0.12
      ? 20
      : 20 * (1 - Math.min(1, (effectiveProgress - 0.12) / 0.26));

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${
        prefersReducedMotion ? "h-screen min-h-[700px]" : "h-[340vh]"
      } bg-white`}
      aria-label="ALVICARE Hero Overview"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col justify-between">
        {/* Giant Background Wordmark: ALVICARE */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 px-4 transition-all duration-300"
          style={{
            opacity: wordmarkOpacity,
            transform: `translateY(${wordmarkTranslateY}px)`,
          }}
        >
          <h1
            className="text-center font-medium uppercase leading-none hero-wordmark-gradient"
            style={{
              fontSize: "clamp(76px, 13.5vw, 210px)",
              letterSpacing: "-0.035em",
              lineHeight: 1.0,
            }}
          >
            ALVICARE
          </h1>
        </div>

        {/* Photorealistic Smartwatch Layer (Positioned at z-[5] Behind the 3D Robot Model) */}
        <WatchHeroLayer scrollProgress={effectiveProgress} />

        {/* Full-bleed 3D Canvas with Scaled-Down Product */}
        <div className="absolute inset-0 z-10">
          <RobotCanvas
            scrollProgress={effectiveProgress}
            showHotspots={false}
          />
        </div>

        {/* Left Hero Column: Minimal Apple-Grade Product Lockup */}
        <div
          className="relative z-20 pointer-events-none w-full h-full flex items-center px-6 sm:px-12 md:px-16 lg:px-24"
          style={{
            opacity: leftColOpacity,
            transform: `translateY(${leftColTranslateY}px)`,
            transition: "opacity 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <div className="max-w-[440px] pointer-events-auto">
            {/* Pure Product Title Lockup */}
            <h2 className="text-[32px] tracking-tight leading-tight mb-2">
              <span className="text-[#454545] font-bold">ALVI</span>{" "}
              <span className="text-[#BEBEBE] font-normal">One</span>
            </h2>

            {/* Whisper-Quiet Subline */}
            <p className="text-[16px] text-[#6E6E73] leading-[1.45] font-normal mb-8">
              The world&apos;s most advanced / autonomous home-care companion
            </p>

            {/* Dark Pill CTA */}
            <div>
              <button
                onClick={onOpenWaitlist}
                className="h-[45px] px-[28px] rounded-[100px] bg-[#454545] hover:bg-[#1D1D1F] text-white text-[14px] font-medium tracking-tight transition-all duration-300 transform active:scale-95 shadow-[0_4px_16px_rgba(69,69,69,0.18)] focus:outline-none focus:ring-2 focus:ring-[#5B6B7E]"
              >
                Reserve Early Access
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Scroll Indicator */}
        {!prefersReducedMotion && scrollProgress < 0.25 && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none select-none transition-opacity duration-500">
            <span className="text-[11px] text-[#BEBEBE] tracking-[0.16em] uppercase font-light">
              Scroll to explore
            </span>
            <div className="w-[1px] h-6 bg-gradient-to-b from-[#BEBEBE] to-transparent animate-pulse" />
          </div>
        )}
      </div>
    </section>
  );
}
