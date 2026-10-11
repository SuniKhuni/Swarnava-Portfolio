"use client";

import { useEffect, useState } from "react";
import { cycle } from "@/lib/motion";

/** Advances an index every 2.4 s while `active`. `offsetMs` puts a second cycler half a beat out of phase. */
export function useCycle(length: number, { active, initial = 0, offsetMs = 0 }: { active: boolean; initial?: number; offsetMs?: number }) {
  const [index, setIndex] = useState(initial);
  useEffect(() => {
    if (!active || length < 2) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setIndex((i) => (i + 1) % length);
      interval = setInterval(() => setIndex((i) => (i + 1) % length), cycle.everyMs);
    }, cycle.everyMs + offsetMs);
    return () => {
      clearTimeout(first);
      clearInterval(interval);
    };
  }, [active, length, offsetMs]);
  return index;
}

/** The cycling word on a TV. Each new word glitches in (3 frames, 180 ms). */
export function CyclerWord({ index, children, size }: { index: number; children: React.ReactNode; size: "top" | "bottom" | "side" }) {
  return (
    <span className={`crt__word crt__word--${size} fx-rgb`} style={{ "--len": String(children).length } as React.CSSProperties}>
      <span key={index} className="fx-glitch-once">
        {children}
      </span>
    </span>
  );
}
