"use client";

import { useRef, type CSSProperties } from "react";
import type { MotionValue } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { DISCO, PLATE } from "@/lib/scene-map";

const ARMS = 8;
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

// Everything per arm is derived from its index — never Math.random() in render.
const arms = Array.from({ length: ARMS }, (_, i) => ({
  turn: `${i * 45 + (i % 2) * 17}deg`,
  reach: pct(DISCO.r * (1.15 + ((i * 3) % 4) * 0.32), PLATE.w),
  k: (0.75 + ((i * 5) % 8) * (0.5 / 7)).toFixed(3), // 30–50 s per turn on a 40 s base
  size: `${24 + ((i * 7) % 4) * 6}%`,
  delay: `calc(var(--dur-glint-pulse) * ${(-((i * 0.26) % 1)).toFixed(2)})`, // phase offset, as a fraction of the pulse
  reverse: i % 3 === 0,
}));

/** Soft dots on arms turning around the mirror ball (§9.1). Clipped to the plate. */
export function DiscoGlints({ x, y }: { x: MotionValue<number>; y: MotionValue<number> }) {
  const move = useRef<HTMLDivElement>(null);
  useMotionStyle(move, { x, y });
  return (
    <>
      <div className="glints" aria-hidden="true">
        <div ref={move} className="glints__move">
          {arms.map((a, i) => (
            <span
              key={i}
              className="glints__arm"
              data-reverse={a.reverse || undefined}
              style={
                {
                  left: pct(DISCO.cx, PLATE.w),
                  top: pct(DISCO.cy, PLATE.h),
                  width: a.reach,
                  rotate: a.turn,
                  "--k": a.k,
                } as CSSProperties
              }
            >
              <span className="glints__dot" style={{ width: a.size, animationDelay: a.delay }} />
            </span>
          ))}
        </div>
      </div>
      <span
        className="glints__debug"
        aria-hidden="true"
        style={{
          left: pct(DISCO.cx - DISCO.r, PLATE.w),
          top: pct(DISCO.cy - DISCO.r, PLATE.h),
          width: pct(DISCO.r * 2, PLATE.w),
          height: pct(DISCO.r * 2, PLATE.h),
        }}
      />
    </>
  );
}
