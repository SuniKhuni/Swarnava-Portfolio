import { getImageProps } from "next/image";

// Cinema: full-bleed. Phones: up to ~210vw (the subject, large). Portrait tablets: ~157vw.
const SIZES = "(max-width: 767px) 210vw, (max-width: 1023px) 157vw, (max-aspect-ratio: 1/1) 157vw, 100vw";

type PlatePictureProps = { name: "scene" | "cutout"; alt: string; className: string };

/** One plate image (1672 × 941), optimised through next/image. */
/** Portrait tablets: not cinema (hero.css), at least 768 px wide. They get their own scene. */
export const TABLET = "(min-width: 768px) and (max-aspect-ratio: 1/1), (min-width: 768px) and (max-width: 1023px) and (min-height: 521px)";

export function PlatePicture({ name, alt, className }: PlatePictureProps) {
  const { props } = getImageProps({
    alt,
    src: `/hero/${name}.png`,
    width: 1672,
    height: 941,
    sizes: SIZES,
    quality: 75,
    loading: "eager",
    fetchPriority: "high",
    decoding: "async",
  });
  const img = (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text -- optimised via getImageProps; alt comes through it
    <img {...props} className={className} />
  );
  if (name !== "scene") return img;
  // The tablet scene: the owner's TV trio, laid out for the cutout (scripts/prep-assets.mjs).
  const {
    props: { srcSet },
  } = getImageProps({ alt, src: "/hero/scene-tablet.png", width: 1672, height: 941, sizes: "157vw", quality: 75 });
  return (
    <picture>
      <source media={TABLET} srcSet={srcSet} sizes="157vw" />
      {img}
    </picture>
  );
}
