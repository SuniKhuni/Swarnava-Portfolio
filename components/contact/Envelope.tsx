"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useMotionValueEvent } from "motion/react";
import { useSpringValue } from "@/lib/scroll";
import { sendMessage } from "@/app/actions/contact";
import { clamp01, easeInOutCubic, spring, timing } from "@/lib/motion";
import { useReducedMotionSafe } from "@/lib/hooks";
import { Button } from "../ui/Button";
import { LetterForm } from "./LetterForm";
import { checkFields, mailtoFor, type ContactState, type FieldErrors } from "./contact-shared";

const INITIAL: ContactState = { ok: false };

type EnvelopeProps = { hasBackend: boolean; email: string };

/**
 * The contact artifact (§7.12). The form is in the DOM and in reading order at all times;
 * without JS (and with reduced motion) the letter is simply out.
 *
 * With JS the envelope is a pinned scroll scene: it starts closed and big in the middle of the
 * screen; scrolling opens the flap, shrinks the envelope to its place, and the letter — the
 * form — pops out of it, full size. Then the page scrolls on. It ejects when the message is sent.
 */
export default function Envelope({ hasBackend, email }: EnvelopeProps) {
  const stage = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const reduce = useReducedMotionSafe();
  const seen = useInView(stage, { once: true, amount: 0.6 });
  const entered = useInView(stage, { once: true, margin: "0px 0px -10% 0px" });

  const [state, formAction, pending] = useActionState(sendMessage, INITIAL);
  const [opened, setOpened] = useState(false);
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const [clearedState, setClearedState] = useState<ContactState | null>(null);
  const [mailSent, setMailSent] = useState(false);
  const [stamp, setStamp] = useState("00:00:00");
  const [round, setRound] = useState(0);
  const scene = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const env = useRef<HTMLDivElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const letter = useRef<HTMLDivElement>(null);
  const props = useRef<HTMLDivElement>(null);

  // The scene's timeline, in pin progress (0 → 1 while the screen holds still).
  //   flap   the closed envelope, big in the middle, opens
  //   shrink it shrinks and drops to where it waits, low but fully on screen
  //   rise   the letter slides up out of it, still envelope-sized
  //   grow   once out, it grows to full size
  //   settle the view follows it up: it ends at the top, the envelope below it
  const SCENE = { flap: [0.04, 0.28], shrink: [0.18, 0.46], rise: [0.4, 0.62], grow: [0.56, 0.8], settle: [0.6, 0.86] } as const;
  const seg = (v: number, [a, b]: readonly [number, number]) => easeInOutCubic(clamp01((v - a) / (b - a)));
  // Progress through the hold: the pin sticks for exactly (scene height − pin height) of scroll.
  const progress = useMotionValue(0);
  useEffect(() => {
    const update = () => {
      const sc = scene.current;
      const p = pin.current;
      if (!sc || !p) return;
      const hold = sc.offsetHeight - p.offsetHeight;
      progress.set(hold > 0 ? clamp01(-sc.getBoundingClientRect().top / hold) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [progress]);
  const smooth = useSpringValue(progress, spring.soft);

  const server = state === clearedState ? INITIAL : state;
  const sent = mailSent || server.ok;
  const status = pending ? "sending" : sent ? "sent" : server.formError ? "error" : "idle";
  // Scroll drives it. Off with reduced motion (the envelope simply opens when seen).
  const scrub = !reduce && !sent;

  // Geometry, re-measured on resize. Offsets are from where the envelope rests at the end:
  //   --lift-a  to the middle of the free screen (between the HUD/Remote bars), for the start
  //   --lift-b  to where it waits while the letter pops — as low as it goes, still fully visible
  //   --big     how much larger the closed envelope starts; --lsmall the tucked letter's scale
  // The props' layer gets --clear: the widest thing in the middle, so they keep to the sides.
  useEffect(() => {
    const st = stage.current;
    const p = pin.current;
    const e = env.current;
    const bk = back.current;
    const lt = letter.current;
    if (!scrub || !st || !p || !e || !bk || !lt) return;
    const measure = () => {
      const vh = window.innerHeight;
      const vw = document.documentElement.clientWidth;
      const phone = vw < 768;
      // Chrome on screen: phones have the HUD line on top and the Remote at the bottom;
      // larger screens have the Remote on top.
      const topBar = phone ? 40 : 76;
      const bottomBar = phone ? 104 : 24;
      const room = vh - topBar - bottomBar;
      const envW = bk.offsetWidth;
      const envH = bk.offsetHeight;
      // The envelope's centre, from the top of the pinned screen, where it rests at the end.
      const rest = st.offsetTop + e.offsetHeight - envH / 2;
      const big = Math.max(1, Math.min((0.86 * vw) / envW, (0.56 * room) / envH));
      const start = topBar + room / 2;
      const wait = Math.min(rest, vh - bottomBar - envH / 2 - 12);
      st.style.setProperty("--big", String(big));
      st.style.setProperty("--lift-a", `${start - rest}px`);
      st.style.setProperty("--lift-b", `${wait - rest}px`);
      st.style.setProperty("--lsmall", String(Math.min(1, (envW * 0.86) / lt.offsetWidth)));
      const clear = Math.max(envW * big, lt.offsetWidth) + 48;
      props.current?.style.setProperty("--clear", `${clear}px`);
      if (props.current) props.current.dataset.room = (vw - clear) / 2 >= 120 ? "yes" : "no";
    };
    const ro = new ResizeObserver(measure);
    ro.observe(p);
    ro.observe(e);
    measure();
    return () => ro.disconnect();
  }, [scrub, round]);

  useMotionValueEvent(smooth, "change", (v) => {
    const el = stage.current;
    if (!el || !scrub) return;
    const flap = seg(v, SCENE.flap);
    const rise = seg(v, SCENE.rise);
    const grow = seg(v, SCENE.grow);
    el.style.setProperty("--flap", String(flap));
    el.style.setProperty("--shrink", String(seg(v, SCENE.shrink)));
    el.style.setProperty("--rise", String(rise));
    el.style.setProperty("--grow", String(grow));
    el.style.setProperty("--settle", String(seg(v, SCENE.settle)));
    if (flap > 0.12) el.dataset.opening = "";
    else delete el.dataset.opening;
    if (rise > 0.02) el.dataset.rising = "";
    else delete el.dataset.rising;
    if (flap > 0.5) el.dataset.flapPast = "";
    else delete el.dataset.flapPast;
    if (grow > 0.95 !== opened) setOpened(grow > 0.95);
  });

  // OPEN, or tabbing into a tucked letter: scroll to the end of the scene, where it is out.
  const toEnd = (focusName: boolean) => {
    const sc = scene.current;
    if (!sc) return;
    const top = sc.getBoundingClientRect().top + window.scrollY + sc.offsetHeight - window.innerHeight;
    window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    if (focusName) setTimeout(() => form.current?.querySelector<HTMLElement>("input[name='name']")?.focus({ preventScroll: true }), 900);
  };
  const open = !sent && (reduce || opened || (!scrub && seen));
  const errors: FieldErrors = { ...server.fieldErrors, ...clientErrors };

  // Server-side validation came back: focus the first invalid field and shake once.
  useEffect(() => {
    if (!server.fieldErrors) return;
    const first = (["name", "email", "message"] as const).find((k) => server.fieldErrors?.[k]);
    if (first) form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
    shake();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [server.fieldErrors]);

  function shake() {
    if (reduce) return;
    stage.current?.querySelector(".env")?.animate(
      [0, -6, 6, -6, 6, -6, 6, 0].map((x) => ({ transform: `translateX(${x}px)` })),
      { duration: timing.envelope.shake * 1000, easing: "linear" },
    );
  }

  const openFromButton = (viaKeyboard: boolean) => {
    if (scrub) return toEnd(viaKeyboard);
    setOpened(true);
    if (!viaKeyboard) return;
    const wait = reduce ? 0 : (timing.envelope.flap + timing.envelope.letter) * 1000;
    setTimeout(() => form.current?.querySelector<HTMLElement>("input[name='name']")?.focus(), wait);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const v = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      need: String(fd.get("need") ?? "Something else"),
      message: String(fd.get("message") ?? ""),
    };
    setStamp(document.querySelector(".hud__tc")?.textContent ?? "00:00:00");
    if (pending) {
      e.preventDefault();
      return;
    }
    const found = checkFields(v);
    setClientErrors(found);
    const firstBad = (["name", "email", "message"] as const).find((k) => found[k]);
    if (firstBad) {
      e.preventDefault();
      e.currentTarget.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      shake();
      return;
    }
    if (!hasBackend) {
      // No email backend: hand the message to the visitor's mail app, then show the sent state.
      e.preventDefault();
      window.location.href = mailtoFor(email, v);
      setMailSent(true);
    }
  };

  const sendAnother = () => {
    setClearedState(state);
    setMailSent(false);
    setClientErrors({});
    setRound((r) => r + 1); // fresh, empty fields
    setOpened(true);
  };

  return (
    <div ref={scene} className="env-scene" data-scrub={scrub || undefined}>
    <div ref={pin} className="env-pin">
    {/* 3D retro props, in the side margins of the held screen — desktop only (contact.css). */}
    <div ref={props} className="env-props" aria-hidden="true">
      {(["tape-a", "crt", "tape-b"] as const).map((k) => (
        <div key={k} className={`prop prop--${k.startsWith("tape") ? "tape" : "crt"} prop--${k}`}>
          {["front", "back", "top", "bottom", "left", "right"].map((f) => (
            <span key={f} className={`prop__face prop__${f}`} />
          ))}
        </div>
      ))}
    </div>
    <div ref={stage} className="env-stage" data-open={open} data-status={status} data-in={entered} data-scrub={scrub || undefined}>
      <div ref={env} className="env">
        {/* The address side: a delivery label with the section's heading. */}
        <div className="env__label">
          <p className="env__label-to" aria-hidden="true">
            ✦ SPECIAL DELIVERY
          </p>
          <h2 id="contact-title" className="env__title">
            CONTACT
          </h2>
          <p className="env__label-line" aria-hidden="true">
            SWARNAVA C. — CH 04 · TAPE 01
          </p>
        </div>

        <button
          type="button"
          className="env__toggle"
          aria-label="Open the letter"
          aria-expanded={open}
          aria-controls="letter"
          hidden={open || sent}
          onClick={(e) => openFromButton(e.detail === 0)}
        >
          {/* A wax seal on the flap's point, stamped OPEN — it breaks as the flap lifts. */}
          <span className="env__seal" aria-hidden="true">
            <svg viewBox="0 0 32 32" aria-hidden="true" className="env__seal-glyph">
              <rect x="5" y="9" width="22" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
              <rect x="8.5" y="12.5" width="12" height="9" rx="1.5" fill="currentColor" />
              <path d="M11 9 7 4M21 9l4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="env__seal-text">OPEN</span>
          </span>
        </button>
        <div ref={back} className="env__back" aria-hidden="true" />
        <div className="env__flap" aria-hidden="true">
          <span className="env__flap-face" />
          <span className="env__flap-under" />
        </div>

        <div
          ref={letter}
          id="letter"
          className="env__letter"
          onFocusCapture={() => {
            if (sent) return;
            if (scrub && !opened) toEnd(false);
            else if (!open) setOpened(true);
          }}
        >
          <LetterForm
            key={round}
            ref={form}
            action={formAction}
            onSubmit={onSubmit}
            errors={errors}
            values={server.values}
            pending={pending}
            formError={status === "error" ? server.formError : undefined}
            email={email}
          />
        </div>

        <div className="env__pocket" aria-hidden="true">
          {/* Folds: the side flaps under the bottom flap, a soft shadow under each, and the
              closed flap's shadow (it fades as the flap lifts). 100 × 100, stretched. */}
          <svg className="env__folds" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <filter id="env-soft" x="-10%" y="-10%" width="120%" height="140%">
                <feGaussianBlur stdDeviation="1.4" />
              </filter>
            </defs>
            <polygon className="env__fold env__fold--left" points="0,0 50,45 0,100" />
            <polygon className="env__fold env__fold--right" points="100,0 50,45 100,100" />
            <polygon className="env__fold-shadow" points="0,100 50,48 100,100" filter="url(#env-soft)" />
            <polygon className="env__fold env__fold--bottom" points="0,100 50,53 100,100" />
            <polygon className="env__flap-shade" points="0,0 50,63 100,0" filter="url(#env-soft)" />
          </svg>
          <span className="env__paper" />
          <span className="env__airmail" />
          <span className="env__stamp">
            <span className="env__stamp-face">
              <svg viewBox="0 0 32 32" aria-hidden="true" className="env__stamp-glyph">
                <rect x="5" y="9" width="22" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <rect x="8.5" y="12.5" width="12" height="9" rx="1.5" fill="currentColor" />
                <path d="M11 9 7 4M21 9l4-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="env__stamp-value">01</span>
            </span>
          </span>
          <svg className="env__rings" viewBox="0 0 128 64" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="96" cy="32" r="26" strokeWidth="2" />
            <circle cx="96" cy="32" r="19" strokeWidth="1.2" />
            <text x="96" y="35" textAnchor="middle" fontSize="9" fill="currentColor" stroke="none" fontFamily="var(--font-osd)" letterSpacing="1">
              TAPE 01
            </text>
            {[16, 26, 36, 46].map((y) => (
              <path key={y} d={`M2 ${y} q7 -5 14 0 t14 0 t14 0 t14 0 t14 0`} strokeWidth="1.8" strokeLinecap="round" />
            ))}
          </svg>
          <span className="env__postmark">SENT</span>
        </div>
      </div>

      <div className="env__receipt" hidden={!sent}>
        <p className="t-label">MESSAGE SENT</p>
        <p className="t-osd-lg env__receipt-tc">{stamp}</p>
        <Button variant="solid" onClick={sendAnother}>
          SEND ANOTHER
        </Button>
      </div>

      <p className="sr-only" aria-live="polite">
        {sent ? "Message sent" : ""}
      </p>
    </div>
    </div>
    </div>
  );
}
