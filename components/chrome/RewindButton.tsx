"use client";

import { useReducedMotion } from "motion/react";
import { Button } from "../ui/Button";

export function RewindButton() {
  const reduce = useReducedMotion();
  return (
    <Button
      variant="ghost"
      icon="rewind"
      leading
      onClick={() => {
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
    >
      REWIND
    </Button>
  );
}
