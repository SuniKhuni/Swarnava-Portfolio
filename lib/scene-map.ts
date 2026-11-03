// lib/scene-map.ts — pixels in the 1672 × 941 plate.
// Every TV screen is its glass's four corners, measured from the plates (public/hero/scene.png and
// scene-tablet.png): the side sets stand at an angle, so their glass is a tilted quad, not a
// rectangle. Side sets: straight lines fitted through each glass edge (its middle half, clear of
// the rounded corners) and intersected. Front sets: read off 4× gridded crops. The overlay is
// warped onto the quad (CrtScreen, matrix3d) and its corners rounded by `r`, so it lies on the
// glass like the picture would. Check alignment with ?debug=screens in development.

export type Point = readonly [number, number];
export type Quad = readonly [Point, Point, Point, Point]; // top-left, top-right, bottom-right, bottom-left
/** A screen: its quad, the quad's bounding box (where the overlay sits before it is warped), and
 *  the corner radius in plate px. */
export type SceneRect = { x: number; y: number; w: number; h: number; r: number; quad: Quad };

export const PLATE = { w: 1672, h: 941 } as const;
export const SUBJECT = { x: 450, y: 70, w: 748, h: 819, centreX: 0.493 } as const; // measured

/** A screen from its glass corners, pushed out `pad` px so the edge seam falls on the dark rim. */
function screen(quad: Quad, r: number, pad = 1.5): SceneRect {
  const cx = quad.reduce((n, p) => n + p[0], 0) / 4;
  const cy = quad.reduce((n, p) => n + p[1], 0) / 4;
  const q = quad.map(([x, y]) => {
    const d = Math.hypot(x - cx, y - cy) || 1;
    return [x + ((x - cx) / d) * pad, y + ((y - cy) / d) * pad] as const;
  }) as unknown as Quad;
  const xs = q.map((p) => p[0]);
  const ys = q.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y, r, quad: q };
}
const box = (x0: number, y0: number, x1: number, y1: number): Quad => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];

export const SCREENS = {
  top: screen(box(726, 557, 939, 677), 22), // reads CONTENT — cover + niche cycler
  // The baked 00:00:00 reaches (909, 835), inside the glass's corner curve: the cover runs onto the rim.
  bottom: screen(box(697, 714, 914, 839), 18), // cover — static + SCROLL ▼; the Dive target
  left: screen([[377.1, 560.2], [478.8, 554.0], [479.4, 634.8], [380.0, 640.0]], 13), // live colour bars + the pillars
  right: screen([[1164.8, 585.6], [1262.8, 583.6], [1257.5, 669.1], [1158.5, 661.2]], 13), // live synthwave sunset
} as const satisfies Record<string, SceneRect>;

/** The tablet scene (public/hero/scene-tablet.png: the owner's TV trio, placed in the same
 *  1672 × 941 frame under the cutout by scripts/prep-assets.mjs). Measured from that file. */
export const SCREENS_TABLET = {
  top: screen(box(731, 558, 940, 675), 18), // the knob row under it stays visible
  bottom: screen(box(719, 742, 906, 838), 16), // inside the SONY bezel
  left: screen([[394.2, 585.8], [490.8, 578.8], [494.2, 651.0], [399.8, 662.7]], 12),
  right: screen([[1151.2, 610.2], [1246.1, 609.8], [1241.8, 689.5], [1147.9, 681.0]], 12),
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

/**
 * The CSS matrix3d that maps a box of `w` × `h` px (origin top-left) onto `quad` (px, relative to
 * the box's own top-left) — a projective map, so the picture keeps the glass's perspective.
 */
export function quadMatrix(w: number, h: number, quad: readonly Point[]) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = den ? (dx3 * dy2 - dx2 * dy3) / den : 0;
  const hh = den ? (dx1 * dy3 - dx3 * dy1) / den : 0;
  // unit square → quad
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // box px → unit square → quad, as a column-major 4 × 4
  const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
}
