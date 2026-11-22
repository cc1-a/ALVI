"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const RobotCanvasImpl = dynamic(
  () => import("./RobotCanvasImpl").then((mod) => mod.RobotCanvasImpl),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#DEDEDE] border-t-[#5B6B7E] animate-spin" />
        </div>
      </div>
    ),
  }
);

interface RobotCanvasProps {
  scrollProgress: number;
  showHotspots?: boolean;
}

export function RobotCanvas(props: RobotCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#DEDEDE] border-t-[#5B6B7E] animate-spin" />
        </div>
      </div>
    );
  }

  return <RobotCanvasImpl {...props} />;
}
