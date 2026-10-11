"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAnimationFrame, useMotionValue, useVelocity } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { usePageScroll } from "@/lib/scroll";
import { marquee } from "@/lib/motion";
import { useLoopActive, useReducedMotionSafe } from "@/lib/hooks";
import { Button } from "../ui/Button";

/* ── One visible pause / play control per section (WCAG 2.2.2) ── */
const PauseContext = createContext<{ paused: boolean; toggle: () => void }>({ paused: false, toggle: () => {} });

export function MarqueeGroup({ children }: { children: ReactNode }) {
  const [paused, setPaused] = useState(false);
  return <PauseContext.Provider value={{ paused, toggle: () => setPaused((p) => !p) }}>{children}</PauseContext.Provider>;
}

export function MarqueePauseButton({ what }: { what: string }) {
  const { paused, toggle } = useContext(PauseContext);
  return (
    <Button
      variant="icon"
      icon={paused ? "play" : "pause"}
      aria-label={paused ? `Play ${what}` : `Pause ${what}`}
      aria-pressed={paused}
      onClick={toggle}
      className="marquee-pause"
    />
  );
}

type MarqueeRowProps = {
  children: ReactNode;
  direction?: 1 | -1;
  speed?: number;
  label: string;
  className?: string;
  /** Centre the content when it is too short to scroll (film strip). */
  centreStatic?: boolean;
};

const wrapTo = (v: number, w: number) => {
  if (w <= 0) return v;
  while (v <= -w) v += w;
  while (v > 0) v -= w;
  return v;
};

/**
 * An endless row that drifts, speeds up with page scroll, pauses, and can be dragged (§7.7).
 * Children render twice; the second copy is aria-hidden and inert. Static — no copy, no
 * motion — with reduced motion or when one copy is narrower than the row.
 */
export function MarqueeRow({ children, direction = -1, speed = marquee.pxPerSec, label, className, centreStatic = false }: MarqueeRowProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const width = useRef(0);
  const hovered = useRef(false);
  const focused = useRef(false);
  const inertia = useRef(0);
  const drag = useRef<{ id: number; startX: number; startVal: number; lastX: number; lastT: number; v: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const track = useRef<HTMLDivElement>(null);
  useMotionStyle(track, { x });

  const reduce = useReducedMotionSafe();
  const { paused } = useContext(PauseContext);
  const active = useLoopActive(wrap, "200px");
  const { scrollY } = usePageScroll();
  const velocity = useVelocity(scrollY);
  const [fits, setFits] = useState(false);
  const still = reduce || fits;

  useEffect(() => {
    const w = wrap.current;
    const c = copy.current;
    if (!w || !c) return;
    const ro = new ResizeObserver(() => {
      width.current = c.offsetWidth;
      setFits(c.offsetWidth <= w.clientWidth);
    });
    ro.observe(w);
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (still) x.set(0);
  }, [still, x]);

  useAnimationFrame((_, dt) => {
    if (still || !active || drag.current) return;
    const w = width.current;
    if (Math.abs(inertia.current) > 2) {
      x.set(wrapTo(x.get() + inertia.current * (dt / 1000), w));
      inertia.current *= marquee.friction;
      return;
    }
    if (hovered.current || focused.current || paused) return;
    const boost = 1 + Math.min(marquee.maxBoost, Math.abs(velocity.get()) / marquee.boostDivisor);
    x.set(wrapTo(x.get() + direction * speed * boost * (dt / 1000), w));
  });

  const onPointerDown = (e: React.PointerEvent) => {
    if (still || (e.pointerType === "mouse" && e.button !== 0)) return;
    inertia.current = 0;
    drag.current = { id: e.pointerId, startX: e.clientX, startVal: x.get(), lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > marquee.dragThresholdPx) {
      d.moved = true;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!d.moved) return;
    const dt = Math.max(1, e.timeStamp - d.lastT);
    d.v = ((e.clientX - d.lastX) / dt) * 1000;
    d.lastX = e.clientX;
    d.lastT = e.timeStamp;
    x.set(wrapTo(d.startVal + dx, width.current)); // 1 : 1 with the pointer
  };
  const endDrag = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (d.moved) {
      inertia.current = d.v;
      suppressClick.current = true;
    }
    drag.current = null;
  };

  return (
    <div
      ref={wrap}
      role="group"
      aria-label={label}
      className={["marquee", className].filter(Boolean).join(" ")}
      data-still={still || undefined}
      data-centre={(centreStatic && fits) || undefined}
      data-cursor={still ? undefined : "DRAG"}
      onPointerEnter={(e) => e.pointerType === "mouse" && (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={(e) => {
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
      onFocusCapture={(e) => {
        focused.current = true;
        if (still || !wrap.current) return;
        // Bring the focused item into view inside the moving track.
        const item = (e.target as HTMLElement).closest<HTMLElement>("[data-marquee-item]");
        if (!item) return;
        const left = item.offsetLeft + x.get();
        const right = left + item.offsetWidth;
        if (left < 0 || right > wrap.current.clientWidth) x.set(wrapTo(-item.offsetLeft + 24, width.current));
      }}
      onBlurCapture={() => (focused.current = false)}
      onDragStart={(e) => e.preventDefault()}
    >
      <div ref={track} className="marquee__track">
        <div ref={copy} className="marquee__copy">
          {children}
        </div>
        {still ? null : (
          <div className="marquee__copy" aria-hidden="true" inert>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
