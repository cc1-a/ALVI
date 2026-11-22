import React from "react";

export function OrigamiLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Antigravity Geometric Mark"
    >
      {/* Precision geometric origami bird icon matching airform.space aesthetic */}
      <path
        d="M6 8L16 3L26 8L16 13L6 8Z"
        fill="#1D1D1F"
        opacity="0.95"
      />
      <path
        d="M6 8L16 13V29L6 8Z"
        fill="#454545"
      />
      <path
        d="M26 8L16 13V29L26 8Z"
        fill="#5B6B7E"
        opacity="0.88"
      />
      <path
        d="M16 13L21 21L16 29L11 21L16 13Z"
        fill="#FFFFFF"
        opacity="0.22"
      />
    </svg>
  );
}
