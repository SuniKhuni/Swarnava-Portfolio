"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useReducedMotion } from "motion/react";
import { channelFor, requestTransition } from "./transition";

type TapeLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** Overrides the OSD label shown on the transition. */
  osd?: string;
  beforeNavigate?: () => Promise<void>;
};

/**
 * next/link plus the tape transition. `onNavigate` only fires for client-side
 * navigations, so modifier-clicks, middle-clicks and new tabs fall through untouched;
 * browser back / forward never reach it either.
 */
export function TapeLink({ href, osd, beforeNavigate, onNavigate, ...rest }: TapeLinkProps) {
  const reduce = useReducedMotion();
  return (
    <Link
      href={href}
      {...rest}
      onNavigate={(e) => {
        onNavigate?.(e);
        if (reduce) return;
        const { channel, label } = channelFor(href);
        if (requestTransition({ href, channel, label: osd ?? label, before: beforeNavigate })) e.preventDefault();
      }}
    />
  );
}
