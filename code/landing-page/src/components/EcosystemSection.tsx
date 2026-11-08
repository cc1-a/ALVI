"use client";

import React from "react";

export function EcosystemSection() {
  const cards = [
    {
      badge: "BIOMETRIC STREAM",
      title: "CareWatch Telemetry Link",
      desc: "Connects continuously via low-energy Bluetooth. Streams optical PPG heart rate, MLX skin temperature, and Z-axis fall vectors to ALVI with zero cloud latency.",
      statNumber: "74",
      statUnit: "BPM",
      statLabel: "RESTING HEART RATE · 36.6°C TEMP",
    },
    {
      badge: "CLINICAL LOGGING",
      title: "Verified Medication Records",
      desc: "Every dose is verified through PIR presence, IR drop beam, and MediaPipe vision. Generates tamper-proof adherence reports that your family doctor can trust.",
      statNumber: "100%",
      statUnit: "LOGGED",
      statLabel: "3-STEP OPTICAL VERIFICATION",
    },
    {
      badge: "INSTANT RESPONSE",
      title: "CarePendant & Fall Guard",
      desc: "Correlates smartwatch Z-axis spikes with on-device YOLOv8-pose vision or instant CarePendant SOS trigger. Automatically initiates emergency voice calls within 1.2s.",
      statNumber: "< 1.2s",
      statUnit: "RESPONSE",
      statLabel: "+94 PROTOCOL · WEBRTC 720P",
    },
  ];

  return (
    <section
      id="ecosystem"
      className="w-full py-28 sm:py-36 bg-[#F3F3F6] border-t border-[#DEDEDE]"
      aria-label="Caregiver Ecosystem"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 md:px-16">
        {/* Section Header */}
        <div className="max-w-[720px] mb-16 sm:mb-20">
          <span className="text-[11px] font-mono tracking-widest text-[#5B6B7E] uppercase block mb-3">
            CAREGIVER ECOSYSTEM
          </span>
          <h2
            className="font-normal text-[#454545] tracking-[-0.01em] mb-4"
            style={{
              fontSize: "clamp(34px, 4vw, 51px)",
              lineHeight: 1.1,
            }}
          >
            Connected across generations.
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] leading-[1.5] font-normal">
            Whether you are at work in Colombo, London, or traveling abroad, ALVI gives
            you calm, continuous awareness of your parents&apos; wellbeing.
          </p>
        </div>

        {/* 3 Large Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-[32px] p-8 border border-[#DEDEDE] flex flex-col justify-between hover:shadow-lg transition-all duration-500"
            >
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#5B6B7E] uppercase block mb-4">
                  {card.badge}
                </span>
                <h3 className="text-[22px] font-light text-[#454545] mb-3 leading-snug">
                  {card.title}
                </h3>
                <p className="text-[14px] text-[#6E6E73] leading-[1.6] mb-8">
                  {card.desc}
                </p>
              </div>

              {/* Stat Highlight */}
              <div className="pt-6 border-t border-[#DEDEDE]">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-[36px] font-light text-[#454545] leading-none">
                    {card.statNumber}
                  </span>
                  <span className="text-[13px] font-mono text-[#BEBEBE]">
                    {card.statUnit}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#6E6E73] tracking-wide uppercase">
                  {card.statLabel}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
