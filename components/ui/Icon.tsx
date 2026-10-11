import type { ReactNode, SVGProps } from "react";

// 24 px box, 1.5 px stroke, currentColor. Transport glyphs are solid, as on a VCR's OSD.
export type IconName =
  | "home"
  | "arrow-up-right"
  | "chevron-left"
  | "chevron-right"
  | "play"
  | "rewind"
  | "pause"
  | "stop"
  | "rec"
  | "battery"
  | "close"
  | "instagram"
  | "linkedin"
  | "mail";

const solid = { fill: "currentColor", stroke: "none" } as const;

const glyphs: Record<IconName, ReactNode> = {
  home: <path d="M3.5 11 12 4l8.5 7M6 9.5V20h4.5v-5.5h3V20H18V9.5" />,
  "arrow-up-right": <path d="M7 17 17 7M9 7h8v8" />,
  "chevron-left": <path d="m15 5-7 7 7 7" />,
  "chevron-right": <path d="m9 5 7 7-7 7" />,
  play: <path {...solid} d="M7 4.5v15L19.5 12z" />,
  rewind: <path {...solid} d="M11.5 6v12L3 12zm9.5 0v12l-8.5-6z" />,
  pause: <path {...solid} d="M6.5 5H10v14H6.5zM14 5h3.5v14H14z" />,
  stop: <path {...solid} d="M6 6h12v12H6z" />,
  rec: <circle {...solid} cx="12" cy="12" r="6" />,
  battery: (
    <>
      <rect x="2.5" y="7.5" width="17" height="9" rx="1.5" />
      <path d="M21.5 10.5v3" />
      <path {...solid} d="M5 10h9.5v4H5z" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle {...solid} cx="17.1" cy="6.9" r="1.1" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M8 10.5V16.5M8 7.6v.1M11.5 16.5v-6M11.5 13.2c0-1.6 1-2.7 2.4-2.7s2.1 1 2.1 2.6v3.4" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number | string;
  /** Direction for the play glyph used as ▼ ▲ ◀ ▸ */
  turn?: 0 | 90 | 180 | 270;
};

export function Icon({ name, size = 24, turn = 0, className, style, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={["icon", className].filter(Boolean).join(" ")}
      style={turn ? { ...style, rotate: `${turn}deg` } : style}
      {...rest}
    >
      {glyphs[name]}
    </svg>
  );
}
