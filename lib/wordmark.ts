// The red brushed SWARNAVA wordmark (owner-supplied artwork, _assets-src/wordmark.png → public/hero/wordmark.png),
// and where its letters sit inside it, as fractions of the image. The brush overhangs the letters; CSS places
// the image by this box. Measured on the 2185 × 720 file: S at x 200, last A at x 2000, cap-top y 106, baseline ≈ 612.
export const WORDMARK = {
  src: "/hero/wordmark.png",
  width: 2185,
  height: 720,
  letters: { x0: 0.0915, x1: 0.9153, y0: 0.1472, y1: 0.85 },
} as const;
