"use client";

import React, { useState } from "react";
import { OrigamiLogo } from "./origami-logo";

interface NavigationProps {
  onOpenWaitlist: () => void;
  activeSegment: "home-care" | "caregiver-app";
  onSegmentChange: (segment: "home-care" | "caregiver-app") => void;
}

export function Navigation({
  onOpenWaitlist,
  activeSegment,
  onSegmentChange,
}: NavigationProps) {
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("EN");

  return (
    <header className="fixed top-0 left-0 w-full h-[90px] z-50 flex items-center justify-between px-6 sm:px-10 md:px-14 pointer-events-none transition-all duration-300">
      {/* LEFT: Geometric Origami Mark + Language Selector */}
      <div className="flex items-center gap-4 pointer-events-auto">
        <a
          href="#"
          className="flex items-center gap-2 group transition-opacity hover:opacity-80"
          aria-label="ALVICARE Home"
        >
          <OrigamiLogo className="w-6 h-6 transition-transform duration-500 group-hover:scale-105" />
        </a>

        {/* Minimal Language Selector */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="text-[13px] text-[#6E6E73] hover:text-[#454545] font-normal tracking-tight flex items-center gap-1 transition-colors px-1 py-1 rounded-md focus:outline-none focus:ring-1 focus:ring-[#BEBEBE]"
            aria-label="Select Language"
            aria-expanded={langOpen}
          >
            <span>{selectedLang}</span>
            <span className="text-[10px] text-[#BEBEBE] mt-[1px]">⌄</span>
          </button>

          {langOpen && (
            <div className="absolute top-8 left-0 w-24 py-1.5 bg-white/95 backdrop-blur-xl border border-[#DEDEDE] rounded-xl shadow-lg z-50 flex flex-col">
              {["EN", "SIN", "TA"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setSelectedLang(lang);
                    setLangOpen(false);
                  }}
                  className={`px-3 py-1 text-[12px] text-left transition-colors ${
                    selectedLang === lang
                      ? "text-[#454545] font-medium bg-[#F3F3F6]"
                      : "text-[#6E6E73] hover:text-[#454545] hover:bg-[#F8F9FA]"
                  }`}
                >
                  {lang === "EN" ? "English" : lang === "SIN" ? "සිංහල" : "தமிழ்"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CENTRE: Frosted Glass Segmented Pill */}
      <div className="hidden sm:flex items-center pointer-events-auto">
        <nav
          className="flex items-center p-[4px] rounded-[100px] border border-[rgba(222,222,222,0.6)] shadow-[0_2px_12px_rgba(0,0,0,0.03)]"
          style={{
            backgroundColor: "rgba(232, 232, 237, 0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
          aria-label="Primary Navigation Segments"
        >
          <button
            onClick={() => onSegmentChange("home-care")}
            className={`px-4 py-1.5 rounded-[100px] text-[13px] font-normal transition-all duration-300 ${
              activeSegment === "home-care"
                ? "bg-white text-[#454545] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                : "text-[#6E6E73] hover:text-[#454545]"
            }`}
          >
            Home Care
          </button>
          <button
            onClick={() => onSegmentChange("caregiver-app")}
            className={`px-4 py-1.5 rounded-[100px] text-[13px] font-normal transition-all duration-300 ${
              activeSegment === "caregiver-app"
                ? "bg-white text-[#454545] shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
                : "text-[#6E6E73] hover:text-[#454545]"
            }`}
          >
            Caregiver App
          </button>
        </nav>
      </div>

      {/* RIGHT: Minimal Instagram Icon / Sign In / Dark Pill CTA */}
      <div className="flex items-center gap-4 sm:gap-5 pointer-events-auto">
        {/* Minimal Instagram Vector Icon */}
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noreferrer"
          className="text-[#6E6E73] hover:text-[#454545] transition-colors p-1"
          aria-label="Instagram Profile"
        >
          <svg
            className="w-4 h-4 stroke-current fill-none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
        </a>

        {/* Dark Pill Button */}
        <button
          onClick={onOpenWaitlist}
          className="h-[32px] px-4 rounded-[100px] bg-[#454545] hover:bg-[#1D1D1F] text-white text-[13px] font-normal tracking-tight transition-all duration-300 transform active:scale-95 shadow-[0_2px_8px_rgba(69,69,69,0.18)]"
        >
          Order
        </button>
      </div>
    </header>
  );
}
