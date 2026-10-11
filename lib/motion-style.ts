"use client";

import { useEffect, type RefObject } from "react";
import { cancelFrame, frame, type MotionValue } from "motion/react";

type Value = MotionValue<number> | MotionValue<string>;
type StyleValues = { x?: Value; y?: Value; rotate?: Value; scale?: Value; scaleY?: Value; opacity?: Value };

const len = (v: number | string) => (typeof v === "number" ? `${v}px` : v);

/**
 * Binds MotionValues to an element's transform / opacity, written on Motion's render step.
 * The first-load path uses this instead of `motion.*` elements, which keeps Motion's renderer
 * and animation engine out of first-load JS (§12). Only transform and opacity are written.
 */
export function useMotionStyle(ref: RefObject<HTMLElement | null>, { x, y, rotate, scale, scaleY, opacity }: StyleValues) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const write = () => {
      const t: string[] = [];
      if (x) t.push(`translateX(${len(x.get())})`);
      if (y) t.push(`translateY(${len(y.get())})`);
      if (rotate) t.push(`rotate(${rotate.get()}deg)`);
      if (scale) t.push(`scale(${scale.get()})`);
      if (scaleY) t.push(`scaleY(${scaleY.get()})`);
      if (t.length) el.style.transform = t.join(" ");
      if (opacity) el.style.opacity = String(opacity.get());
    };
    const schedule = () => frame.render(write);
    const values = [x, y, rotate, scale, scaleY, opacity].filter(Boolean) as Value[];
    const unsubscribe = values.map((v) => v.on("change", schedule));
    write();
    return () => {
      unsubscribe.forEach((u) => u());
      cancelFrame(write);
    };
  }, [ref, x, y, rotate, scale, scaleY, opacity]);
}
