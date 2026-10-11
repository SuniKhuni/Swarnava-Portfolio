"use client";

import { MotionConfig } from "motion/react";

/**
 * Reduced motion follows the visitor's setting for every Motion animation. The first-load
 * path binds MotionValues with useMotionStyle and drives state changes with CSS; only the
 * lazy chunks (Polaroid drag, slider sweep) render motion elements.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
