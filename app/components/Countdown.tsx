"use client";

import { useServerCountdown } from "@/app/hooks/useServerCountdown";

const SIZE = 64;
const STROKE = 5;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Countdown({
  questionEndsAt,
  serverNow,
  totalSeconds,
}: {
  questionEndsAt: number;
  serverNow: number;
  totalSeconds?: number;
}) {
  const secondsLeft = useServerCountdown(questionEndsAt, serverNow);
  const urgent = secondsLeft <= 5;
  const fraction = totalSeconds ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 1;
  const offset = CIRCUMFERENCE * (1 - fraction);

  return (
    <div className="relative" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={urgent ? "var(--color-answer-red)" : "var(--color-brand-blue)"}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-200 ease-linear"
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center font-display text-xl font-bold text-white ${
          urgent ? "animate-pulse" : ""
        }`}
      >
        {secondsLeft}
      </div>
    </div>
  );
}
