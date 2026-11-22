"use client";

import React, { useRef, useEffect, useState, useMemo } from "react";

/**
 * ==============================================================================
 *  WATCH CONFIGURATION VARIABLES
 * ==============================================================================
 *  Tweak any of these variables to change how the watch appears, scales,
 *  positions, and animates behind the 3D robot model.
 * ==============================================================================
 */
export const WATCH_CONFIG = {
  /**
   * 1. DISPLAY MODE:
   *  - "scroll": Scrubs through the 120 transparent exploded frames as you scroll down.
   *  - "loop":   Autoplays the continuous animated transparent WebP in an infinite loop.
   */
  mode: "scroll" as "scroll" | "loop",

  // ----------------------------------------------------------------------------
  // SIZING & SCALE ("make the thing a little bit bigger")
  // ----------------------------------------------------------------------------
  /**
   * Master scale multiplier.
   * Increased to 0.88 for a bolder, more prominent presence behind the robot.
   * Increase (e.g. 0.92, 0.96) or decrease (e.g. 0.82, 0.78).
   */
  scale: 0.88,

  /**
   * Maximum bounding width across desktop screens (increased from 520px).
   */
  maxWidth: "680px",

  /**
   * Maximum bounding height relative to viewport height.
   */
  maxHeight: "75vh",

  // ----------------------------------------------------------------------------
  // TWO-STAGE POSITIONING ("first initial frame goes to position a bit more to top")
  // ----------------------------------------------------------------------------
  /**
   * Initial vertical position (percentage 0-100) behind the robot at rest.
   * 48% aligns directly with the robot's chest/torso at the start.
   */
  initialTop: 48,

  /**
   * Final vertical position (percentage 0-100) reached after initial scroll glide.
   * "a bit more to the top in the last position" -> 34% elevates the watch
   * so it crowns prominently above the robot's shoulders in the final layout.
   */
  finalTop: 34,

  /**
   * Initial horizontal position (percentage 0-100).
   * 50% centers it dead-center behind the robot (matching robot X=0).
   */
  initialLeft: 50,

  /**
   * Final horizontal position (percentage 0-100).
   * 50% keeps it centered on stage. Adjust to e.g. 52% or 54% if desired.
   */
  finalLeft: 50,

  /**
   * Fine-tune horizontal anchor offset (default "-50%" centers the element).
   */
  translateX: "-50%",

  /**
   * Fine-tune vertical anchor offset (default "-50%" centers the element).
   */
  translateY: "-50%",

  // ----------------------------------------------------------------------------
  // STAGE 1: GLIDE / POSITION TIMING (Synchronized with 3D Robot Model)
  // ----------------------------------------------------------------------------
  /**
   * Scroll progress (0.0 to 1.0) where the watch starts gliding from initialTop to finalTop.
   */
  glideStart: 0.02,

  /**
   * Scroll progress (0.0 to 1.0) where the watch reaches its final upper position.
   * Matches the 3D robot model's TRANSITION_END (0.38).
   * During this phase, frames remain strictly locked on Frame 1 (assembled watch).
   */
  glideEnd: 0.38,

  // ----------------------------------------------------------------------------
  // STAGE 2: EXPLODED FRAME SCRUB TIMING ("when everything is in position only then scroll anim starts")
  // ----------------------------------------------------------------------------
  /**
   * Scroll progress (0.0 to 1.0) where the exploded disassembly sequence starts.
   * Strictly set at glideEnd (0.38) so the animation only starts after arriving in position.
   */
  scrollStart: 0.38,

  /**
   * Scroll progress (0.0 to 1.0) where the exploded sequence reaches the final frame.
   */
  scrollEnd: 0.92,

  // ----------------------------------------------------------------------------
  // VISIBILITY & OPACITY FADE
  // ----------------------------------------------------------------------------
  /**
   * If true, the watch is hidden at scroll=0 and smoothly emerges as scroll begins.
   * Set to false if you want the watch visible even at scroll=0.
   */
  hideInInitialFrame: true,

  /**
   * Scroll progress (0.0 to 1.0) where the watch starts to fade in.
   */
  emergeStart: 0.01,

  /**
   * Scroll progress (0.0 to 1.0) where the watch reaches full visibility.
   */
  emergeEnd: 0.16,

  /**
   * Master maximum opacity (0.0 to 1.0).
   */
  opacity: 0.98,

  /**
   * Soft depth shadow behind the watch to match Apple studio lighting.
   */
  dropShadow: "drop-shadow(0 25px 45px rgba(0, 0, 0, 0.12))",

  /**
   * Z-Index layering:
   *  - zIndex 5 places the watch BEHIND the 3D RobotCanvas (z-10)
   *    and in FRONT of the giant background wordmark (z-0).
   */
  zIndex: 5,

  // ----------------------------------------------------------------------------
  // ASSET SOURCES
  // ----------------------------------------------------------------------------
  /**
   * Total number of extracted transparent WebP frames in public/watch_frames/
   */
  totalFrames: 120,

  /**
   * Base URL path for frame sequence.
   */
  framesBaseUrl: "/watch_frames/frame_",

  /**
   * Animated WebP asset source used when mode === "loop"
   */
  loopSrc: "/watch_720p.webp",
};

interface WatchHeroLayerProps {
  scrollProgress: number; // 0.0 to 1.0 from HeroScrollSection
  customConfig?: Partial<typeof WATCH_CONFIG>;
}

export function WatchHeroLayer({
  scrollProgress,
  customConfig,
}: WatchHeroLayerProps) {
  // Merge default config with any custom overrides passed via props
  const config = useMemo(
    () => ({ ...WATCH_CONFIG, ...customConfig }),
    [customConfig]
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // 1. Calculate dynamic vertical & horizontal position (Phase 1 Glide)
  const { currentTop, currentLeft } = useMemo(() => {
    if (scrollProgress <= config.glideStart) {
      return {
        currentTop: `${config.initialTop}%`,
        currentLeft: `${config.initialLeft}%`,
      };
    }

    if (scrollProgress >= config.glideEnd) {
      return {
        currentTop: `${config.finalTop}%`,
        currentLeft: `${config.finalLeft}%`,
      };
    }

    const p =
      (scrollProgress - config.glideStart) /
      (config.glideEnd - config.glideStart);
    // Smooth cubic ease-out
    const ease = 1 - Math.pow(1 - p, 3);

    const topVal =
      config.initialTop + (config.finalTop - config.initialTop) * ease;
    const leftVal =
      config.initialLeft + (config.finalLeft - config.initialLeft) * ease;

    return {
      currentTop: `${topVal.toFixed(2)}%`,
      currentLeft: `${leftVal.toFixed(2)}%`,
    };
  }, [scrollProgress, config]);

  // 2. Calculate dynamic visibility & opacity based on scroll
  const currentOpacity = useMemo(() => {
    if (!config.hideInInitialFrame) {
      return config.opacity;
    }

    if (scrollProgress <= config.emergeStart) {
      return 0; // Completely hidden before scroll starts
    }

    if (scrollProgress >= config.emergeEnd) {
      return config.opacity;
    }

    // Smooth ease-in fade
    const revealP =
      (scrollProgress - config.emergeStart) /
      (config.emergeEnd - config.emergeStart);
    const easeReveal = 1 - Math.pow(1 - revealP, 3);
    return config.opacity * easeReveal;
  }, [scrollProgress, config]);

  // 3. Calculate frame index based on scrollProgress
  // - Before config.scrollStart: locked at Frame 1 (index 0)
  // - After config.scrollStart: scrubs through remaining exploded frames (0 to totalFrames - 1)
  const currentFrameIndex = useMemo(() => {
    if (scrollProgress < config.scrollStart) {
      return 0; // Phase 1: Frame does not move while gliding into position!
    }

    const clampedProgress = Math.min(
      1,
      Math.max(
        0,
        (scrollProgress - config.scrollStart) /
          (config.scrollEnd - config.scrollStart)
      )
    );

    return Math.min(
      config.totalFrames - 1,
      Math.max(0, Math.floor(clampedProgress * (config.totalFrames - 1)))
    );
  }, [scrollProgress, config]);

  // 4. Preload frame sequence for scroll-scrub mode
  useEffect(() => {
    if (config.mode !== "scroll") return;

    let isCancelled = false;
    const images: HTMLImageElement[] = [];
    let loadedCount = 0;

    for (let i = 1; i <= config.totalFrames; i++) {
      const img = new Image();
      const frameNum = String(i).padStart(4, "0");
      img.src = `${config.framesBaseUrl}${frameNum}.webp`;

      img.onload = () => {
        if (isCancelled) return;
        loadedCount++;
        // As soon as the first frame loads, we can render immediately
        if (loadedCount === 1) {
          setImagesLoaded(true);
        }
      };

      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      isCancelled = true;
    };
  }, [config.mode, config.totalFrames, config.framesBaseUrl]);

  // 5. Draw current frame to canvas on scroll
  useEffect(() => {
    if (config.mode !== "scroll") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const currentImg = imagesRef.current[currentFrameIndex];
    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      if (canvas.width !== currentImg.naturalWidth) {
        canvas.width = currentImg.naturalWidth;
        canvas.height = currentImg.naturalHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(currentImg, 0, 0);
    }
  }, [currentFrameIndex, imagesLoaded, config.mode]);

  return (
    <div
      className="absolute pointer-events-none select-none transition-opacity duration-200 ease-out"
      style={{
        zIndex: config.zIndex,
        top: currentTop,
        left: currentLeft,
        transform: `translate(${config.translateX}, ${config.translateY}) scale(${config.scale})`,
        width: "100%",
        maxWidth: config.maxWidth,
        maxHeight: config.maxHeight,
        opacity: currentOpacity,
        filter: config.dropShadow,
        visibility: currentOpacity <= 0 ? "hidden" : "visible",
        willChange: "top, opacity",
      }}
      aria-hidden="true"
    >
      {config.mode === "scroll" ? (
        <canvas
          ref={canvasRef}
          className="w-full h-auto object-contain block"
          style={{
            maxWidth: "100%",
            height: "auto",
            display: "block",
          }}
        />
      ) : (
        /* Looping Animated WebP Mode */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={config.loopSrc}
          alt="ALVI CareWatch Exploded View"
          className="w-full h-auto object-contain block"
          style={{
            maxWidth: "100%",
            height: "auto",
          }}
        />
      )}
    </div>
  );
}
