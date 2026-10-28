"use client";

import React from "react";

interface WaveformProps {
  volume: number;
  speaker: "ai" | "you" | null;
  inCall: boolean;
}

export function Waveform({ volume, speaker, inCall }: WaveformProps) {
  const barCount = 18;
  const isAi = speaker === "ai";

  return (
    <div className="flex items-center justify-center gap-1.5 h-10 w-full py-1">
      {Array.from({ length: barCount }).map((_, i) => {
        const offset = Math.abs(i - barCount / 2);
        const factor = Math.max(0.15, 1 - offset / (barCount / 2));
        
        let heightPercent = 20;
        if (inCall && volume > 0.05) {
          const randomized = Math.sin(i * 0.8 + Date.now() * 0.005) * 0.2 + 0.8;
          heightPercent = Math.min(100, Math.max(25, volume * 100 * factor * randomized));
        }

        return (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-150 ${
              !inCall
                ? "bg-slate-200 h-2"
                : isAi
                ? "bg-rose-500"
                : "bg-sky-500"
            }`}
            style={{
              height: inCall ? `${heightPercent}%` : "8px"
            }}
          />
        );
      })}
    </div>
  );
}
