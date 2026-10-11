"use client";

import { useRef } from "react";
import { useInView } from "motion/react";

/** The wireframe's dash: a hairline that grows from the left when in view. */
export function HairlineGrow() {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  return <span ref={ref} className="hairline" data-in={inView} aria-hidden="true" />;
}
