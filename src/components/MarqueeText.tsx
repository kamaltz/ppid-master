"use client";

import { useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  enabled: boolean;
  speed?: string;
}

export default function MarqueeText({ text, enabled, speed = "slow" }: MarqueeTextProps) {
  if (!enabled || !text) return null;

  const getSpeedClass = () => {
    switch (speed) {
      case "fast": return "animate-marquee-fast";
      case "medium": return "animate-marquee-medium";
      default: return "animate-marquee";
    }
  };

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
      <div className={`${getSpeedClass()} whitespace-nowrap`}>
        <span className="text-sm font-medium px-4">
          📢 {text}
        </span>
      </div>
    </div>
  );
}