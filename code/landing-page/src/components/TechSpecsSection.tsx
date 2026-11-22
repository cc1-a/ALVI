"use client";

import React from "react";

export function TechSpecsSection() {
  const specs = [
    {
      category: "PHYSICAL & CHASSIS",
      items: [
        { label: "Dimensions", value: "890mm (H) × 494mm (W) × 474mm (D)" },
        { label: "Weight", value: "14.2 kg (with full water caddy)" },
        { label: "Materials", value: "6061 Brushed Aluminium, Slate-Grey Accents, Antimicrobial Coating" },
        { label: "Acoustics", value: "Under 28 dBA at 1 meter during normal transit" },
      ],
    },
    {
      category: "AUTONOMOUS NAVIGATION",
      items: [
        { label: "Spatial Mapping", value: "2D 360° LiDAR (12m range, 0.05m accuracy) + ROS 2 SLAM" },
        { label: "Vision", value: "1080p 30fps Spatial Camera + Dual Optical Drop Sensors" },
        { label: "Obstacle Avoidance", value: "Tri-directional Sonar + Mechanical Front Bump Bumper" },
        { label: "Mobility", value: "High-torque BTS7960 Dual Crawler Drive (Overcomes 20mm doorsills)" },
      ],
    },
    {
      category: "MEDICATION & HYDRATION",
      items: [
        { label: "Carousel Capacity", value: "5-Cylinder Hermetic Moisture-Proof Canisters" },
        { label: "Pill Compatibility", value: "Standard tablets & capsules (0.2mg to 500mg)" },
        { label: "Verification Engine", value: "PIR Hand Presence + IR Break-Beam + MediaPipe 1.5s Vision" },
        { label: "Hydration Caddy", value: "750ml Food-Grade BPA-Free Tritan Bottle with Spring Lock" },
      ],
    },
    {
      category: "COMPANION WEARABLES",
      items: [
        { label: "ALVI CareWatch", value: "Curved Sapphire, Ceramic Back, 4x Emerald PPG, MLX Skin Thermistor" },
        { label: "ALVI CarePendant", value: "Sub-Second SOS Tactile Beacon, Slate-Blue Braided Cord, IP68 Waterproof" },
        { label: "Wireless Protocol", value: "Bluetooth 5.3 Low Energy (15m indoor range, 20-day standby)" },
        { label: "Ecosystem Compatibility", value: "Native ALVICARE Engine + Apple Watch (CoreMotion) & Wear OS" },
      ],
    },
    {
      category: "HEALTH TELEMETRY & PRIVACY",
      items: [
        { label: "Vitals Telemetry", value: "MLX90614 Contactless IR Thermometer (±0.2°C accuracy)" },
        { label: "Smartwatch Link", value: "Bluetooth 5.3 Low Energy (Apple Watch & Wear OS)" },
        { label: "Video Calling", value: "LiveKit WebRTC 720p 30fps with Beamforming Dual Microphones" },
        { label: "Data Governance", value: "Sri Lanka PDPA No. 9 of 2022 & UK GDPR Compliant (Zero Cloud Video)" },
      ],
    },
  ];

  return (
    <section
      id="specifications"
      className="w-full py-28 sm:py-36 bg-white border-t border-[#DEDEDE]"
      aria-label="Technical Specifications"
    >
      <div className="max-w-[1240px] mx-auto px-6 sm:px-12 md:px-16">
        {/* Section Header */}
        <div className="max-w-[720px] mb-16 sm:mb-20">
          <span className="text-[11px] font-mono tracking-widest text-[#5B6B7E] uppercase block mb-3">
            SPECIFICATION MATRIX
          </span>
          <h2
            className="font-normal text-[#454545] tracking-[-0.01em] mb-4"
            style={{
              fontSize: "clamp(34px, 4vw, 51px)",
              lineHeight: 1.1,
            }}
          >
            Technical specifications.
          </h2>
          <p className="text-[15px] sm:text-[16px] text-[#6E6E73] leading-[1.5] font-normal">
            Industrial engineering built to commercial health and safety standards.
          </p>
        </div>

        {/* Minimal Spec Rows */}
        <div className="space-y-12">
          {specs.map((section) => (
            <div key={section.category} className="border-t border-[#DEDEDE] pt-6">
              <span className="text-[11px] font-mono tracking-wider text-[#5B6B7E] font-medium uppercase block mb-6">
                {section.category}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
                {section.items.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between py-2 border-b border-[#DEDEDE]/60 gap-1 text-[13px]"
                  >
                    <span className="text-[#6E6E73] font-normal sm:w-1/3">
                      {item.label}
                    </span>
                    <span className="text-[#454545] font-medium sm:w-2/3 sm:text-right">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
