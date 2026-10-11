"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useMotionValue } from "motion/react";
import { useSpringValue } from "@/lib/scroll";
import { useMotionStyle } from "@/lib/motion-style";
import { spring } from "@/lib/motion";
import { QUERIES, useMediaQuery } from "@/lib/hooks";

/** A signal chip that follows fine pointers over [data-cursor] elements (§8.4). */
export function CursorChip() {
  const fine = useMediaQuery(QUERIES.finePointer);
  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  const sx = useSpringValue(x, spring.snap);
  const sy = useSpringValue(y, spring.snap);
  const follow = useRef<HTMLDivElement>(null);
  useMotionStyle(follow, { x: sx, y: sy });
  const [label, setLabel] = useState<string | null>(null);
  // Keeps the last label on the chip while it scales away.
  const [shown, setShown] = useState("");
  // A route change swaps the element under a still pointer: drop the chip until it moves.
  const pathname = usePathname();
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setLabel(null);
  }

  useEffect(() => {
    if (!fine) return;
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x.set(e.clientX + 16);
      y.set(e.clientY + 16);
      const el = e.target instanceof Element ? e.target.closest("[data-cursor]") : null;
      const next = el?.getAttribute("data-cursor") || null;
      setLabel(next);
      if (next) setShown(next);
    };
    const leave = () => setLabel(null);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [fine, x, y]);

  // Always mounted (so the position binding has its element); hidden on touch.
  return (
    <div ref={follow} className="cursor-chip" aria-hidden="true" hidden={!fine}>
      <span className="osd-chip" data-tone="signal" data-on={label ? true : undefined}>
        {shown}
      </span>
    </div>
  );
}
