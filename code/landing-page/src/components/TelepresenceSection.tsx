"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";

export interface BotTopic {
  id: string;
  num: string;
  title: string;
  headline: string;
  description: string;
  enterFrom: "left" | "right";
}

export const BOT_TOPICS: BotTopic[] = [
  {
    id: "empathy",
    num: "01",
    title: "Autonomous Empathy Engine",
    headline: "Natural expressions that comfort and reassure.",
    description:
      "ALVI recognizes household faces through edge vision, greeting family with gentle micro-interactions and empathetic gaze.",
    enterFrom: "left",
  },
  {
    id: "medication",
    num: "02",
    title: "Scheduled Medication Verification",
    headline: "Clear visual guidance when dose time arrives.",
    description:
      "A soft audible chime and high-contrast prompts illuminate, staying present until onboard sensors confirm the regimen is complete.",
    enterFrom: "right",
  },
  {
    id: "telepresence",
    num: "03",
    title: "Two-Way Telehealth & Family Link",
    headline: "Instant low-latency connection across any distance.",
    description:
      "Directional beamforming audio and encrypted video bring physicians and loved ones directly to the bedside with a single tap.",
    enterFrom: "left",
  },
];

export const BOT_CONFIG = {
  totalFrames: 239,
  framesBaseUrl: "/bot_frames/frame_",
  fallbackWebp: "/bot.webp",
};

const STATEMENT_HEADLINE = "Always present. Never intrusive.";

const STATEMENT_WORDS = [
  "ALVI",
  "runs",
  "quietly",
  "in",
  "the",
  "background.",
  "Machine",
  "intelligence",
  "and",
  "ambient",
  "vision",
  "tune",
  "the",
  "system",
  "around",
  "daily",
  "home",
  "life,",
  "anticipating",
  "care",
  "moments",
  "without",
  "ever",
  "demanding",
  "attention.",
  "An",
  "expressive",
  "companion",
  "when",
  "you",
  "speak,",
  "an",
  "invisible",
  "guardian",
  "when",
  "you",
  "rest.",
];

export function TelepresenceSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // 1. Reduced motion & scroll listener
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };
    mediaQuery.addEventListener("change", handleMediaChange);

    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalScrollable =
        containerRef.current.offsetHeight - window.innerHeight;

      if (totalScrollable <= 0) return;

      // When rect.top > 0, section is entering from below: hold at 0
      if (rect.top > 0) {
        animationFrameId = requestAnimationFrame(() => {
          setScrollProgress(0);
        });
        return;
      }

      // Progress scrubs strictly while locked sticky in viewport
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

  // 2. Preload transparent WebP frame sequence
  useEffect(() => {
    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= BOT_CONFIG.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, "0");
      img.src = `${BOT_CONFIG.framesBaseUrl}${frameNum}.webp`;

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        if (loadedCount >= 10) {
          setImagesLoaded(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, []);

  // 3. Phase Calculations
  // Phase 1 (0.00 -> 0.40): Statement view with word-by-word bold/light-up scroll reveal
  // Phase 2 (0.38 -> 0.46): Seamless slide transition from statement to robot head
  // Phase 3 (0.46 -> 0.90): Pure robot scrubbing through 3 screen modes with side text & bold illumination
  // Phase 4 (0.90 -> 1.00): Soft bottom dissolve into white

  // Statement slide & opacity
  const statementTranslateX = useMemo(() => {
    if (scrollProgress <= 0.08) {
      return -70 * (1 - scrollProgress / 0.08);
    }
    if (scrollProgress > 0.38) {
      const t = Math.min(1, (scrollProgress - 0.38) / 0.09);
      return -90 * t;
    }
    return 0;
  }, [scrollProgress]);

  const statementOpacity = useMemo(() => {
    if (scrollProgress <= 0.04) {
      return scrollProgress / 0.04;
    }
    if (scrollProgress > 0.38) {
      return Math.max(0, 1 - (scrollProgress - 0.38) / 0.08);
    }
    return 1;
  }, [scrollProgress]);

  // Word-by-word reveal for the statement body (progress 0.05 -> 0.36)
  const statementProgress = useMemo(() => {
    if (scrollProgress < 0.05) return 0;
    if (scrollProgress > 0.36) return 1;
    return (scrollProgress - 0.05) / (0.36 - 0.05);
  }, [scrollProgress]);

  // Robot hardware reveal & transition (progress 0.40 -> 0.90)
  const hardwareOpacity = useMemo(() => {
    if (scrollProgress < 0.40) return 0;
    if (scrollProgress >= 0.47) return 1;
    return (scrollProgress - 0.40) / 0.07;
  }, [scrollProgress]);

  const hardwareScale = useMemo(() => {
    if (scrollProgress < 0.40) return 0.92;
    if (scrollProgress >= 0.48) return 1;
    return 0.92 + ((scrollProgress - 0.40) / 0.08) * 0.08;
  }, [scrollProgress]);

  // Robot scrubbing progress across frames (progress 0.46 -> 0.90)
  const scrubProgress = useMemo(() => {
    if (scrollProgress < 0.46) return 0;
    if (scrollProgress > 0.90) return 1;
    return (scrollProgress - 0.46) / (0.90 - 0.46);
  }, [scrollProgress]);

  // 3 Mode Index (0, 1, 2)
  const topicCount = BOT_TOPICS.length;
  const topicSegment = 1 / topicCount;

  const activeTopicIndex = useMemo(() => {
    const idx = Math.floor(scrubProgress / topicSegment);
    return Math.min(topicCount - 1, Math.max(0, idx));
  }, [scrubProgress, topicSegment, topicCount]);

  // Local progress inside active topic (0.00 -> 1.00)
  const topicLocalProgress = useMemo(() => {
    const start = activeTopicIndex * topicSegment;
    const local = (scrubProgress - start) / topicSegment;
    return Math.max(0, Math.min(1, local));
  }, [scrubProgress, activeTopicIndex, topicSegment]);

  // Pre-split words for all 3 topics
  const allTopicWords = useMemo(() => {
    return BOT_TOPICS.map((topic) => {
      const fullText = `${topic.headline} ${topic.description}`;
      return fullText.split(/\s+/).filter(Boolean);
    });
  }, []);

  const activeTopic = BOT_TOPICS[activeTopicIndex];
  const activeWords = allTopicWords[activeTopicIndex] || [];

  // Slide transition calculation for topic text appearing from side
  const { topicOpacity, topicTranslateX } = useMemo(() => {
    const enterDir = activeTopic.enterFrom === "left" ? -1 : 1;
    let opacity = 1;
    let translateX = 0;

    if (topicLocalProgress < 0.14) {
      // Smooth slide-in from side
      const t = topicLocalProgress / 0.14;
      opacity = Math.max(0, t);
      translateX = enterDir * 60 * (1 - t);
    } else if (
      topicLocalProgress > 0.88 &&
      activeTopicIndex < topicCount - 1
    ) {
      // Soft glide out towards opposite side before next mode enters
      const t = (topicLocalProgress - 0.88) / 0.12;
      opacity = Math.max(0, 1 - t);
      translateX = -enterDir * 40 * t;
    }

    return { topicOpacity: opacity, topicTranslateX: translateX };
  }, [topicLocalProgress, activeTopicIndex, topicCount, activeTopic.enterFrom]);

  // Frame calculation (1 to 239)
  const currentFrameIndex = useMemo(() => {
    return Math.min(
      BOT_CONFIG.totalFrames - 1,
      Math.max(0, Math.floor(scrubProgress * (BOT_CONFIG.totalFrames - 1)))
    );
  }, [scrubProgress]);

  // 4. Render to Canvas with Retina DPR
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImg = imagesRef.current[currentFrameIndex];
    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const displayWidth = canvas.clientWidth;
      const displayHeight = canvas.clientHeight;

      if (
        canvas.width !== displayWidth * dpr ||
        canvas.height !== displayHeight * dpr
      ) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      const imgRatio = currentImg.naturalWidth / currentImg.naturalHeight;
      const canvasRatio = displayWidth / displayHeight;

      let drawWidth = displayWidth;
      let drawHeight = displayHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (canvasRatio > imgRatio) {
        drawHeight = displayHeight;
        drawWidth = displayHeight * imgRatio;
        offsetX = (displayWidth - drawWidth) / 2;
      } else {
        drawWidth = displayWidth;
        drawHeight = displayWidth / imgRatio;
        offsetY = (displayHeight - drawHeight) / 2;
      }

      ctx.drawImage(currentImg, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    }
  }, [currentFrameIndex, imagesLoaded]);

  return (
    <section
      id="telepresence"
      ref={containerRef}
      className={`relative w-full ${
        prefersReducedMotion ? "h-auto py-24" : "h-[450vh]"
      } bg-[#111113] text-white selection:bg-white/20`}
      aria-label="ALVICARE Telepresence and Expressive Interface"
    >
      {/* Sticky Full-Viewport Stage */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center px-6 sm:px-12 md:px-16 lg:px-24">

        {/* ============================================================== */}
        {/* PHASE 1: Extra-Large Word-by-Word Scroll Reveal Statement      */}
        {/* ============================================================== */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-6 sm:px-12 md:px-20 z-20 pointer-events-none transition-transform duration-100 ease-out"
          style={{
            opacity: prefersReducedMotion ? 0 : statementOpacity,
            transform: `translateX(${statementTranslateX}px)`,
            display: statementOpacity === 0 ? "none" : "flex",
          }}
        >
          <div className="max-w-[1080px] w-full text-left md:text-center">
            
            {/* Big Headline */}
            <h2
              className="font-normal text-white mb-6 md:mb-8 tracking-[-0.03em] select-none"
              style={{
                fontSize: "clamp(42px, 5.8vw, 84px)",
                lineHeight: 1.05,
              }}
            >
              {STATEMENT_HEADLINE}
            </h2>

            {/* Word-by-Word Illuminating & Bolding Scroll Reveal Paragraph */}
            <p
              className="leading-[1.32] select-none"
              style={{
                fontSize: "clamp(24px, 3.2vw, 42px)",
                letterSpacing: "-0.02em",
              }}
            >
              {STATEMENT_WORDS.map((word, index) => {
                const totalWords = STATEMENT_WORDS.length;
                const wordTarget = index / totalWords;

                let isBold = false;
                let opacity = 0.22;

                if (statementProgress >= wordTarget) {
                  const local = Math.min(
                    1,
                    Math.max(
                      0,
                      (statementProgress - wordTarget) * (totalWords / 2.5)
                    )
                  );
                  opacity = 0.22 + 0.78 * local;
                  if (local > 0.6) {
                    isBold = true;
                  }
                }

                return (
                  <span
                    key={index}
                    className="inline-block mx-[0.14em] transition-all duration-150"
                    style={{
                      opacity,
                      color: isBold ? "#FFFFFF" : "#8E8E93",
                      fontWeight: isBold ? 500 : 300,
                    }}
                  >
                    {word}
                  </span>
                );
              })}
            </p>

            {/* Subtle Scroll Hint */}
            <div className="flex flex-col items-center gap-2 mt-12 opacity-60">
              <span className="text-[11px] font-mono tracking-widest text-[#8E8E93] uppercase">
                Scroll to explore
              </span>
              <div className="w-[1px] h-6 bg-gradient-to-b from-[#8E8E93] to-transparent animate-pulse" />
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* PHASE 2 & 3: Centered Robot & Side Slide-In Topic Animation     */}
        {/* ============================================================== */}
        <div
          className="relative w-full max-w-[1240px] h-full flex flex-col items-center justify-center py-6 sm:py-10 z-20"
          style={{
            opacity: prefersReducedMotion ? 1 : hardwareOpacity,
            transform: `scale(${prefersReducedMotion ? 1 : hardwareScale})`,
            pointerEvents: hardwareOpacity > 0.5 ? "auto" : "none",
          }}
        >
          {/* Ambient Radial Backlight behind Robot */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] rounded-full bg-gradient-to-tr from-[#5B6B7E]/25 via-[#3A4553]/18 to-transparent blur-[140px] pointer-events-none -z-10" />

          {/* Centered Robot Head Hardware Display */}
          <div className="relative w-full max-w-[760px] aspect-[16/10] sm:aspect-[16/9] flex items-center justify-center my-auto">
            {prefersReducedMotion ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={BOT_CONFIG.fallbackWebp}
                alt="ALVI Robot Head Display"
                className="w-full h-full object-contain select-none pointer-events-none filter drop-shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
              />
            ) : (
              <canvas
                ref={canvasRef}
                className="w-full h-full select-none pointer-events-none block filter drop-shadow-[0_30px_70px_rgba(0,0,0,0.9)]"
                style={{
                  width: "100%",
                  height: "100%",
                  display: "block",
                }}
              />
            )}
          </div>

          {/* Large Editorial Text Appearing from Side with Word-by-Word Bolding */}
          <div className="w-full max-w-[960px] text-center px-4 mb-4 select-none">
            <div
              key={activeTopic.id}
              className="transition-transform duration-200 ease-out"
              style={{
                opacity: prefersReducedMotion ? 1 : topicOpacity,
                transform: `translateX(${
                  prefersReducedMotion ? 0 : topicTranslateX
                }px)`,
              }}
            >
              {/* Sleek Topic Pill & Header */}
              <div className="flex items-center justify-center gap-3 mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 font-mono text-[12px] sm:text-[13px] tracking-wider border border-white/15">
                  {activeTopic.num}
                </span>
                <h3
                  className="font-normal text-white tracking-[-0.02em]"
                  style={{
                    fontSize: "clamp(26px, 3.4vw, 44px)",
                    lineHeight: 1.15,
                  }}
                >
                  {activeTopic.title}
                </h3>
              </div>

              {/* Word-by-Word Illuminating & Bolding Topic Paragraph */}
              <p
                className="leading-[1.38] select-none max-w-[820px] mx-auto"
                style={{
                  fontSize: "clamp(19px, 2.3vw, 30px)",
                  letterSpacing: "-0.015em",
                }}
              >
                {activeWords.map((word, wIdx) => {
                  const totalWords = activeWords.length;
                  const wordTarget = wIdx / totalWords;

                  // Illumination progress within the topic window (0.10 -> 0.85)
                  const wordWindowProgress = Math.max(
                    0,
                    Math.min(1, (topicLocalProgress - 0.10) / (0.85 - 0.10))
                  );

                  let isBold = false;
                  let opacity = 0.22;

                  if (wordWindowProgress >= wordTarget) {
                    const local = Math.min(
                      1,
                      Math.max(
                        0,
                        (wordWindowProgress - wordTarget) * (totalWords / 2.2)
                      )
                    );
                    opacity = 0.22 + 0.78 * local;
                    if (local > 0.55) {
                      isBold = true;
                    }
                  }

                  return (
                    <span
                      key={wIdx}
                      className="inline-block mx-[0.14em] transition-all duration-150"
                      style={{
                        opacity: prefersReducedMotion ? 1 : opacity,
                        color: prefersReducedMotion
                          ? "#FFFFFF"
                          : isBold
                          ? "#FFFFFF"
                          : "#8E8E93",
                        fontWeight: prefersReducedMotion
                          ? 400
                          : isBold
                          ? 500
                          : 300,
                      }}
                    >
                      {word}
                    </span>
                  );
                })}
              </p>
            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* PHASE 4: Soft Vertical Gradient Dissolve into White Stage      */}
        {/* ============================================================== */}
        <div
          className="absolute bottom-0 left-0 w-full h-40 pointer-events-none z-30"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.4) 40%, #FFFFFF 100%)",
            opacity: Math.max(0, Math.min(1, (scrollProgress - 0.88) / 0.12)),
          }}
        />

      </div>
    </section>
  );
}