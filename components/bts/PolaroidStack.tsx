"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, type PanInfo } from "motion/react";
import type { BtsPhoto } from "@/content/types";
import { spring, timing } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/hooks";
import { Button } from "../ui/Button";

const MAX_RENDERED = 5;

/** Fixed per photo, from its index, within −7°…7° — never random, or hydration mismatches. */
const restRotation = (i: number) => ((i * 37) % 15) - 7;

type CardProps = {
  photo: BtsPhoto;
  index: number;
  depth: number;
  draggable: boolean;
  priority: boolean;
  onThrown: () => void;
};

function Card({ photo, index, depth, draggable, priority, onThrown }: CardProps) {
  // Drag and throw live on the inner figure; the stack position lives on the outer wrapper.
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const spin = useMotionValue(0);
  const [lifted, setLifted] = useState(false);
  const dragged = useRef(false); // a drag that ends short of a throw must not also count as a tap

  const fly = (dx: number, dy: number) => {
    const len = Math.hypot(dx, dy) || 1;
    const k = timing.polaroid.flyPx / len;
    const out = { ...spring.object, velocity: 0 };
    animate(spin, Math.sign(dx || 1) * timing.polaroid.maxSpin, out);
    animate(y, dy * k, out);
    animate(x, dx * k, {
      ...out,
      onComplete: () => {
        onThrown();
        // Re-enter at the back: the wrapper is already behind the others, so spring home.
        animate(x, 0, spring.object);
        animate(y, 0, spring.object);
        animate(spin, 0, spring.object);
      },
    });
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    setLifted(false);
    const far = Math.hypot(info.offset.x, info.offset.y) > timing.polaroid.throwPx;
    const fast = Math.hypot(info.velocity.x, info.velocity.y) > timing.polaroid.throwVelocity;
    if (far || fast) {
      const vx = info.velocity.x || info.offset.x;
      const vy = info.velocity.y || info.offset.y;
      fly(vx, vy);
    } else {
      animate(x, 0, spring.object);
      animate(y, 0, spring.object);
    }
  };

  const top = depth === 0;
  return (
    <motion.div
      className="polaroid-slot"
      initial={false}
      animate={{
        y: depth * 7,
        scale: 1 - depth * 0.035,
        rotate: top ? restRotation(index) * 0.35 : restRotation(index),
      }}
      transition={spring.object}
      style={{ zIndex: MAX_RENDERED - depth }}
    >
      <motion.figure
        className="polaroid"
        data-lifted={lifted || undefined}
        data-cursor={draggable ? "DRAG" : undefined}
        style={{ x, y, rotate: spin }}
        drag={draggable}
        dragMomentum={false}
        onPointerDown={() => (dragged.current = false)}
        onDragStart={() => {
          dragged.current = true;
          setLifted(true);
        }}
        onDragEnd={onDragEnd}
        onTap={draggable ? () => !dragged.current && fly(-1, -0.35) : undefined}
        tabIndex={-1} /* the carousel group and its buttons are the keyboard path */
        whileDrag={{ scale: 1.04 }}
      >
        <div className="polaroid__photo">
          <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 1024px) 26vw, 52vw" loading={priority ? "eager" : "lazy"} draggable={false} />
        </div>
        {photo.caption ? <figcaption className="polaroid__caption">{photo.caption}</figcaption> : null}
      </motion.figure>
    </motion.div>
  );
}

type PolaroidStackProps = {
  photos: BtsPhoto[];
  onChange?: (index: number) => void;
  /** Scroll position through BTS, as a photo index: the stack deals to it as the page scrolls. */
  step?: number;
};

/** BTS photos in the Monitor (§7.6). Drag or tap the top card to throw it to the back. */
export default function PolaroidStack({ photos, onChange, step }: PolaroidStackProps) {
  const n = photos.length;
  const reduce = useReducedMotionSafe();
  const [top, setTop] = useState(0);
  const topRef = useRef(0); // read by async throw callbacks, which outlive a render
  const [message, setMessage] = useState("");

  const go = (dir: 1 | -1) => {
    const next = (topRef.current + dir + n) % n;
    topRef.current = next;
    setTop(next);
    onChange?.(next);
    setMessage(`Photo ${next + 1} of ${n}: ${photos[next].alt}`);
  };

  // Scrolling deals the photos: each step of the page through BTS brings the next one up
  // (scrolling back brings them back). Drag, tap and the buttons still work in between.
  useEffect(() => {
    if (step === undefined || n < 2 || step === topRef.current) return;
    topRef.current = step;
    setTop(step);
    onChange?.(step);
  }, [step, n, onChange]);

  if (n === 0) return null;
  if (n === 1) {
    return (
      <div className="polaroids" data-single>
        <Card photo={photos[0]} index={0} depth={0} draggable={false} priority onThrown={() => {}} />
      </div>
    );
  }

  const visible = Array.from({ length: n }, (_, i) => ({ i, depth: (i - top + n) % n })).filter((c) => c.depth < MAX_RENDERED);

  return (
    <div
      className="polaroids"
      role="group"
      aria-roledescription="carousel"
      aria-label="Behind the scenes photos"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.target !== e.currentTarget) return;
        if (e.key === "ArrowRight" || e.key === "Enter") {
          e.preventDefault();
          go(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          go(-1);
        }
      }}
    >
      <div className="polaroids__deck">
        {reduce ? (
          <motion.div key={top} className="polaroids__fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: timing.transition.reduced }}>
            <Card photo={photos[top]} index={top} depth={0} draggable={false} priority onThrown={() => {}} />
          </motion.div>
        ) : (
          visible.map(({ i, depth }) => (
            <Card key={i} photo={photos[i]} index={i} depth={depth} draggable={depth === 0} priority={i === 0} onThrown={() => go(1)} />
          ))
        )}
      </div>
      <div className="polaroids__nav">
        <Button variant="icon" icon="chevron-left" aria-label="Previous photo" onClick={() => go(-1)} />
        <Button variant="icon" icon="chevron-right" aria-label="Next photo" onClick={() => go(1)} />
      </div>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  );
}
