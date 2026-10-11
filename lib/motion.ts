// The only place, besides app/globals.css, where durations and easings are written down.

export const dur = { flash: 0.09, fast: 0.18, base: 0.32, slow: 0.6, scene: 0.9 } as const;

export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.7, 0, 0.84, 0],
} as const;

export const spring = {
  snap: { type: "spring", stiffness: 520, damping: 34, mass: 0.7 }, // handles, chips, nav highlight
  object: { type: "spring", stiffness: 220, damping: 24 }, // tapes, flap, letter, Polaroids, monitor
  soft: { type: "spring", stiffness: 90, damping: 20 }, // parallax
} as const;

export const stagger = { letters: 0.04, items: 0.07 } as const;
export const marquee = { pxPerSec: 40, maxBoost: 1.5, boostDivisor: 800, dragThresholdPx: 6, friction: 0.92 } as const;
export const cycle = { everyMs: 2400, glitchMs: 180, offsetMs: 1200 } as const;

/** Everything else that is timed. Seconds unless the key ends in Ms. */
export const timing = {
  hudPauseAfterMs: 1200, // no scroll for this long → PAUSE
  hudStopWithinPx: 2, // this close to the page end → STOP
  transition: { close: 0.26, hold: 0.14, open: 0.32, waitMaxMs: 400, trackingMaxMs: 8000, reduced: 0.15 },
  eject: 0.35, // cassette tape leaving its sleeve
  counterGlitchMs: 90,
  teach: 1.4, // slider intro sweep
  crossfade: 0.2,
  envelope: { flap: 0.5, letter: 0.6, postmark: 0.18, leave: 0.6, receipt: 0.32, shake: 0.32 },
  /** First-visit intro — mirrored by the --intro-* tokens in globals.css. */
  intro: { delay: 0.12, paint: 0.65, hold: 0.75, move: 0.85, fade: 0.32 },
  /** Longest the hero waits for its images to decode before showing anyway. */
  heroReady: 4,
  polaroid: { throwPx: 90, throwVelocity: 500, flyPx: 900, maxSpin: 18 },
} as const;

/** The tape: 25 fps over 02:30:00. */
export const tape = { fps: 25, frames: 3750 } as const;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** progress 0–1 → "MM:SS:FF" */
export function timecode(progress: number) {
  const frames = Math.round(clamp01(progress) * tape.frames);
  const ff = frames % tape.fps;
  const totalSeconds = Math.floor(frames / tape.fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}
