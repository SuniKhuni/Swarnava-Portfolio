import type { CSSProperties, Ref } from "react";
import { getImageProps } from "next/image";
import { WORDMARK } from "@/lib/wordmark";

type BrushWordmarkProps = {
  className: string;
  ref?: Ref<HTMLDivElement>;
  /** Fetched with high priority: the name is in the first view. */
  priority?: boolean;
};

/**
 * The red brushed SWARNAVA (owner-supplied artwork). The brush overhangs the
 * letters, so CSS places the image by its *letters'* box: --lx0/--lx1/--ly0 are where the
 * letters sit inside the image, --ar is the image's height / width.
 */
// One size for both copies (intro and hero), so they share a single download: the intro's
// copy lands on an image that is already decoded instead of one still painting in.
const SIZES = "(max-width: 1023px) 100vw, 1600px";

export function BrushWordmark({ className, ref, priority = false }: BrushWordmarkProps) {
  const { props } = getImageProps({
    src: WORDMARK.src,
    width: WORDMARK.width,
    height: WORDMARK.height,
    alt: "",
    sizes: SIZES,
    quality: 75,
    loading: "eager",
    fetchPriority: priority ? "high" : "auto",
  });
  const geometry = {
    "--lx0": WORDMARK.letters.x0,
    "--lx1": WORDMARK.letters.x1,
    "--ly0": WORDMARK.letters.y0,
    "--ar": WORDMARK.height / WORDMARK.width,
  } as CSSProperties;
  return (
    <div ref={ref} className={className} style={geometry} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- optimised via getImageProps; decorative alt="" comes through it */}
      <img {...props} draggable={false} />
    </div>
  );
}
