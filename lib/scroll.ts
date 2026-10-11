"use client";

// Lean stand-ins for Motion's useScroll / useSpring. They feed the same MotionValues, but
// keep Motion's scroll-timeline and animation engines out of first-load JS (§12); only the
// lazy chunks (Polaroid drag, slider sweep) load those. Nothing here hijacks scroll — it only reads it.

import { useEffect, type RefObject } from "react";
import { motionValue, useMotionValue, type MotionValue } from "motion/react";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* ── Page scroll: one shared listener ── */
const pageY = motionValue(0);
const pageProgress = motionValue(0);
let pageStarted = false;

function startPage() {
  if (pageStarted) return;
  pageStarted = true;
  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    pageY.set(y);
    pageProgress.set(max > 0 ? clamp01(y / max) : 0);
  };
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  new ResizeObserver(update).observe(document.documentElement);
  update();
}

/** scrollY and whole-page progress (0–1). */
export function usePageScroll() {
  useEffect(startPage, []);
  return { scrollY: pageY, progress: pageProgress };
}

/**
 * Progress of an element through the viewport.
 *  "pin":  ["start start", "end end"] — 0 when its top meets the viewport top, 1 when its bottom meets the bottom.
 *  "pass": ["start end", "end start"] — 0 when its top enters at the bottom, 1 when its bottom leaves at the top.
 * Geometry is measured from layout and re-measured on resize, never per frame.
 */
export function useElementProgress(ref: RefObject<HTMLElement | null>, mode: "pin" | "pass") {
  const progress = useMotionValue(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let top = 0;
    let height = 0;
    const update = () => {
      const vh = window.innerHeight;
      const y = window.scrollY;
      if (mode === "pin") {
        const range = height - vh;
        progress.set(range > 0 ? clamp01((y - top) / range) : y >= top ? 1 : 0);
      } else {
        progress.set(clamp01((y + vh - top) / (height + vh)));
      }
    };
    const measure = () => {
      let t = 0;
      for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) t += n.offsetTop;
      top = t;
      height = el.offsetHeight;
      update();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", measure);
    measure();
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", measure);
    };
  }, [ref, mode, progress]);
  return progress;
}

type SpringOptions = { stiffness: number; damping: number; mass?: number; restDelta?: number };

/** A MotionValue that follows `source` on a damped spring (semi-implicit Euler, 8 ms sub-steps). */
export function useSpringValue(source: MotionValue<number>, { stiffness, damping, mass = 1, restDelta = 0.001 }: SpringOptions) {
  const out = useMotionValue(source.get());
  useEffect(() => {
    let velocity = 0;
    let raf = 0;
    let last = 0;
    const tick = (now: number) => {
      let dt = last ? Math.min(0.064, (now - last) / 1000) : 1 / 60;
      last = now;
      let x = out.get();
      const target = source.get();
      while (dt > 0) {
        const h = Math.min(dt, 0.008);
        velocity += ((-stiffness * (x - target) - damping * velocity) / mass) * h;
        x += velocity * h;
        dt -= h;
      }
      if (Math.abs(x - target) < restDelta && Math.abs(velocity) < restDelta * 10) {
        out.set(target);
        velocity = 0;
        raf = 0;
        last = 0;
        return;
      }
      out.set(x);
      raf = requestAnimationFrame(tick);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const unsubscribe = source.on("change", kick);
    kick();
    return () => {
      unsubscribe();
      cancelAnimationFrame(raf);
    };
  }, [source, out, stiffness, damping, mass, restDelta]);
  return out;
}
