"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { animate, useInView, useMotionValue, useMotionValueEvent, type AnimationPlaybackControls } from "motion/react";
import type { WorkItem } from "@/content/types";
import { ratioOf } from "@/content/types";
import { spring, timing } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/hooks";
import { Icon } from "../ui/Icon";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";

const SIZES = "(min-width: 1280px) 1200px, 100vw";

type Layer = { item: WorkItem; key: string; ready: boolean };

/** One before/after pair. Reports ready once every image in it has loaded. */
function Pair({ layer, priority, attempt, onReady, onError }: { layer: Layer; priority: boolean; attempt: number; onReady: () => void; onError: () => void }) {
  const { item } = layer;
  const pending = useRef(item.before ? 2 : 1);
  const loaded = () => {
    pending.current -= 1;
    if (pending.current === 0) onReady();
  };
  return (
    <div className="compare__layer" data-ready={layer.ready || undefined}>
      {item.before ? (
        <Image
          key={`b${attempt}`}
          src={item.before.src}
          alt={`Before: ${item.title}`}
          fill
          sizes={SIZES}
          className="compare__img"
          draggable={false}
          loading={priority ? "eager" : undefined}
          onLoad={loaded}
          onError={onError}
        />
      ) : null}
      <div className={item.before ? "compare__after" : "compare__solo"}>
        <Image
          key={`a${attempt}`}
          src={item.after.src}
          alt={`After: ${item.title}`}
          fill
          sizes={SIZES}
          className="compare__img"
          draggable={false}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          onLoad={loaded}
          onError={onError}
        />
      </div>
    </div>
  );
}

type CompareSliderProps = {
  item: WorkItem;
  teach?: boolean;
  priority?: boolean;
};

/** The Tracking Wipe: BEFORE on the left, AFTER on the right, a draggable handle between (§7.11). */
export default function CompareSlider({ item, teach = true, priority = false }: CompareSliderProps) {
  const root = useRef<HTMLElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const pos = useMotionValue(50); // % of the width showing BEFORE
  const sweep = useRef<AnimationPlaybackControls | null>(null);
  const taught = useRef(false);
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [layers, setLayers] = useState<Layer[]>([{ item, key: item.slug, ready: false }]);
  const reduce = useReducedMotionSafe();
  const inView = useInView(root, { amount: 0.6 });

  // A new item: stack its pair on top, hidden until it has loaded (derived state, set during render).
  const topKey = layers[layers.length - 1].key;
  if (item.slug !== topKey) {
    setLayers((ls) => [...ls.filter((l) => l.ready).slice(-1), { item, key: item.slug, ready: false }]);
    setFailed(false);
  }

  const top = layers[layers.length - 1];
  const comparable = Boolean(top.item.before);
  const ready = top.ready && !failed;

  useMotionValueEvent(pos, "change", (v) => {
    root.current?.style.setProperty("--p", String(v));
    const r = range.current;
    if (!r) return;
    r.value = String(Math.round(v));
    r.setAttribute("aria-valuetext", `${Math.round(v)}% before, ${Math.round(100 - v)}% after`);
  });

  const stopSweep = () => {
    sweep.current?.stop();
    sweep.current = null;
    taught.current = true;
  };

  // Teach sweep, once, when 60% in view and the pair is on screen.
  useEffect(() => {
    if (!teach || reduce || taught.current || !inView || !ready || !comparable) return;
    taught.current = true;
    sweep.current = animate(pos, [50, 26, 74, 50], { duration: timing.teach, ease: "easeInOut" });
  }, [teach, reduce, inView, ready, comparable, pos]);

  const markReady = (key: string) => {
    setLayers((ls) => ls.map((l) => (l.key === key ? { ...l, ready: true } : l)));
    if (layers.length > 1) {
      stopSweep();
      animate(pos, 50, spring.snap);
      // Once the new pair has crossfaded in, drop the ones underneath it.
      setTimeout(() => setLayers((ls) => (ls[ls.length - 1].key === key ? ls.slice(-1) : ls)), timing.crossfade * 1000);
    }
  };

  const fromPointer = (clientX: number, el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    pos.set(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };

  const frameStyle = {
    aspectRatio: top.item.aspect,
    "--ratio": ratioOf(top.item.aspect),
  } as CSSProperties;

  return (
    <figure
      ref={root}
      className="compare"
      style={frameStyle}
      data-cursor={comparable && ready ? "DRAG" : undefined}
      data-dragging={dragging || undefined}
      data-comparable={comparable || undefined}
    >
      <div
        className="compare__frame"
        onPointerDown={(e) => {
          if (!comparable || !ready) return;
          stopSweep();
          if (e.pointerType === "mouse") {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            fromPointer(e.clientX, e.currentTarget);
          } else {
            // Touch: wait for horizontal intent, so a vertical swipe still scrolls the page.
            touch.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
          }
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) {
            fromPointer(e.clientX, e.currentTarget);
            return;
          }
          const t = touch.current;
          if (!t || t.id !== e.pointerId) return;
          const dx = e.clientX - t.x;
          const dy = e.clientY - t.y;
          if (Math.abs(dx) > 6 && Math.abs(dx) > Math.abs(dy)) {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            fromPointer(e.clientX, e.currentTarget);
          }
        }}
        onPointerUp={() => {
          touch.current = null;
          setDragging(false);
        }}
        onPointerCancel={() => {
          touch.current = null;
          setDragging(false);
        }}
      >
        {layers.map((l, i) => (
          <Pair
            key={`${l.key}-${attempt}`}
            layer={l}
            attempt={attempt}
            priority={priority && i === 0}
            onReady={() => markReady(l.key)}
            onError={() => setFailed(true)}
          />
        ))}
        {comparable ? <span className="compare__handle" aria-hidden="true" /> : null}
        {comparable ? (
          <span className="compare__grip" aria-hidden="true">
            <Icon name="chevron-left" size={20} />
            <Icon name="chevron-right" size={20} />
          </span>
        ) : null}
      </div>

      {comparable ? (
        <>
          <OsdChip tone="ink" className="compare__label compare__label--before" aria-hidden="true">
            BEFORE
          </OsdChip>
          <OsdChip tone="ink" className="compare__label compare__label--after" aria-hidden="true">
            AFTER
          </OsdChip>
          <input
            ref={range}
            className="compare__range sr-only"
            type="range"
            min={0}
            max={100}
            step={2}
            defaultValue={50}
            disabled={!ready}
            aria-label={`Before and after: ${top.item.title}`}
            aria-valuetext="50% before, 50% after"
            onKeyDown={(e) => {
              stopSweep();
              if (e.shiftKey && (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "ArrowUp" || e.key === "ArrowDown")) {
                e.preventDefault();
                const d = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -10 : 10;
                pos.set(Math.min(100, Math.max(0, pos.get() + d)));
              }
            }}
            onChange={(e) => {
              stopSweep();
              pos.set(Number(e.target.value));
            }}
          />
        </>
      ) : (
        <OsdChip tone="ink" className="compare__label compare__label--before">
          FINAL ONLY
        </OsdChip>
      )}

      {!ready && !failed ? (
        <OsdChip tone="paper" className="compare__status">
          TRACKING<span className="tracking__dots" aria-hidden="true" />
        </OsdChip>
      ) : null}
      {failed ? (
        <div className="compare__fail" role="alert">
          <p className="t-osd-lg">NO SIGNAL</p>
          <Button
            variant="solid"
            onClick={() => {
              setFailed(false);
              setLayers([{ item, key: item.slug, ready: false }]);
              setAttempt((a) => a + 1);
            }}
          >
            RETRY
          </Button>
        </div>
      ) : null}
    </figure>
  );
}
