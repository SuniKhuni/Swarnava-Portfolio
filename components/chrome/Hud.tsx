"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useChannel, useEdgeScenes } from "@/lib/channel";
import { timing } from "@/lib/motion";
import { useTimecodeRef } from "@/lib/hooks";
import { Icon, type IconName } from "../ui/Icon";

type Transport = "play" | "rew" | "pause" | "stop";
const TRANSPORT: Record<Transport, { label: string; icon: IconName }> = {
  play: { label: "PLAY", icon: "play" },
  rew: { label: "REW", icon: "rewind" },
  pause: { label: "PAUSE", icon: "pause" },
  stop: { label: "STOP", icon: "stop" },
};

function useTransport(pathname: string) {
  const [state, setState] = useState<Transport>("pause");
  // A new route starts paused at the head of its tape.
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    setPath(pathname);
    setState("pause");
  }
  useEffect(() => {
    let last = window.scrollY;
    let timer: ReturnType<typeof setTimeout> | undefined;
    // At the head of the tape (scrollY 0) it is never "stopped", even on a page one screen tall.
    const atEnd = () =>
      window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - timing.hudStopWithinPx;
    const onScroll = () => {
      const y = window.scrollY;
      if (atEnd()) setState("stop");
      else if (y > last) setState("play");
      else if (y < last) setState("rew");
      last = y;
      clearTimeout(timer);
      timer = setTimeout(() => setState(atEnd() ? "stop" : "pause"), timing.hudPauseAfterMs);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);
  return state;
}

/** Scroll as tape transport (§8.2). Decorative; the real headings carry the meaning. */
export function Hud() {
  const pathname = usePathname();
  const channel = useChannel(pathname);
  const edges = useEdgeScenes();
  const topScene = edges?.top ?? channel.scene;
  const bottomScene = edges?.bottom ?? channel.scene;
  const transport = TRANSPORT[useTransport(pathname)];
  const tc = useTimecodeRef<HTMLSpanElement>();
  const key = `${channel.number}${channel.label}`;
  // Glitch on every change, but not on the first paint.
  const [prev, setPrev] = useState(key);
  const [glitchKey, setGlitchKey] = useState<string | null>(null);
  if (key !== prev) {
    setPrev(key);
    setGlitchKey(key);
  }

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud__cell hud__transport" data-scene={topScene}>
        {transport.label} <Icon name={transport.icon} size="0.72em" />
      </span>
      <span className="hud__cell hud__channel" data-scene={topScene}>
        <span key={key} className={key === glitchKey ? "fx-glitch-once" : undefined}>
          CH {channel.number} {channel.label}
        </span>
      </span>
      <span className="hud__cell hud__sp" data-scene={bottomScene}>
        SP
      </span>
      <span className="hud__cell hud__tc" data-scene={bottomScene} ref={tc}>
        00:00:00
      </span>
    </div>
  );
}
