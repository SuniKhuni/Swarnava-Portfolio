"use client";

import { useCallback, useEffect, useRef, type RefObject } from "react";
import { cancelFrame, frame as onFrame, useMotionValueEvent, useTransform } from "motion/react";
import { useElementProgress, useSpringValue } from "@/lib/scroll";
import { clamp01, easeInOutCubic } from "@/lib/motion";
import { SCREENS } from "@/lib/scene-map";
import { setChannelOverride, type Channel } from "@/lib/channel";

const BTS: Channel = { number: "02", label: "BTS", scene: "signal" };

/**
 * The Dive's timeline, in section progress p (0 → 1 over the pinned scroll).
 * `done` is mirrored by the BTS overlap in hero.css: BTS starts rising the moment the page is orange.
 */
const DIVE = {
  ui: [0.02, 0.18], // the name block and the scroll cue fade out
  zoom: [0.04, 0.7], // the camera pushes in on the lower TV
  power: [0.24, 0.42], // its screen powers on to flat orange: a CRT line opening up
  grow: [0.42, 0.8], // that orange screen grows until it is the page
  done: 0.8,
} as const;

const segment = (v: number, [a, b]: readonly [number, number]) => easeInOutCubic(clamp01((v - a) / (b - a)));

/** Sum layout offsets from `el` up to (not including) `stop`. Ignores live transforms. */
function offsetWithin(el: HTMLElement, stop: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = el;
  while (node && node !== stop) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/**
 * The Dive: scrolling down pushes in on the lower TV, its screen powers on to orange, and that
 * screen grows until it is the page — BTS then rises out of it. Scrolling up plays it back.
 *
 * The camera stops at a moderate zoom (about 2–4×): the photo has no detail to show beyond that,
 * and a 10× push only magnifies pixels. The last stretch is a flat orange rectangle (clip-path on
 * one div, outside the zoomed frame) growing from the TV's on-screen rect to the viewport.
 * The frame stays on its own compositor layer for as long as the Dive is on, so scrolling in and
 * out never promotes or drops a layer mid-motion (that swap is what flashes the images).
 */
export function useDive(
  sectionRef: RefObject<HTMLElement | null>,
  stickyRef: RefObject<HTMLElement | null>,
  frameRef: RefObject<HTMLElement | null>,
  targetRef: RefObject<HTMLElement | null>,
  screenRef: RefObject<HTMLElement | null>,
  enabled: boolean,
) {
  const scrollYProgress = useElementProgress(sectionRef, "pin"); // ["start start", "end end"]
  const p = useSpringValue(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 });
  const power = useTransform(p, (v) => (enabled ? segment(v, DIVE.power) : 0));
  // The name block and the scroll cue step aside as the camera starts to push in.
  const ui = useTransform(p, (v) => (enabled ? 1 - clamp01((v - DIVE.ui[0]) / (DIVE.ui[1] - DIVE.ui[0])) : 1));

  // Geometry in the sticky's box: the TV's centre, size and corner radius at rest.
  const geo = useRef({ S: 1, cx: 0, cy: 0, tw: 1, th: 1, r: 0, vw: 0, vh: 0 });
  const flipped = useRef(false);

  // Written on Motion's render step; one stable callback, so several p changes in a frame collapse.
  const draw = useCallback(() => {
    const frame = frameRef.current;
    const screen = screenRef.current;
    if (!frame || !screen) return;
    const v = p.get();
    const g = geo.current;
    const z = segment(v, DIVE.zoom);
    const s = Math.pow(g.S, z);
    const tx = (g.vw / 2 - g.cx) * z;
    const ty = (g.vh / 2 - g.cy) * z;
    frame.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;

    const k = segment(v, DIVE.grow);
    if (k <= 0) {
      screen.style.visibility = "hidden";
      return;
    }
    // The TV's screen on the page right now, then lerped out to the viewport's edges.
    const hw = (g.tw / 2) * s;
    const hh = (g.th / 2) * s;
    const x = g.cx + tx;
    const y = g.cy + ty;
    const top = (y - hh) * (1 - k);
    const left = (x - hw) * (1 - k);
    const right = (g.vw - x - hw) * (1 - k);
    const bottom = (g.vh - y - hh) * (1 - k);
    screen.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${g.r * s * (1 - k)}px)`;
    screen.style.visibility = "visible";
  }, [frameRef, screenRef, p]);

  useEffect(() => {
    const sticky = stickyRef.current;
    const frame = frameRef.current;
    const target = targetRef.current;
    const screen = screenRef.current;
    if (!enabled || !sticky || !frame || !target || !screen) {
      if (frame) {
        frame.style.transform = "";
        frame.style.transformOrigin = "";
        frame.style.willChange = "";
      }
      if (screen) screen.style.visibility = "hidden";
      return;
    }
    const measure = () => {
      const inFrame = offsetWithin(target, frame);
      const tw = target.offsetWidth;
      const th = target.offsetHeight;
      const ox = inFrame.x + tw / 2;
      const oy = inFrame.y + th / 2;
      const framePos = offsetWithin(frame, sticky); // the sticky is pinned at top: 0 during the Dive
      const vw = sticky.clientWidth;
      const vh = sticky.clientHeight;
      const full = Math.max(vw / tw, vh / th);
      geo.current = {
        // Push in until the screen is about 45% of the width, never past filling the view.
        S: Math.min(full, Math.max(2.2, (0.45 * vw) / tw)),
        cx: framePos.x + ox,
        cy: framePos.y + oy,
        tw,
        th,
        r: (SCREENS.bottom.r / SCREENS.bottom.w) * tw,
        vw,
        vh,
      };
      frame.style.transformOrigin = `${ox}px ${oy}px`;
      draw();
    };
    frame.style.willChange = "transform";
    const ro = new ResizeObserver(measure);
    ro.observe(sticky);
    ro.observe(frame);
    measure();
    return () => {
      ro.disconnect();
      cancelFrame(draw);
      frame.style.transform = "";
      frame.style.transformOrigin = "";
      frame.style.willChange = "";
      screen.style.visibility = "hidden";
    };
  }, [enabled, stickyRef, frameRef, targetRef, screenRef, draw]);

  useMotionValueEvent(p, "change", (v) => {
    if (!enabled) return;
    onFrame.render(draw);
    const past = v >= DIVE.done;
    if (past !== flipped.current) {
      flipped.current = past;
      setChannelOverride(past ? BTS : null);
    }
  });

  useEffect(() => {
    if (!enabled) setChannelOverride(null);
    return () => setChannelOverride(null);
  }, [enabled]);

  return { power, ui };
}
