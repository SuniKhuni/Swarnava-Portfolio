// lib/scene-map.ts — pixels in the 1672 × 941 plate.
// Measured from _assets-src/scene.png (luminance and saturation edge profiles), not estimated.
// Each screen rect is the outer extent of the glass; the CRT glass bows outward, so the
// corners use a generous radius and any overshoot lands on the near-black tube rim.
// Check alignment with ?debug=screens in development.

export type SceneRect = { x: number; y: number; w: number; h: number; r: number };

export const PLATE = { w: 1672, h: 941 } as const;
export const SUBJECT = { x: 450, y: 70, w: 748, h: 819, centreX: 0.493 } as const; // measured

export const SCREENS = {
  top: { x: 726, y: 560, w: 211, h: 111, r: 18 }, // reads CONTENT — cover + niche cycler
  // Glass is x 697–911, y 714–836; the baked 00:00:00 reaches (909, 835), inside the glass's
  // corner curve, so the cover runs 4 px right / 2 px down onto the black rim with a tighter corner.
  bottom: { x: 697, y: 714, w: 219, h: 125, r: 14 }, // cover — static + SCROLL ▼; the Dive target
  left: { x: 378, y: 556, w: 103, h: 84, r: 14 }, // cover — live colour bars + the pillars
  right: { x: 1161, y: 585, w: 101, h: 82, r: 14 }, // cover — live synthwave sunset
} as const satisfies Record<string, SceneRect>;

/** The tablet scene (public/hero/scene-tablet.png: the owner's TV trio, placed in the same
 *  1672 × 941 frame under the cutout by scripts/prep-assets.mjs). Measured from that file. */
export const SCREENS_TABLET = {
  top: { x: 717, y: 548, w: 230, h: 148, r: 18 },
  bottom: { x: 693, y: 728, w: 242, h: 138, r: 16 },
  left: { x: 396, y: 579, w: 100, h: 81, r: 14 },
  right: { x: 1150, y: 611, w: 96, h: 76, r: 14 },
} as const satisfies Record<keyof typeof SCREENS, SceneRect>;

export const DISCO = { cx: 297, cy: 679, r: 80 } as const;

export const toPlate = (r: { x: number; y: number; w: number; h: number }) => ({
  left: `${(r.x / PLATE.w) * 100}%`,
  top: `${(r.y / PLATE.h) * 100}%`,
  width: `${(r.w / PLATE.w) * 100}%`,
  height: `${(r.h / PLATE.h) * 100}%`,
});

/** Corner radius as an elliptical percentage, so it scales with the plate. */
export const radiusOf = (r: SceneRect) => `${(r.r / r.w) * 100}% / ${(r.r / r.h) * 100}%`;

/** A rect as CSS custom properties (hero.css places .crt from them); `t` = the tablet scene. */
export const rectVars = (r: SceneRect, t?: SceneRect) => {
  const a = toPlate(r);
  const vars: Record<string, string> = { "--x": a.left, "--y": a.top, "--w": a.width, "--h": a.height, "--r": radiusOf(r) };
  if (t) {
    const b = toPlate(t);
    Object.assign(vars, { "--tx": b.left, "--ty": b.top, "--tw": b.width, "--th": b.height, "--tr": radiusOf(t) });
  }
  return vars;
};
