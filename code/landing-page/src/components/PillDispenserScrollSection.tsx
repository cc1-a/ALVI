"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";

/**
 * ==============================================================================
 *  PILL DISPENSER SECTION CONFIGURATION
 * ==============================================================================
 *  Change any value here to tune frame alignment, scaling, lock buffer, and blur.
 *  You can also use the interactive on-screen control pill on the site itself!
 * ==============================================================================
 */
export const PILL_CONFIG = {
  /**
   * Rendering mode:
   * - "custom_frames": Scrubs transparent WebP frames in public/dispenser_frames/ extracted from pill.mp4
   * - "raw_frames": Fallback to raw frames
   * - "video": Directly scrubs pill_dispenser_2s_to_5s.mp4
   */
  mode: "custom_frames" as "custom_frames" | "raw_frames" | "video",

  totalFrames: 71,
  rawFramesBaseUrl: "/dispenser_raw_frames/frame_",
  customFramesBaseUrl: "/dispenser_frames/frame_",
  videoSrc: "/pill_dispenser_2s_to_5s.mp4",

  // 1. HORIZONTAL OFFSET ("take the set of frames /video bit right give me a value ill change it and see")
  // Set to -120px as requested (negative pulls dispenser left and leaves maximum whitespace for text)
  offsetX: -120,

  // 2. SCALE: 1.0 makes the frame height match 100% of the section height
  // ("make sure the height of the sectin and the height of the frames are same so the heigts should be equat")
  scale: 1.0,

  // 3. LOCK-IN BUFFER: Fraction of scroll held locked before movement starts
  // ("once we come to the section lock it in then only the scroll animtion should start")
  lockStartBuffer: 0.08,
  lockEndBuffer: 0.06,

  // 4. WHITE BLURRED OVERLAY: Horizontal position (%) where the soft white blur begins
  // ("put a small white bluured overlay so that only the needed part and the hand it shown and the text its not covered")
  blurOverlayLeftPercent: 42,

  // Typography copy
  title: "Pill dispensing.",
  subline:
    "All you have to do is hold out your hand, and let the advanced autonomous system verify and deliver the exact scheduled dose.",
};

export function PillDispenserScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Live on-screen adjustable values so user can change and test in real-time
  const [offsetX, setOffsetX] = useState(PILL_CONFIG.offsetX);
  const [scale, setScale] = useState(PILL_CONFIG.scale);
  const [blurLeft, setBlurLeft] = useState(PILL_CONFIG.blurOverlayLeftPercent);
  const [showControls, setShowControls] = useState(false);

  // 1. Scroll listener matching StatementSection:
  // - When rect.top > 0, section is still entering from below -> progress stays strictly 0
  // - Once rect.top <= 0, section is locked sticky at top: 0
  // - Applies lockStartBuffer so the section settles locked before the drop begins
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

      // When section is still entering the viewport from below, lock at progress 0
      if (rect.top > 0) {
        animationFrameId = requestAnimationFrame(() => {
          setScrollProgress(0);
        });
        return;
      }

      // Once locked at top <= 0:
      const rawProgress = Math.max(0, Math.min(1, -rect.top / totalScrollable));

      // Apply lock buffers (hold at start, animate in middle, hold at end)
      const startBuf = PILL_CONFIG.lockStartBuffer;
      const endBuf = PILL_CONFIG.lockEndBuffer;

      let effectiveProgress = 0;
      if (rawProgress <= startBuf) {
        effectiveProgress = 0;
      } else if (rawProgress >= 1 - endBuf) {
        effectiveProgress = 1;
      } else {
        effectiveProgress = (rawProgress - startBuf) / (1 - startBuf - endBuf);
      }

      animationFrameId = requestAnimationFrame(() => {
        setScrollProgress(effectiveProgress);
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

  // 2. Preload frame sequence
  useEffect(() => {
    if (PILL_CONFIG.mode === "video") return;

    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    const baseUrl =
      PILL_CONFIG.mode === "raw_frames"
        ? PILL_CONFIG.rawFramesBaseUrl
        : PILL_CONFIG.customFramesBaseUrl;

    for (let i = 1; i <= PILL_CONFIG.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, "0");
      img.src = `${baseUrl}${frameNum}.webp`;

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        if (loadedCount >= 1) {
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

  // 3. Compute active frame index (0..70)
  const currentFrameIndex = useMemo(() => {
    return Math.min(
      PILL_CONFIG.totalFrames - 1,
      Math.max(
        0,
        Math.floor(scrollProgress * (PILL_CONFIG.totalFrames - 1))
      )
    );
  }, [scrollProgress]);

  // 4. Render to Canvas: Height of frame equals height of section!
  useEffect(() => {
    if (PILL_CONFIG.mode === "video") return;
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

      // Height of the frame matches the height of the section
      const drawHeight = displayHeight * scale;
      const aspect = currentImg.naturalWidth / currentImg.naturalHeight;
      const drawWidth = drawHeight * aspect;

      // Vertical centering + horizontal shift
      const y = (displayHeight - drawHeight) / 2;
      const x = offsetX;

      ctx.drawImage(currentImg, x, y, drawWidth, drawHeight);
      ctx.restore();
    }
  }, [currentFrameIndex, imagesLoaded, offsetX, scale]);

  // 5. Video scrubbing handler if video mode is chosen
  useEffect(() => {
    if (PILL_CONFIG.mode !== "video") return;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    video.currentTime = scrollProgress * video.duration;
  }, [scrollProgress]);

  return (
    <section
      ref={containerRef}
      className={`relative w-full ${
        prefersReducedMotion ? "h-auto py-24" : "h-[280vh]"
      } bg-white`}
      aria-label="ALVICARE Pill Dispensing Feature"
    >
      {/* Sticky Full-Viewport Stage: Height matches 100vh */}
      <div className="sticky top-0 left-0 w-full h-screen overflow-hidden bg-white flex items-center justify-between">
        
        {/* Full-Height Canvas Stage spanning section height */}
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          {PILL_CONFIG.mode === "video" ? (
            <video
              ref={videoRef}
              src={PILL_CONFIG.videoSrc}
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover select-none pointer-events-none"
              style={{
                transform: `translateX(${offsetX}px) scale(${scale})`,
              }}
            />
          ) : (
            <canvas
              ref={canvasRef}
              className="w-full h-full select-none pointer-events-none block"
              style={{
                width: "100%",
                height: "100%",
                display: "block",
              }}
            />
          )}
        </div>

        {/* Soft White Blurred Overlay:
            Dissolves the forearm into pure white so only the dispenser and hand are shown,
            and the typography on the right remains 100% uncovered and crisp */}
        <div
          className="absolute inset-y-0 right-0 pointer-events-none z-10 transition-all duration-75"
          style={{
            left: `${blurLeft}%`,
            background:
              "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.65) 20%, rgba(255,255,255,0.95) 55%, #FFFFFF 85%)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            maskImage:
              "linear-gradient(to right, transparent 0%, black 25%, black 100%)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent 0%, black 25%, black 100%)",
          }}
        />

        {/* Right Column: Airform-Style Minimalist Typography placed above overlay (z-20) */}
        <div className="relative z-20 w-full h-full flex items-center justify-end px-6 sm:px-12 md:px-16 lg:px-24 pointer-events-none">
          <div className="w-full max-w-[500px] pointer-events-auto">
            {/* Title: 51px/400 weight matching Airform "Just add water." */}
            <h2
              className="font-normal text-[#454545] mb-4 tracking-[-0.015em]"
              style={{
                fontSize: "clamp(36px, 4.2vw, 54px)",
                lineHeight: 1.1,
              }}
            >
              {PILL_CONFIG.title}
            </h2>

            {/* Subtitle: 16-17px clean muted grotesk */}
            <p className="text-[16px] sm:text-[17px] text-[#6E6E73] font-normal leading-[1.6] max-w-[460px]">
              {PILL_CONFIG.subline}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
