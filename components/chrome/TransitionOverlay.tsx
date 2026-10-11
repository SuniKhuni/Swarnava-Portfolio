"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { timing } from "@/lib/motion";
import { Icon } from "../ui/Icon";
import { registerTransition } from "./transition";

type Phase = "idle" | "closing" | "hold" | "opening";

const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));

/** Channel change between routes (§8.3): bars close, static + OSD, route swaps, bars open. */
export function TransitionOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [osd, setOsd] = useState({ channel: "", label: "" });
  const [tracking, setTracking] = useState(false);
  const busy = useRef(false);
  const pathRef = useRef(pathname);
  const arrivals = useRef<Array<() => void>>([]);

  useEffect(() => {
    pathRef.current = pathname;
    arrivals.current.splice(0).forEach((resolve) => resolve());
  }, [pathname]);

  useEffect(
    () =>
      registerTransition(async (req) => {
        if (busy.current) return;
        busy.current = true;
        try {
          await req.before?.();
          setOsd({ channel: req.channel, label: req.label });
          setPhase("closing");
          await wait(timing.transition.close * 1000);
          setPhase("hold");
          await wait(timing.transition.hold * 1000);
          const target = new URL(req.href, window.location.href);
          const arrived = new Promise<void>((resolve) => arrivals.current.push(resolve));
          router.push(req.href);
          if (target.pathname !== pathRef.current) {
            // Wait up to 400 ms for the new page. If it is slower, the strip reads TRACKING…
            // and the bars stay shut until it arrives (capped), like a VCR finding the signal.
            const late = await Promise.race([arrived.then(() => false), wait(timing.transition.waitMaxMs).then(() => true)]);
            if (late) {
              setTracking(true);
              await Promise.race([arrived, wait(timing.transition.trackingMaxMs)]);
            }
          }
          await frame();
          await frame();
          setPhase("opening");
          await wait(timing.transition.open * 1000);
        } finally {
          setTracking(false);
          setPhase("idle");
          busy.current = false;
        }
      }),
    [router],
  );

  return (
    <div className="transition" data-phase={phase} aria-hidden="true">
      <span className="transition__bar transition__bar--top" />
      <span className="transition__bar transition__bar--bottom" />
      <div className="transition__signal">
        <span className="transition__static fx-static" />
        {tracking ? (
          <span className="transition__osd">
            TRACKING<span className="tracking__dots" aria-hidden="true" />
          </span>
        ) : (
          <span className="transition__osd">
            CH {osd.channel} <Icon name="play" size="0.7em" /> {osd.label}
          </span>
        )}
      </div>
    </div>
  );
}
