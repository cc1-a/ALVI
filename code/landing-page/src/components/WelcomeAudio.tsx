"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const AUDIO_SRC = "/audio/welcome.mp3";
const STORAGE_KEY = "alvicare_welcome_audio_played";

export function WelcomeAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const playSound = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => {
        setIsPlaying(true);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(STORAGE_KEY, "true");
        }
      })
      .catch((err) => {
        // Autoplay policy prevented immediate playback
        console.log("Audio autoplay restricted by browser policy:", err.message);
      });
  }, []);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.preload = "auto";
    audio.volume = 0.85;

    audio.onended = () => {
      setIsPlaying(false);
    };

    audioRef.current = audio;

    // Check if played this session
    const alreadyPlayed =
      typeof window !== "undefined" &&
      sessionStorage.getItem(STORAGE_KEY) === "true";

    if (!alreadyPlayed) {
      // 1. Attempt immediate playback on mount
      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          sessionStorage.setItem(STORAGE_KEY, "true");
        })
        .catch(() => {
          // 2. Browser blocked unprompted autoplay: listen for first natural user interaction
          const handleFirstInteraction = () => {
            if (!hasInteracted) {
              setHasInteracted(true);
              audio
                .play()
                .then(() => {
                  setIsPlaying(true);
                  sessionStorage.setItem(STORAGE_KEY, "true");
                })
                .catch(() => {});
            }
            cleanupListeners();
          };

          const cleanupListeners = () => {
            window.removeEventListener("pointerdown", handleFirstInteraction);
            window.removeEventListener("scroll", handleFirstInteraction);
            window.removeEventListener("keydown", handleFirstInteraction);
            window.removeEventListener("touchstart", handleFirstInteraction);
            window.removeEventListener("wheel", handleFirstInteraction);
          };

          window.addEventListener("pointerdown", handleFirstInteraction, {
            passive: true,
            once: true,
          });
          window.addEventListener("scroll", handleFirstInteraction, {
            passive: true,
            once: true,
          });
          window.addEventListener("keydown", handleFirstInteraction, {
            passive: true,
            once: true,
          });
          window.addEventListener("touchstart", handleFirstInteraction, {
            passive: true,
            once: true,
          });
          window.addEventListener("wheel", handleFirstInteraction, {
            passive: true,
            once: true,
          });
        });
    }

    // Expose replay trigger on window for Nav button
    (window as unknown as { playAlvicareWelcome?: () => void }).playAlvicareWelcome =
      playSound;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [hasInteracted, playSound]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 pointer-events-auto transition-opacity duration-300"
      aria-label="Sound status"
    >
      <button
        onClick={playSound}
        title="Replay Welcome Greeting"
        className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#111113]/85 text-white/80 hover:text-white border border-white/15 backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-200 hover:scale-105 active:scale-95 text-[11px] font-mono tracking-wide"
      >
        <span className="flex items-center gap-[2px] h-3 w-3.5">
          <span
            className={`w-[2.5px] bg-[#5B6B7E] rounded-full transition-all duration-200 ${
              isPlaying ? "h-3 animate-pulse" : "h-1.5"
            }`}
          />
          <span
            className={`w-[2.5px] bg-white rounded-full transition-all duration-200 ${
              isPlaying
                ? "h-2.5 animate-pulse delay-75"
                : "h-2"
            }`}
          />
          <span
            className={`w-[2.5px] bg-[#5B6B7E] rounded-full transition-all duration-200 ${
              isPlaying ? "h-3 animate-pulse delay-150" : "h-1"
            }`}
          />
        </span>
        <span className="select-none">
          {isPlaying ? "ALVICARE Audio" : "Play Intro"}
        </span>
      </button>
    </div>
  );
}
