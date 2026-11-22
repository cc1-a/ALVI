"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

interface CardData {
  id: string;
  title: string;
  location?: string;
  imageSrc: string;
}

export function SystemCarouselSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cards: CardData[] = [
    {
      id: "card-1",
      title: "Minimalist Residence at Dusk",
      location: "Colombo",
      imageSrc: "/images/Gemini_Generated_Image_vvrl4nvvrl4nvvrl.jpg",
    },
    {
      id: "card-2",
      title: "ALVI CareWatch · Biometrics",
      location: "Sapphire & Ceramic",
      imageSrc: "/images/carewatch_studio.png",
    },
    {
      id: "card-3",
      title: "ALVI CarePendant · SOS Beacon",
      location: "Sub-Second Emergency Link",
      imageSrc: "/images/carependant_studio.png",
    },
    {
      id: "card-4",
      title: "Sunlit Kitchen & 3-Step Verification",
      location: "Daylit Modern Counter",
      imageSrc: "/images/front_reference_match.png",
    },
    {
      id: "card-5",
      title: "Master Bedroom & 2D LiDAR SLAM",
      location: "Quiet Living Space",
      imageSrc: "/images/perspective_beauty.png",
    },
    {
      id: "card-6",
      title: "Two-Way Family Connection",
      location: "720p WebRTC Link",
      imageSrc: "/images/rear_reference_match.png",
    },
  ];

  return (
    <section
      className="w-full py-28 sm:py-36 bg-white overflow-hidden"
      aria-label="One system, two parts"
    >
      {/* 1. Centered Section Header */}
      <div className="max-w-[760px] mx-auto text-center px-6 mb-16 sm:mb-20">
        <h2
          className="font-normal text-[#454545] mb-4 tracking-[-0.01em]"
          style={{
            fontSize: "clamp(34px, 4vw, 51px)",
            lineHeight: 1.1,
          }}
        >
          One system, two parts.
        </h2>
        <p className="text-[15px] text-[#6E6E73] leading-[1.5] max-w-[540px] mx-auto font-normal">
          An indoor companion robot that blends into the home. A caregiver web app
          and smartwatch link that quietly watch over every moment. Both built to
          work seamlessly together.
        </p>
      </div>

      {/* 2. Horizontal Draggable Photo Carousel */}
      <div className="relative w-full">
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`flex gap-4 px-6 sm:px-12 md:px-20 overflow-x-auto scrollbar-none snap-x snap-mandatory ${
            isDragging ? "cursor-grabbing select-none" : "cursor-grab"
          }`}
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.id}
              className="relative flex-shrink-0 w-[85vw] sm:w-[540px] md:w-[620px] h-[340px] sm:h-[420px] rounded-[32px] overflow-hidden border border-[#DEDEDE] bg-[#F8F9FA] group snap-start transition-all duration-500 hover:shadow-xl"
            >
              {/* Background Architectural Image */}
              <div className="absolute inset-0">
                <Image
                  src={card.imageSrc}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  sizes="(max-width: 768px) 85vw, 620px"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />
              </div>

              {/* Minimal Whisper-Quiet Bottom Pill Caption */}
              <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between z-10 pointer-events-none">
                <div className="bg-white/92 backdrop-blur-md px-4 py-2 rounded-full border border-white/70 shadow-sm flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5B6B7E]" />
                  <span className="text-[13px] font-medium text-[#454545]">
                    {card.title}
                  </span>
                </div>
                {card.location && (
                  <span className="text-[11px] font-mono text-[#6E6E73] bg-white/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/70">
                    {card.location}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Carousel Hairline Hint */}
      <div className="max-w-[1240px] mx-auto px-6 mt-10">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#DEDEDE]" />
          </div>
          <div className="relative bg-white px-4">
            <span className="text-[12px] text-[#6E6E73] font-normal tracking-wide">
              Scroll or drag to view more
            </span>
          </div>
        </div>
      </div>

      {/* 4. Three Numbered Architectural Columns */}
      <div className="max-w-[1240px] mx-auto px-6 sm:px-10 mt-20 sm:mt-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {/* Column 01 */}
          <div className="pt-6 border-t border-[#DEDEDE]">
            <span className="text-[40px] font-light text-[#BEBEBE] leading-none block mb-4">
              01
            </span>
            <h3 className="text-[22px] font-light text-[#454545] leading-[1.25] mb-3">
              Architectural <br />
              by design.
            </h3>
            <p className="text-[14px] text-[#6E6E73] leading-[1.6]">
              Crafted to architectural standards. With a refined brushed-aluminium
              form, a 5-cylinder medicine carousel, and an integrated water bottle
              holder that complement the spaces they inhabit, rather than compete
              with them.
            </p>
          </div>

          {/* Column 02 */}
          <div className="pt-6 border-t border-[#DEDEDE]">
            <span className="text-[40px] font-light text-[#BEBEBE] leading-none block mb-4">
              02
            </span>
            <h3 className="text-[22px] font-light text-[#454545] leading-[1.25] mb-3">
              Effortless care. <br />
              Every dose.
            </h3>
            <p className="text-[14px] text-[#6E6E73] leading-[1.6]">
              No complex routines, no missed schedules. ALVI navigates from room to
              room via 2D LiDAR and verifies every dose in three steps using PIR
              hand sensing, IR break-beam counting, and MediaPipe vision.
            </p>
          </div>

          {/* Column 03 */}
          <div className="pt-6 border-t border-[#DEDEDE]">
            <span className="text-[40px] font-light text-[#BEBEBE] leading-none block mb-4">
              03
            </span>
            <h3 className="text-[22px] font-light text-[#454545] leading-[1.25] mb-3">
              Instant peace of mind <br />
              between homes.
            </h3>
            <p className="text-[14px] text-[#6E6E73] leading-[1.6]">
              Continuous smartwatch heart-rate telemetry, contactless MLX90614
              temperature checks, dual-confirmed fall detection, and instant 720p
              WebRTC family calling keep you connected to your parents from anywhere.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
