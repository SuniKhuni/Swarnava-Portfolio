"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconName } from "./Icon";
import { TapeLink } from "../chrome/TapeLink";

type Variant = "solid" | "signal" | "ghost" | "icon";

type ButtonProps = {
  variant?: Variant;
  size?: "md" | "lg";
  href?: string;
  /** OSD line shown during the tape transition when href is a route. */
  osd?: string;
  icon?: IconName;
  iconTurn?: 0 | 90 | 180 | 270;
  /** Icon before the label instead of after it (◀ ALL TAPES). */
  leading?: boolean;
  loading?: boolean;
  children?: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/** The only button. A pill with an OSD-face label (§7.1). */
export function Button({
  variant = "solid",
  size = "md",
  href,
  osd,
  icon,
  iconTurn,
  leading = false,
  loading = false,
  children,
  className,
  disabled,
  type = "button",
  onClick,
  ...rest
}: ButtonProps) {
  const cls = ["btn", className].filter(Boolean).join(" ");
  const data = { "data-variant": variant, "data-size": size, "data-icon": icon };
  const glyph = icon ? <Icon name={icon} turn={iconTurn} className="btn__icon" size={variant === "icon" ? 24 : "1em"} /> : null;
  const body =
    variant === "icon" ? (
      glyph
    ) : loading ? (
      <span className="btn__label">
        SENDING
        <span className="btn__cursor" aria-hidden="true" />
      </span>
    ) : (
      <>
        {leading && glyph}
        <span className="btn__label">{children}</span>
        {!leading && glyph}
      </>
    );

  if (href) {
    const label = rest["aria-label"];
    if (href.startsWith("#") || /^(https?:|mailto:)/.test(href)) {
      const external = /^https?:/.test(href);
      return (
        <a href={href} className={cls} aria-label={label} {...data} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          {body}
        </a>
      );
    }
    return (
      <TapeLink href={href} className={cls} osd={osd} aria-label={label} {...data}>
        {body}
      </TapeLink>
    );
  }

  const inert = disabled || loading;
  return (
    <button
      type={type}
      className={cls}
      {...data}
      {...rest}
      aria-disabled={inert || undefined}
      aria-busy={loading || undefined}
      onClick={(e) => {
        if (inert) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    >
      {body}
    </button>
  );
}
