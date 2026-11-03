"use client";

import { useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { quadMatrix, rectVars, type SceneRect } from "@/lib/scene-map";
import { TapeLink } from "../chrome/TapeLink";

type CrtScreenProps = {
  rect: SceneRect;
  /** The same screen in the tablet scene (scene-tablet.png). */
  tabletRect?: SceneRect;
  variant?: "cover" | "ambient";
  as?: "div" | "a" | "button";
  href?: string;
  label?: string;
  name?: string;
  cursor?: "OPEN" | "PLAY";
  onClick?: () => void;
  onHoverChange?: (on: boolean) => void;
  /** Dive: the lower screen powers on to flat orange, a CRT line opening to full height (0 → 1). */
  fill?: MotionValue<number>;
  /** Dive: the picture dims as the screen powers on (1 → 0). */
  fade?: MotionValue<number>;
  hoverChip?: ReactNode;
  children?: ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/**
 * Lays the box onto its glass: a projective warp from the box (the quad's bounding box) to the
 * glass's four corners, re-fitted whenever the box changes size. The layout says which scene's
 * corners are in use (--set: desk | tab, hero.css). Before this runs the box is simply the
 * bounding box — the stage stays hidden until its images are ready, so that is never seen.
 */
function useQuadWarp(ref: React.RefObject<HTMLDivElement | null>, rect: SceneRect, tabletRect?: SceneRect) {
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const tab = tabletRect && getComputedStyle(el).getPropertyValue("--set").trim() === "tab";
      const r = tab ? tabletRect : rect;
      const W = el.offsetWidth;
      const H = el.offsetHeight;
      if (!W || !H) return;
      const k = W / r.w; // plate px → screen px
      el.style.transform = quadMatrix(W, H, r.quad.map(([x, y]) => [(x - r.x) * k, (y - r.y) * k] as const));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, rect, tabletRect]);
}

/**
 * A live screen laid over one of the TVs in the hero art (§7.4), warped onto the TV's glass. Layers, bottom to top:
 * black base (cover) → content → scanlines → scan bar → vignette → glass → Dive fill.
 */
export function CrtScreen({
  rect,
  tabletRect,
  variant = "cover",
  as = "div",
  href,
  label,
  name,
  cursor,
  onClick,
  onHoverChange,
  fill,
  fade,
  hoverChip,
  children,
  ref,
}: CrtScreenProps) {
  const style = rectVars(rect, tabletRect) as CSSProperties;
  const box = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const contentRef = useRef<HTMLSpanElement>(null);
  useQuadWarp(box, rect, tabletRect);
  useMotionStyle(fillRef, { scaleY: fill });
  useMotionStyle(contentRef, { opacity: fade });
  // The link / button is an empty layer over the screen: its stable aria-label is the whole
  // accessible name, and the cycling OSD text never competes with it (WCAG 2.5.3).
  const hit = {
    className: "crt__hit",
    "data-cursor": cursor,
    onPointerEnter: (e: React.PointerEvent) => e.pointerType === "mouse" && onHoverChange?.(true),
    onPointerLeave: () => onHoverChange?.(false),
    onFocus: () => onHoverChange?.(true),
    onBlur: () => onHoverChange?.(false),
  };
  const layers = (
    <>
      <span ref={contentRef} className="crt__content" aria-hidden="true">
        {children}
      </span>
      <span className="crt__layer fx-scanlines" aria-hidden="true" />
      <span className="crt__layer fx-scanbar" aria-hidden="true" />
      {variant === "ambient" ? <span className="crt__layer crt__flicker" aria-hidden="true" /> : null}
      <span className="crt__layer crt__vignette" aria-hidden="true" />
      <span className="crt__layer crt__glass" aria-hidden="true" />
      {hoverChip ? (
        <span className="crt__chip" aria-hidden="true">
          {hoverChip}
        </span>
      ) : null}
      {fill ? <span ref={fillRef} className="crt__layer crt__fill" aria-hidden="true" /> : null}
    </>
  );

  return (
    <div
      ref={(el) => {
        box.current = el;
        if (typeof ref === "function") ref(el);
        else if (ref) (ref as React.RefObject<HTMLElement | null>).current = el;
      }}
      className="crt"
      data-variant={variant}
      data-screen={name}
      style={style}
    >
      {layers}
      {as === "a" && href ? <TapeLink href={href} aria-label={label} {...hit} /> : null}
      {as === "button" ? <button type="button" aria-label={label} onClick={onClick} {...hit} /> : null}
    </div>
  );
}
