"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import type { MotionValue } from "motion/react";
import { useMotionStyle } from "@/lib/motion-style";
import { rectVars, type SceneRect } from "@/lib/scene-map";
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
  hoverChip?: ReactNode;
  children?: ReactNode;
  ref?: React.Ref<HTMLElement>;
};

/**
 * A live screen laid over one of the TVs in the hero art (§7.4). Layers, bottom to top:
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
  hoverChip,
  children,
  ref,
}: CrtScreenProps) {
  const style = rectVars(rect, tabletRect) as CSSProperties;
  const fillRef = useRef<HTMLSpanElement>(null);
  useMotionStyle(fillRef, { scaleY: fill });
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
      <span className="crt__content" aria-hidden="true">
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
    <div ref={ref as React.Ref<HTMLDivElement>} className="crt" data-variant={variant} data-screen={name} style={style}>
      {layers}
      {as === "a" && href ? <TapeLink href={href} aria-label={label} {...hit} /> : null}
      {as === "button" ? <button type="button" aria-label={label} onClick={onClick} {...hit} /> : null}
    </div>
  );
}
