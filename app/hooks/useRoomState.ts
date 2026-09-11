"use client";

import { useEffect, useRef, useState } from "react";
import type { RoomStateResponse } from "@/lib/types";

export function useRoomState(code: string) {
  const [data, setData] = useState<RoomStateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function poll() {
      try {
        const res = await fetch(`/api/rooms/${code}/state`, { cache: "no-store" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || `Request failed (${res.status})`);
        }
        const json: RoomStateResponse = await res.json();
        if (cancelled) return;
        setData(json);
        setError(null);
        statusRef.current = json.status;
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load room");
      } finally {
        if (!cancelled) {
          const interval = statusRef.current === "question" ? 1000 : 1800;
          timeoutId = setTimeout(poll, interval);
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [code]);

  return { data, error };
}
