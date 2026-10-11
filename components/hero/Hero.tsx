"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useMotionValue, useTransform } from "motion/react";
import { useSpringValue } from "@/lib/scroll";
import { useMotionStyle } from "@/lib/motion-style";
import { SCREENS, SCREENS_TABLET } from "@/lib/scene-map";
import { cycle, spring, timing } from "@/lib/motion";
import { QUERIES, useLoopActive, useMediaQuery, useReducedMotionSafe, useTimecodeRef } from "@/lib/hooks";
import { Icon } from "../ui/Icon";
import { OsdChip } from "../ui/OsdChip";
import { TapeLink } from "../chrome/TapeLink";
import { CrtScreen } from "./CrtScreen";
import { PlatePicture } from "./PlatePicture";
import { CyclerWord, useCycle } from "./Cycler";
import { DiscoGlints } from "./DiscoGlints";
import { BrushWordmark } from "./BrushWordmark";
import { ColourBars, Sunset } from "./TvPictures";
import { Intro } from "./Intro";
import { useDive } from "./useDive";

export type Niche = { word: string; href: string };

type HeroProps = {
  name: string;
  role: string;
  /** CONTENT first, then one word per category, each with the route it opens. */
  niches: Niche[];
  pillars: string[];
  socials: { label: string; href: string; kind?: "instagram" | "linkedin" }[];
};

/** Pointer parallax on fine pointers: the wordmark and glints shift against the pointer. */
function useParallax(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const nx = useMotionValue(0);
  const ny = useMotionValue(0);
  const sx = useSpringValue(nx, spring.soft);
  const sy = useSpringValue(ny, spring.soft);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) {
      nx.set(0);
      ny.set(0);
      return;
    }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      nx.set((e.clientX / window.innerWidth) * 2 - 1);
      ny.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    const reset = () => {
      nx.set(0);
      ny.set(0);
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerleave", reset);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", reset);
    };
  }, [ref, enabled, nx, ny]);
  return {
    wx: useTransform(sx, (v) => -v * 10),
    wy: useTransform(sy, (v) => -v * 6),
    gx: useTransform(sx, (v) => -v * 16),
    gy: useTransform(sy, (v) => -v * 10),
  };
}

/**
 * True once every image in the stage (scene, wordmark, cutout) is decoded, or after
 * timing.heroReady. Until then the stage stays hidden, so large images never paint in bands.
 */
function useImagesReady(ref: React.RefObject<HTMLElement | null>) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let live = true;
    const done = () => live && setReady(true);
    const t = setTimeout(done, timing.heroReady * 1000);
    const imgs = Array.from(el.querySelectorAll("img"));
    Promise.all(imgs.map((img) => img.decode().catch(() => undefined))).then(done);
    return () => {
      live = false;
      clearTimeout(t);
    };
  }, [ref]);
  return ready;
}

function TvOsd({ tcRef }: { tcRef?: React.Ref<HTMLSpanElement> }) {
  return (
    <>
      <span className="crt__osd crt__osd--tl">
        PLAY <Icon name="play" size="0.8em" />
      </span>
      {tcRef ? (
        <>
          <span className="crt__osd crt__osd--bl">SP</span>
          <span className="crt__osd crt__osd--br" ref={tcRef}>
            00:00:00
          </span>
        </>
      ) : null}
    </>
  );
}

/** CH 01 — the key art with live TVs, ending in the Dive into the lower screen (§9.1). */
export function Hero({ name, role, niches, pillars, socials }: HeroProps) {
  const section = useRef<HTMLElement>(null);
  const sticky = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const bottomTv = useRef<HTMLElement>(null);
  const diveScreen = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLParagraphElement>(null);
  const nameBlock = useRef<HTMLDivElement>(null);

  const reduce = useReducedMotionSafe();
  const fine = useMediaQuery(QUERIES.finePointer);
  const diveOn = useMediaQuery(QUERIES.dive);
  const loops = useLoopActive(section);
  const [topHover, setTopHover] = useState(false);
  const [bottomHover, setBottomHover] = useState(false);

  // Every TV in the art is live: CONTENT + the niches on top, the pillars on the left set,
  // the sunset on the right, static and SCROLL on the lower one (the Dive's target).
  const top = useCycle(niches.length, { active: loops && !topHover && !reduce });
  const side = useCycle(pillars.length, { active: loops && !reduce, offsetMs: cycle.offsetMs });

  const dive = useDive(section, sticky, frame, bottomTv, diveScreen, diveOn);
  const { wx, wy, gx, gy } = useParallax(section, fine && !reduce);
  const wordmark = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ready = useImagesReady(stage);
  useMotionStyle(wordmark, { x: wx, y: wy });
  useMotionStyle(cue, { opacity: dive.ui });
  useMotionStyle(nameBlock, { opacity: dive.ui });
  const topTc = useTimecodeRef<HTMLSpanElement>();
  const bottomTc = useTimecodeRef<HTMLSpanElement>();

  const toContact = (e: React.MouseEvent) => {
    const contact = document.getElementById("contact");
    if (!contact) return;
    e.preventDefault();
    contact.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const toBts = () => {
    const bts = document.getElementById("bts");
    if (!bts) return;
    bts.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    bts.focus({ preventScroll: true });
  };

  const niche = niches[top];

  return (
    <section
      ref={section}
      id="home"
      className="hero scene"
      data-scene="cream"
      data-channel="01"
      data-channel-label="HOME"
      data-loops={loops ? "on" : "off"}
      aria-labelledby="hero-title"
    >
      <div ref={sticky} className="hero__sticky">
        <div className="hero__power">
          <div ref={frame} className="hero__frame">
            <div ref={stage} className="stage" data-ready={ready || undefined}>
              <div className="plate">
                <PlatePicture name="scene" alt="" className="plate__img plate__scene" />
                <CrtScreen
                  rect={SCREENS.top}
                  tabletRect={SCREENS_TABLET.top}
                  name="top"
                  as="a"
                  href={niche.href}
                  label="See the work"
                  cursor="OPEN"
                  onHoverChange={setTopHover}
                  hoverChip={
                    <OsdChip tone="signal">
                      <Icon name="play" size="0.7em" /> OPEN
                    </OsdChip>
                  }
                >
                  <TvOsd tcRef={topTc} />
                  <CyclerWord index={top} size="top">
                    {niche.word}
                  </CyclerWord>
                </CrtScreen>
                <CrtScreen
                  ref={bottomTv}
                  rect={SCREENS.bottom}
                  tabletRect={SCREENS_TABLET.bottom}
                  name="bottom"
                  as="button"
                  label="Scroll to about"
                  cursor="PLAY"
                  onClick={toBts}
                  onHoverChange={setBottomHover}
                  fill={dive.power}
                >
                  <span className="crt__static fx-static" data-bright={bottomHover || undefined} />
                  <TvOsd tcRef={bottomTc} />
                  <span className="crt__word crt__word--bottom fx-rgb">
                    <span>
                      SCROLL <Icon name="play" turn={90} size="0.7em" className="crt__blink" />
                    </span>
                  </span>
                </CrtScreen>
                <CrtScreen rect={SCREENS.left} tabletRect={SCREENS_TABLET.left} name="left">
                  <ColourBars />
                  <span key={`burst-${side}`} className="crt__burst fx-static" />
                  <TvOsd />
                  <CyclerWord index={side} size="side">
                    {pillars[side]}
                  </CyclerWord>
                </CrtScreen>
                <CrtScreen rect={SCREENS.right} tabletRect={SCREENS_TABLET.right} name="right">
                  <Sunset />
                  <TvOsd />
                </CrtScreen>
                <DiscoGlints x={gx} y={gy} />
                <PlatePicture name="cutout" alt="Swarnava sitting on a stack of retro TVs in a studio" className="plate__img plate__cutout" />
              </div>
              <BrushWordmark ref={wordmark} className="wordmark" priority />
            </div>
            <div ref={nameBlock} className="hero__name">
              <h1 id="hero-title" className="hero__h1" style={{ "--chars": name.length } as CSSProperties}>
                {name.toUpperCase()}
              </h1>
              <p className="hero__role">{role}</p>
              {/* Portrait only: the top TV is too small to read or tap there, so its
                  cycling niche is repeated here as a plain link (hidden on cinema). */}
              <p className="hero__now">
                <TapeLink href={niche.href} className="hero__now-link">
                  <span className="hero__now-label">
                    <Icon name="play" size="0.75em" /> NOW PLAYING
                  </span>
                  <span key={top} className="hero__now-word fx-glitch-once">
                    {niche.word}
                  </span>
                </TapeLink>
              </p>
              {/* Floating round buttons: the profiles, and a jump to the contact section. */}
              <ul className="hero__dock" aria-label="Elsewhere">
                {socials
                  .filter((s) => s.kind)
                  .map((s) => (
                    <li key={s.label}>
                      <a className="hero__dock-btn" href={s.href} aria-label={s.label} {...(s.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        <Icon name={s.kind!} size="1.25em" />
                      </a>
                    </li>
                  ))}
                <li>
                  <a className="hero__dock-btn hero__dock-btn--contact" href="#contact" aria-label="Contact" onClick={toContact}>
                    <Icon name="mail" size="1.25em" />
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p ref={cue} className="hero__cue" aria-hidden="true">
          SCROLL <Icon name="play" turn={90} size="0.75em" className="crt__blink" />
        </p>
        {/* The Dive's last stretch: the TV's orange screen growing to fill the page. */}
        <div ref={diveScreen} className="dive-screen" aria-hidden="true" />
      </div>
      <Intro heroWordmark={wordmark} ready={ready} />
    </section>
  );
}

