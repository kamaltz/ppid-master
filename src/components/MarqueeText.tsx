"use client";

import { useEffect, useState } from "react";

interface MarqueeTextProps {
  text: string;
  enabled: boolean;
  speed?: string;
  textColor?: string;
  backgroundColor?: string;
  fontSize?: string;
  fontWeight?: string;
}

export default function MarqueeText({ 
  text, 
  enabled, 
  speed = "slow",
  textColor = "#ffffff",
  backgroundColor = "#2563eb",
  fontSize = "14",
  fontWeight = "normal"
}: MarqueeTextProps) {
  if (!enabled || !text) return null;

  const getSpeedClass = () => {
    switch (speed) {
      case "fast": return "animate-marquee-fast";
      case "medium": return "animate-marquee-medium";
      case "very-slow": return "animate-marquee-very-slow";
      default: return "animate-marquee";
    }
  };

  return (
    <div 
      className="py-2 overflow-hidden"
      style={{
        backgroundColor,
        color: textColor
      }}
    >
      <div className={`${getSpeedClass()} whitespace-nowrap`}>
        <span 
          className="px-4"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight
          }}
        >
          📢 {text}
        </span>
      </div>
    </div>
  );
}