"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useChannel } from "@/lib/channel";
import { Icon } from "../ui/Icon";
import { TapeLink } from "./TapeLink";

const ITEMS = [
  { id: "home", hash: "#home", label: "HOME", channel: "01", icon: true },
  { id: "bts", hash: "#bts", label: "ABOUT ME", channel: "02", icon: false },
  { id: "work", hash: "#work", label: "PROJECTS", channel: "03", icon: false },
  { id: "contact", hash: "#contact", label: "CONTACT", channel: "04", icon: false },
] as const;

/** The nav, as a black remote control (§8.1). */
export function Remote() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const channel = useChannel(pathname);
  // Off-channel pages (the 404) light nothing; /work routes sit on PROJECTS.
  const active = ITEMS.find((i) => i.channel === channel.number)?.id ?? (onHome ? "home" : pathname.startsWith("/work") ? "work" : undefined);
  const nav = useRef<HTMLElement>(null);

  const last = useRef<{ x: number; w: number } | null>(null);

  // One orange pill behind the active item, sized to that item's box. When the active item
  // changes it plays FLIP: start where it was (translate + scaleX), transition to rest.
  useLayoutEffect(() => {
    const el = nav.current;
    const pill = el?.querySelector<HTMLElement>(".remote__pill");
    if (!el || !pill) return;
    const place = (animate: boolean) => {
      const li = el.querySelector<HTMLElement>("[data-active]")?.parentElement;
      if (!li) {
        delete el.dataset.pill; // nothing active (off-channel page): no pill
        last.current = null;
        return;
      }
      const next = { x: li.offsetLeft, w: li.offsetWidth };
      pill.style.left = `${next.x}px`;
      pill.style.width = `${next.w}px`;
      const prev = last.current;
      last.current = next;
      el.dataset.pill = "ready";
      if (!animate || !prev || (prev.x === next.x && prev.w === next.w)) return;
      pill.style.transition = "none";
      pill.style.transform = `translateX(${prev.x - next.x}px) scaleX(${prev.w / next.w})`;
      void pill.offsetWidth; // commit the starting frame
      pill.style.transition = "";
      pill.style.transform = "";
    };
    place(true);
    const ro = new ResizeObserver(() => place(false));
    ro.observe(el);
    return () => ro.disconnect();
  }, [active]);

  return (
    <header className="remote-wrap">
      <nav ref={nav} aria-label="Primary" className="remote">
        <span className="remote__pill" aria-hidden="true" />
        <ul className="remote__list">
          {ITEMS.map((item) => {
            const isActive = item.id === active;
            const props = {
              className: "remote__link",
              "data-active": isActive || undefined,
              "aria-current": isActive ? (onHome ? ("location" as const) : ("true" as const)) : undefined,
              "aria-label": item.icon ? "Home" : undefined,
            };
            const content = (
              <>
                <span className="remote__text">{item.icon ? <Icon name="home" size={20} /> : item.label}</span>
              </>
            );
            return (
              <li key={item.id}>
                {onHome ? (
                  <a href={item.hash} {...props}>
                    {content}
                  </a>
                ) : (
                  <TapeLink href={`/${item.hash}`} {...props}>
                    {content}
                  </TapeLink>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
