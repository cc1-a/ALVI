"use client";

import React from "react";

export function DailyRhythmSection() {
  const steps = [
    {
      time: "07:30",
      period: "MORNING",
      title: "Gentle Morning Routine",
      desc: "ALVI glides quietly from its charging dock to the breakfast table. Dispenses prescribed morning vitamins with 250ml water and takes a contactless MLX90614 temperature check.",
    },
    {
      time: "13:00",
      period: "AFTERNOON",
      title: "3-Step Dose Verification",
      desc: "Navigates to the kitchen. Verifies lunchtime dose in 3 steps: PIR hand detection, millisecond IR drop confirmation, and MediaPipe 1.5s hand-to-mouth vision tracking.",
    },
    {
      time: "18:30",
      period: "EVENING",
      title: "Zero-Lag Family Connect",
      desc: "Summoned to the living room via smartwatch tap or autonomous schedule. Connects family members in crystal-clear 720p 30fps LiveKit WebRTC video with two-way beamforming audio.",
    },
    {
      time: "23:00",
      period: "NIGHT",
      title: "Continuous Fall & Ambient Guard",
      desc: "Parks silently at its hallway night waypoint. Keeps continuous dual-trigger watch with smartwatch Z-axis accelerometer and local YOLOv8-pose vision, ready for +94 auto-dial escalation.",
    },
  ];

  return (
    <section
      id="daily-rhythm"
      className="w-full py-28 sm:py-36 bg-white border-t border-[#DEDEDE]"
      aria-label="24-Hour Daily Rhythm"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 md:px-16">
        {/* Section Header */}
        <div className="max-w-[720px] mb-16 sm:mb-20">
          <span className="text-[11px] font-mono tracking-widest text-[#5B6B7E] uppercase block mb-3">
            DAILY TIMELINE
          </span>
          <h2
            className="font-normal text-[#454545] tracking-[-0.01em] mb-4"
            style={{
              fontSize: "clamp(34px, 4vw, 51px)",
              lineHeight: 1.1,
            }}
          >
            Effortless days. Peaceful nights.
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] leading-[1.5] font-normal">
            ALVI operates on a predictable, comforting rhythm designed around your
            parents&apos; habits. No screens to navigate, no buttons to memorize.
          </p>
        </div>

        {/* 4 Column Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div
              key={step.time}
              className="pt-6 border-t border-[#DEDEDE] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-[32px] sm:text-[36px] font-light text-[#BEBEBE] tracking-tight">
                    {step.time}
                  </span>
                  <span className="text-[10px] font-mono tracking-wider text-[#5B6B7E] uppercase bg-[#F3F3F6] px-2.5 py-0.5 rounded-full">
                    {step.period}
                  </span>
                </div>
                <h3 className="text-[19px] font-light text-[#454545] mb-2 leading-snug">
                  {step.title}
                </h3>
                <p className="text-[14px] text-[#6E6E73] leading-[1.6]">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
