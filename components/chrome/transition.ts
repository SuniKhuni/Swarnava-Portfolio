"use client";

// TapeLink asks; TransitionOverlay (mounted once in the layout) plays.
export type TransitionRequest = {
  href: string;
  channel: string;
  label: string;
  /** Runs before the bars close — the cassette ejects its tape here. */
  before?: () => Promise<void>;
};

type Handler = (r: TransitionRequest) => void;
let handler: Handler | null = null;

export function registerTransition(h: Handler) {
  handler = h;
  return () => {
    if (handler === h) handler = null;
  };
}

/** Returns false when no overlay is mounted, so the caller lets the link navigate normally. */
export function requestTransition(r: TransitionRequest) {
  if (!handler) return false;
  handler(r);
  return true;
}

/** The channel and OSD label a route plays under. */
export function channelFor(href: string): { channel: string; label: string } {
  const url = new URL(href, "http://x");
  const [, first, second] = url.pathname.split("/");
  if (first === "work") return { channel: "03", label: second ? second.replace(/-/g, " ").toUpperCase() : "ALL TAPES" };
  switch (url.hash) {
    case "#bts":
      return { channel: "02", label: "BTS" };
    case "#work":
      return { channel: "03", label: "WORK" };
    case "#contact":
      return { channel: "04", label: "CONTACT" };
    default:
      return { channel: "01", label: "HOME" };
  }
}
