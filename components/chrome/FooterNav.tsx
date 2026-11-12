"use client";

import { usePathname } from "next/navigation";
import { TapeLink } from "./TapeLink";

const CHANNELS = [
  { hash: "#home", number: "01", label: "HOME" },
  { hash: "#bts", number: "02", label: "ABOUT ME" },
  { hash: "#work", number: "03", label: "PROJECTS" },
  { hash: "#contact", number: "04", label: "CONTACT" },
] as const;

/** The four channels again, at the end of the tape: in-page jumps on the home page, the tape transition from anywhere else. */
export function FooterNav() {
  const onHome = usePathname() === "/";
  return (
    <nav className="footer__nav" aria-label="Channels">
      <ul>
        {CHANNELS.map((c) => {
          const text = (
            <>
              <span className="footer__nav-ch" aria-hidden="true">
                CH {c.number}
              </span>{" "}
              {c.label}
            </>
          );
          return (
            <li key={c.hash}>
              {onHome ? <a href={c.hash}>{text}</a> : <TapeLink href={`/${c.hash}`}>{text}</TapeLink>}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
