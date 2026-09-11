"use client";

import { useEffect, useRef, useState } from "react";

// Ticks down locally, corrected for client/server clock skew, so multiple
// components can share one authoritative countdown without drifting apart.
export function useServerCountdown(questionEndsAt: number, serverNow: number): number {
  const offsetRef = useRef(0); // serverNow - Date.now()
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.ceil((questionEndsAt - serverNow) / 1000)),
  );

  useEffect(() => {
    offsetRef.current = serverNow - Date.now();
  }, [serverNow]);

  useEffect(() => {
    const tick = () => {
      const correctedNow = Date.now() + offsetRef.current;
      setSecondsLeft(Math.max(0, Math.ceil((questionEndsAt - correctedNow) / 1000)));
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [questionEndsAt]);

  return secondsLeft;
}
