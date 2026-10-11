"use client";

import { useEffect } from "react";

/** ?debug=screens — development only. Draws every scene-map rect as a 50% magenta box. */
export function DebugScreens() {
  useEffect(() => {
    const on = new URLSearchParams(window.location.search).get("debug") === "screens";
    if (on) document.documentElement.dataset.debug = "screens";
    return () => {
      delete document.documentElement.dataset.debug;
    };
  }, []);
  return null;
}
