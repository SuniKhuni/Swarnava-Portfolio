import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type Tone = "ink" | "paper" | "signal" | "bare";

type OsdChipProps<T extends ElementType> = {
  tone?: Tone;
  blink?: boolean;
  as?: T;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "children">;

/** On-screen-display label. VT323 caps, 16 px or larger. */
export function OsdChip<T extends ElementType = "span">({ tone = "ink", blink = false, as, className, children, ...rest }: OsdChipProps<T>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag className={["osd-chip", className].filter(Boolean).join(" ")} data-tone={tone} data-blink={blink || undefined} {...rest}>
      {children}
    </Tag>
  );
}
