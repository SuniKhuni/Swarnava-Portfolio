"use client";

import { useLayoutEffect, useRef } from "react";
import { timing } from "@/lib/motion";
import { BrushWordmark } from "./BrushWordmark";

/**
 * First load in a session: the red brushed SWARNAVA paints in on black, holds, then flies
 * into its place behind the subject while the black splits away like a CRT warming up.
 *
 * Paint and hold are pure CSS from the first frame. The flight needs the hero wordmark's
 * box, so it starts (data-go) once this has measured it and the hold is over — if hydration
 * is slow, the tape simply holds a little longer. Off with reduced motion, without JS,
 * and on repeat visits in the session (html.powered). A click skips it. Nothing plays
 * until the hero's images are decoded (`ready`), so neither copy of the name paints in bands.
 */
type IntroProps = {
  heroWordmark: React.RefObject<HTMLDivElement | null>;
  /** The hero's images are decoded: until then the tape holds on black (paused animations). */
  ready: boolean;
};

export function Intro({ heroWordmark, ready }: IntroProps) {
  const root = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    const w = word.current;
    const target = heroWordmark.current;
    const html = document.documentElement;
    if (!ready || !el || !w || !target || html.classList.contains("powered")) return;
    if (getComputedStyle(el).display === "none") return; // reduced motion / no JS

    // Fly from the intro's box to the hero wordmark's box (transform-origin: top left).
    const a = target.getBoundingClientRect();
    const b = w.getBoundingClientRect();
    if (window.scrollY > 0 || a.bottom < 0 || a.top > window.innerHeight) {
      el.dataset.skip = "";
    } else {
      w.style.setProperty("--dx", `${a.left - b.left}px`);
      w.style.setProperty("--dy", `${a.top - b.top}px`);
      w.style.setProperty("--s", String(a.width / b.width));
    }

    // Start the flight when the CSS hold ends. The paint animation started with the first
    // frame, so its currentTime says how much of delay + paint + hold has already passed.
    const paint = w.getAnimations({ subtree: true }).find((an) => (an as CSSAnimation).animationName === "intro-paint");
    const holdEnd = (timing.intro.delay + timing.intro.paint + timing.intro.hold) * 1000;
    const elapsed = typeof paint?.currentTime === "number" ? paint.currentTime : 0;
    const t = setTimeout(() => (el.dataset.go = ""), Math.max(0, holdEnd - elapsed));
    return () => clearTimeout(t);
  }, [heroWordmark, ready]);

  const finish = (e: React.AnimationEvent) => {
    const html = document.documentElement;
    if (e.animationName === "intro-land") html.classList.add("intro-landed");
    if (e.animationName === "intro-done") {
      html.classList.add("powered", "intro-landed");
    }
  };

  return (
    <div
      ref={root}
      className="intro"
      data-ready={ready || undefined}
      aria-hidden="true"
      onAnimationEnd={finish}
      onClick={() => {
        if (root.current) root.current.dataset.skip = "";
        document.documentElement.classList.add("intro-landed");
      }}
    >
      <span className="intro__half intro__half--top" />
      <span className="intro__half intro__half--bottom" />
      <BrushWordmark ref={word} className="intro__word" priority />
    </div>
  );
}
