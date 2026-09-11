"use client";

import { useEffect, useRef, useState } from "react";
import type { Player } from "@/lib/types";

// Snapshots player ranks each time a new results/ended screen appears, so the
// leaderboard can show a rank-change arrow relative to the previous reveal.
export function useRankHistory(
  players: Player[],
  active: boolean,
  revealKey: string,
): Record<string, number> | undefined {
  const snapshotRef = useRef<Record<string, number> | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const [previousRanks, setPreviousRanks] = useState<Record<string, number> | undefined>(undefined);

  useEffect(() => {
    if (!active || lastKeyRef.current === revealKey) return;
    lastKeyRef.current = revealKey;

    setPreviousRanks(snapshotRef.current ?? undefined);

    const currentRanks: Record<string, number> = {};
    players.forEach((p, i) => {
      currentRanks[p.id] = i;
    });
    snapshotRef.current = currentRanks;
  }, [active, revealKey, players]);

  return previousRanks;
}
