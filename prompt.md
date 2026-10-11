# BUILD PROMPT — SWARNAVA · "TAPE 01"

Portfolio site for **Swarnava Chakraborty**, built in Next.js.

**How to use this file:** put the source files in `/_assets-src/` using the names in §5, open the repo in your coding agent (Antigravity, Claude Code, Cursor), and paste this whole file as the first message. It holds the concept, the design system, a handoff spec for every screen, the motion spec and the acceptance tests.

**Map:** 0 How to work · 1 Brief · 2 Decisions · 3 Concept · 4 Stack · 5 Assets · 6 Tokens · 7 Components · 8 Global chrome · 9 Handoff specs · 10 Responsive · 11 Accessibility · 12 Performance · 13 Content · 14 Build order · 15 Options · 16 Don'ts and traps · 17 Report back

---

## 0. How to work

You are a senior design engineer who builds motion-heavy Next.js sites. Build the site specified here.

1. **Audit before you write.** The owner says a landing page, a BTS section and two 21st.dev components (logo strip, project cards) are already laid out, and that the before/after slider and the BTS content are what is left. Read the repo, list what exists, and map each piece to a component in §7. Keep what meets the spec, move it onto the tokens in §6, replace what cannot meet it. If the repo is empty, scaffold it (§4).
2. **Build in the order of §14.** After each phase: lint, build, open the pages at 390, 768 and 1440 px wide, and tick that phase's acceptance list before starting the next.
3. **Never invent content.** No made-up client names, subscriber counts, view counts, testimonials or about-me copy. Use the bracketed placeholders from §13 and log each one in `CONTENT-TODO.md`.
4. **Measure anything marked ≈.** Those values were estimated by eye from a downscaled view of the art. Measure the real value from the file, correct the constant, and list the corrected values in your report.
5. **§2 is settled.** Anywhere else, when something is ambiguous, ask one question: would this happen on a VCR, a CRT, a tape, a strip of film or a sheet of paper? If not, leave it out. Note the choice in your report (§17).

---

## 1. Brief

- **Who:** Swarnava Chakraborty. Makes thumbnails and content visuals for creators in four niches: Gaming, Podcast, Crypto, Social Media. The key art names three pillars: Design, Artificial Intelligence, Creativity. The exact role line is a placeholder (§13).
- **Job of the site:** a creator or brand lands, sees the work, believes the transformation (before → after), and sends a message.
- **Routes:** `/` landing · `/work` showcase of all four categories · `/work/[category]` expanded view with the before/after slider · `not-found`.
- **Kept from the owner's existing design:** the hero key art (subject seated on stacked CRT TVs, giant `SWARNAVA` behind them), the orange BTS section with a huge white `BTS.` and a tablet bleeding off the right edge, the brand palette, and the wireframe structure.

### 1.1 The wireframe, transcribed

| # | Section | What the sketch shows | Built as |
|---|---|---|---|
| — | Nav | Pill at top centre: home icon, ABOUT ME, PROJECTS, CONTACT | Remote (§8.1) |
| 1 | Hero | Giant `SWARNAVA`; the full name under it in a "robotic font"; subject on two TVs, the top one reads `CONTENT`, the lower one `AI, DESIGN, CREATIVITY`; "scroll animation" into the next section | §9.1 |
| 2 | BTS | Big `BTS`, about-me text on the left, a tablet on the right with photos; `WORKED WITH` and client circles underneath | §9.2, §9.3 |
| 3 | Projects | Cards for GAMING, PODCAST, CRYPTO, SOCIAL MEDIA, each with a round arrow button; pagination dots | §9.4 |
| 3a | Showcase page | Four bands (Gaming, Podcast, Crypto, Social Media), each with two rows of thumbnails sliding in opposite directions; contact at the end | §9.5 |
| 3b | Expanded view | `GAMING —` title, a BEFORE / AFTER slider on top, two sliding rows of thumbnails under it | §9.6 |
| 4 | Contact | An envelope with a letter coming out, `CONTACT` written on it | §9.7 |

From the inspiration board take only the information pattern: creator name plus subscriber count on client items, a view-count chip on thumbnails, category pills on the showcase. Do not copy its blue look or its layout.

### 1.2 Assumptions — confirm with the owner; until then build as written

1. Display face is Bebas Neue (the existing wordmark looks like it), OSD face is VT323, body is Archivo.
2. The contact form emails through Resend, with a `mailto:` fallback.
3. The default colour journey is cream → orange → black (§6.1).
4. Clicking a project tape goes straight to that category's expanded view.
5. All copy, clients and work items are placeholders until supplied (§13).

---

## 2. Decisions already made

These answer the owner's open questions. Treat them as constraints.

| Open question | Verdict | What it means for the build |
|---|---|---|
| Is this over-engineered? | As six unrelated set-pieces (TVs, tablet, logo strip, galleries, slider, envelope): yes. As one world: no. | One metaphor everywhere — analog video. **One signature interaction per section** (budget below). Everything else is a plain fade or slide. No new sections. |
| Will it scale on mobile? | Not as a shrunk desktop. | Mobile is art-directed separately (§10): a portrait hero composition, two image layers, no pinning, parallax or cursor effects on touch, the shelf becomes a snap carousel, the envelope becomes a sheet form. The budgets in §12 are hard limits. |
| Is it unique enough? | The art is. The page skeleton — hero, about, logos, cards, contact — is every portfolio's. | Uniqueness comes from behaviour the art already implies: `PLAY ▶`, `SP`, `00:00:00`, CRTs, VHS tapes. Three things must be excellent: the **live TVs and the Dive**, **scroll as timecode and channels**, and **tape → transition → tracking wipe**. |
| Colour scheme? | Keep the brand palette. Drop the off-palette pure red `#FE0000` on the wordmark. | The wordmark uses brand orange. The page travels the brand gradient backwards as you scroll: cream → orange → black (§6.1). Alternates are in §15. |
| Tablet, TV or letter for BTS? Envelope for contact? | Keep the tablet and the envelope — one is built, the other is wanted — and pull both into the world. | The tablet becomes a **field monitor** (REC dot, battery, frame counter). The envelope sits on the black scene and **ejects** when the message is sent. |
| Effects on the work? | Never. | Scanlines, glitch, static and grain live on chrome and props only. Thumbnails, before/after images, photos and body text stay clean. |

### Motion budget

| Section | The one signature | Ambient loops (max 2) | Everything else |
|---|---|---|---|
| Hero | The Dive (scroll) | TV cyclers, disco glints | fade / rise |
| BTS | Polaroid stack in the monitor (drag) | REC dot | line reveals |
| Worked with | Film strip that speeds up with scroll | — | — |
| Projects | Tape rises from its sleeve, ejects into the transition | reels spin while hovered | staggered rise |
| Showcase / expanded | Tracking wipe (before/after) | two rows drifting opposite ways | — |
| Contact | Envelope opens, sends, ejects | — | — |

If you want to add an animation that is not in this table or in §9, don't.

---

## 3. Concept — the site is a tape

The whole site behaves like a VHS tape playing on the stack of TVs in the hero art. That art already carries the interface: `PLAY ▶`, `SP` and `00:00:00` are printed on its screens.

| Web thing | In this world |
|---|---|
| Scroll position | Tape timecode — on the HUD and on the hero's top TV |
| Sections | Channels — `CH 01 HOME`, `CH 02 BTS`, `CH 03 WORK`, `CH 04 CONTACT` |
| Nav | The Remote — a black pill |
| Section or route change | Channel change — a burst of static, 180 ms at most |
| Hero → BTS | The Dive — the camera pushes into the lower TV until its screen is the page |
| About photos | A field monitor showing a stack of Polaroids |
| Client logos | A strip of film running across the page |
| Project categories | Four VHS tapes on a shelf |
| Before / after | The Tracking Wipe |
| Contact | Mail the tape back — the envelope |
| Footer | `END OF TAPE`, `◀◀ REWIND` |
| 404 | `NO SIGNAL` |

---

## 4. Stack and repo

- **Next.js**, latest stable, App Router, TypeScript. Server Components by default; `"use client"` only on interactive leaves. If the repo already pins versions, keep them — do not migrate frameworks or Tailwind majors. On Next 15 and later, `params` and `searchParams` are Promises.
- **Tailwind CSS**, whichever major the repo has. Tokens are CSS custom properties in `app/globals.css`, exposed to Tailwind (`@theme` on v4, `theme.extend` on v3).
- **Motion for React** — package `motion`, imports from `motion/react` — is the only animation library. Wrap the app in `<MotionConfig reducedMotion="user">`.
- `next/font/google` for the three families. `next/image` for every raster, with `images.formats: ["image/avif", "image/webp"]`.
- `sharp` (dev) for `scripts/prep-assets.mjs`. `zod` for the contact action.
- **Contact:** a Server Action. It sends through Resend when `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are set; without them, submit builds a `mailto:` link from the fields. Honeypot field plus a simple per-IP rate limit.
- **SEO:** `metadata` (title `Swarnava Chakraborty — [ROLE LINE]`), `opengraph-image`, `sitemap.ts`, `robots.ts`, JSON-LD `Person`.
- **Not in v1:** GSAP, Lenis or any smooth-scroll library, three.js / WebGL, Lottie, video, sound, a CMS, analytics, a dark-mode toggle.

```text
app/
  layout.tsx                fonts, MotionConfig, Remote, Hud, TransitionOverlay, CursorChip
  page.tsx                  Hero, Bts, FilmStrip, Shelf, Contact, Footer
  work/page.tsx             showcase
  work/[category]/page.tsx  expanded view (generateStaticParams)
  not-found.tsx             NO SIGNAL
  opengraph-image.tsx
  actions/contact.ts
  globals.css               tokens, scenes, base
components/
  chrome/   Remote, Hud, Footer, TapeLink, TransitionOverlay, CursorChip
  fx/       Scanlines, Static, Glitch
  hero/     Hero, Stage, Wordmark, CrtScreen, Cycler, DiscoGlints, useDive
  bts/      Bts, Monitor, PolaroidStack
  clients/  FilmStrip
  work/     Shelf, Cassette, CategoryBand, MarqueeRow, ThumbCard, CompareSlider
  contact/  Contact, Envelope, LetterForm
  ui/       Button, OsdChip, Field, Icon
content/    site.ts, clients.ts, work.ts
lib/        motion.ts, scene-map.ts, hooks.ts
scripts/    prep-assets.mjs, check-tokens.mjs, check-content.mjs
public/     hero/, bts/, clients/, work/<category>/, fx/noise.png
```

**21st.dev components already in the repo:** keep one only if it can be restyled entirely with the tokens in §6, needs no second animation library, and passes §11. Otherwise replace it with the component specified here.

---

## 5. Assets

### 5.1 Supplied

| File in `/_assets-src/` | What it is | Measured facts |
|---|---|---|
| `scene.png` | Full studio scene, subject included, no wordmark | 1672 × 941, RGB, 1.9 MB |
| `cutout.png` | Subject only, transparent background | 1672 × 941, RGBA, pixel-aligned with `scene.png`; subject bounding box x 450–1198, y 70–889 |
| `ref-hero.jpg` | The owner's current hero composite | Reference: wordmark placement, the faint letter outline across the jacket |
| `ref-bts.jpg` | The owner's current BTS mock | Reference: `BTS.` scale, tablet placement, orange ground |
| `wire-landing.jpg`, `wire-board.jpg`, `wire-details.jpg` | Wireframes | Transcribed in §1.1 |
| `ref-palette-inspo.jpg` | Brand palette and inspiration board | Palette transcribed in §6.1 |

**What is in `scene.png`:** a cream seamless studio wall and floor. The subject sits on two stacked CRT TVs. The upper screen reads `CONTENT` with `PLAY ▶`, `SP` and `00:00:00` on-screen display; the lower screen is blank static with the same display. A smaller CRT on the left shows glitching colour bars; one on the right shows a palm-tree sunset. Far left: a mirror disco ball and a stack of VHS tapes. Far right: film reels and three books titled Design, Artificial Intelligence, Creativity. Yellow and pink paint strokes on the floor.

**Wall colour:** `#EFD5BC` at top-centre, darkening to about `#E1BE9E` in the top-left corner. The scene has a vignette, so its edges must be feathered into the page ground (§9.1).

### 5.2 Scene map

Every live element in the hero is positioned in percentages of the 1672 × 941 plate.

```ts
// lib/scene-map.ts — pixels in the 1672 × 941 plate.
// ≈ The four screen rects and the disco ball were estimated by eye.
//   Measure them in the file, then confirm with ?debug=screens.
export const PLATE = { w: 1672, h: 941 };
export const SUBJECT = { x: 450, y: 70, w: 748, h: 819, centreX: 0.493 }; // measured
export const SCREENS = {
  top:    { x: 722,  y: 556, w: 218, h: 116, r: 10 }, // reads CONTENT — cover + niche cycler
  bottom: { x: 697,  y: 712, w: 235, h: 130, r: 12 }, // blank — cover + pillar cycler + Dive target
  left:   { x: 375,  y: 554, w: 107, h: 86,  r: 8  }, // colour bars — ambient
  right:  { x: 1160, y: 584, w: 105, h: 72,  r: 8  }, // sunset — ambient
} as const;
export const DISCO = { cx: 297, cy: 680, r: 80 };
export const toPlate = (r: { x: number; y: number; w: number; h: number }) => ({
  left: `${(r.x / PLATE.w) * 100}%`,
  top: `${(r.y / PLATE.h) * 100}%`,
  width: `${(r.w / PLATE.w) * 100}%`,
  height: `${(r.h / PLATE.h) * 100}%`,
});
```

`?debug=screens` (development only) draws each rect as a 50% magenta box, so alignment can be checked at every breakpoint.

### 5.3 Prep script

`scripts/prep-assets.mjs` copies `scene.png` and `cutout.png` to `public/hero/` and writes:

- `public/hero/cutout-mask.webp` — the cutout's alpha channel at 836 px wide, for the CSS mask on the ghost outline.
- `public/fx/noise.png` — a 128 × 128 greyscale noise tile.

Everything else is served through `next/image` from the originals.

### 5.4 Missing — ask the owner, build with placeholders meanwhile

1. **Hero at 2×** (3344 × 1882). The supplied art is 1672 px wide and will look soft on retina desktops. Ship v1 with what exists.
2. **`scene-blank.png`** — same frame, all four TV screens blank. Removes the need to cover baked-in text.
3. **`scene-clean.png`** — same frame, no subject. Unlocks subject parallax (§9.1).
4. **BTS photos** — 6 to 8, portrait 4:5, at least 1200 px tall, each with a short caption.
5. **Clients** — square avatar (256 px or larger), name, subscriber count or handle, link.
6. **Work** — per item: the final image, the raw "before" in the same aspect ratio, title, client, optional view count and link. Eight or more per category fills two rows.
7. **Copy** — role line, about text, contact line, email, socials.
8. **An OSD font file with a licence**, if an exact match to the art's on-screen text is wanted. Otherwise VT323.

---

## 6. Design system — tokens

### 6.1 Colour

```css
:root {
  /* primitives — brand board */
  --black: #000000;      /* Primary */
  --gray-900: #333333;   /* Dark Gray */
  --gray-600: #646464;   /* Gray */
  --gray-400: #A7A7A7;   /* Light Gray */
  --white: #F9F9F9;      /* White */
  --orange-500: #E85002; /* Branding Orange */
  --orange-400: #F16001; /* gradient stop 3 */
  --red-600: #C10801;    /* gradient stop 2 */
  --sand-300: #D9C3AB;   /* gradient stop 4 */
  --gradient-brand: linear-gradient(90deg, #000000 0%, #C10801 33%, #F16001 66%, #D9C3AB 100%);

  /* primitives — sampled from the art */
  --cream-200: #EFD5BC;  /* hero wall, top-centre */
  --cream-100: #FFE2C4;  /* monitor screen in the BTS mock */

  /* tape-label stripes — ≈ eyedrop the three book spines and replace */
  --stripe-mustard: #EDB021;
  --stripe-pink: #EE6A8A;
  --stripe-blue: #1E88C7;
}

[data-scene="cream"] {
  --bg: var(--cream-200);    --fg: var(--black);  --fg-muted: var(--gray-900);
  --fg-display: var(--orange-500);  --accent: var(--red-600);
  --surface: var(--white);   --on-surface: var(--black);
  --line: rgb(0 0 0 / .14);  --focus: var(--black);
}
[data-scene="signal"] {
  --bg: var(--orange-500);   --fg: var(--black);  --fg-muted: var(--black);
  --fg-display: var(--white);  --accent: var(--black);
  --surface: var(--black);   --on-surface: var(--white);
  --line: rgb(0 0 0 / .22);  --focus: var(--black);
  background:
    radial-gradient(60% 45% at 30% 60%, var(--orange-400) 0%, transparent 70%),
    radial-gradient(70% 55% at 100% 100%, var(--red-600) 0%, transparent 70%),
    var(--orange-500);
}
[data-scene="night"] {
  --bg: var(--black);        --fg: var(--white);  --fg-muted: var(--gray-400);
  --fg-display: var(--white);  --accent: var(--orange-500);
  --surface: var(--gray-900);  --on-surface: var(--white);
  --line: rgb(249 249 249 / .14);  --focus: var(--orange-500);
}
```

Every `<section>` declares `data-scene`. Components read only the semantic tokens.

| Section | Scene |
|---|---|
| Hero | `cream` |
| BTS | `signal` |
| Film strip, Projects, `/work`, `/work/[category]`, Contact, Footer, 404 | `night` |

On the signal scene both glows must be fully transparent along the section's top edge, because the Dive ends on flat `--orange-500` and the seam must not show. No text may sit over the red glow.

**Contrast, measured (WCAG 2.x):**

| Pair | Ratio | Allowed for |
|---|---|---|
| `--black` on `--cream-200` | 14.9 : 1 | everything |
| `--gray-900` on `--cream-200` | 9.0 : 1 | everything |
| `--red-600` on `--cream-200` | 4.5 : 1 | small accent text |
| `--gray-600` on `--cream-200` | 4.2 : 1 | 24 px and larger, or non-text |
| `--orange-500` on `--cream-200` | 2.7 : 1 | the wordmark (a logotype) and decoration only |
| `--black` on `--orange-500` | 5.6 : 1 | everything |
| `--white` on `--orange-500` | 3.6 : 1 | 24 px and larger — `BTS.` yes, paragraphs no |
| `--black` on `--red-600` | 3.3 : 1 | nothing — keep text off the red glow |
| `--white` on `--black` | 19.9 : 1 | everything |
| `--gray-400` on `--black` | 8.7 : 1 | everything |
| `--orange-500` on `--black` | 5.6 : 1 | everything |
| `--gray-600` on `--black` | 3.5 : 1 | 24 px and larger, or non-text |
| `--white` on `--gray-900` | 12.0 : 1 | everything |
| `--orange-500` on `--gray-900` | 3.4 : 1 | 24 px and larger |
| `--red-600` on `--white` | 6.0 : 1 | form errors on the letter |

Rules that follow: paragraphs on the signal scene are black, never white. `--gray-600` is never small text. Orange is never text on cream apart from the wordmark. Small accent text on cream uses `--red-600`.

### 6.2 Type

Three families through `next/font/google` — `Bebas_Neue`, `VT323`, `Archivo` — exposed as `--font-bebas`, `--font-vt323`, `--font-archivo`, with `display: "swap"`.

```css
:root {
  --font-display: var(--font-bebas), Impact, "Arial Narrow", sans-serif;
  --font-osd: var(--font-vt323), ui-monospace, monospace;
  --font-body: var(--font-archivo), system-ui, sans-serif;

  --text-mega: clamp(9rem, 32vw, 30rem);
  --text-section: clamp(5rem, 15vw, 16rem);
  --text-title: clamp(3rem, 7vw, 6.5rem);
  --text-label: clamp(1.75rem, 3vw, 2.75rem);
  --text-lead: clamp(1.125rem, 1.5vw, 1.375rem);
  --text-body: 1rem;
  --text-small: 0.875rem;
  --text-osd-lg: clamp(1.25rem, 1.6vw, 1.75rem);
  --text-osd: 1.125rem;
}
```

| Role | Family | Size token | Notes |
|---|---|---|---|
| Wordmark | Bebas Neue 400 | ≈ `29cqw` of the stage | caps, `line-height: .8` |
| Mega — `BTS.` | Bebas Neue | `--text-mega` | `line-height: .8` |
| Section words — `PROJECTS`, `ALL TAPES`, `END OF TAPE` | Bebas Neue | `--text-section` | `line-height: .82` |
| Titles — category names, `CONTACT` on the envelope | Bebas Neue | `--text-title` | `line-height: .9` |
| Labels — tape labels, film-strip tab | Bebas Neue | `--text-label` | |
| Lead — about copy | Archivo 500 | `--text-lead` | `line-height: 1.5`, max 46ch |
| Body | Archivo 400 | `--text-body` | `line-height: 1.6`, max 68ch |
| Small / meta | Archivo 500 | `--text-small` | `line-height: 1.5` |
| OSD large — HUD, name line, buttons | VT323 400 | `--text-osd-lg` | caps, `letter-spacing: .06em` |
| OSD — chips, captions, counters | VT323 | `--text-osd` | never below 16 px |

Bebas Neue and VT323 are caps-only faces here. Sentences are always Archivo.

### 6.3 Space, shape, layers

```css
:root {
  --space-1: 4px;  --space-2: 8px;   --space-3: 12px;  --space-4: 16px;  --space-6: 24px;
  --space-8: 32px; --space-12: 48px; --space-16: 64px; --space-24: 96px; --space-32: 128px;
  --gutter: clamp(16px, 4vw, 64px);
  --section-y: clamp(72px, 10vw, 160px);
  --content-max: 1320px;

  --radius-xs: 4px;  --radius-sm: 8px;  --radius-md: 16px;  --radius-lg: 28px;  --radius-pill: 999px;
  --shadow-prop: 0 24px 40px -18px rgb(0 0 0 / .45);  /* objects on cream and orange */
  --shadow-lift: 0 18px 30px -12px rgb(0 0 0 / .6);   /* hover on night */

  --z-sticky: 20;  --z-remote: 50;  --z-hud: 60;  --z-cursor: 70;  --z-overlay: 80;  --z-skip: 100;
}
```

Breakpoints, mobile-first: `sm 480` · `md 768` · `lg 1024` · `xl 1280` · `2xl 1536`. Grid: 12 columns, 24 px gap, inside `--gutter`, capped at `--content-max` (the hero stage is full-bleed).

### 6.4 Motion

```css
:root {
  --dur-flash: 90ms;  --dur-fast: 180ms;  --dur-base: 320ms;  --dur-slow: 600ms;  --dur-scene: 900ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
}
```

```ts
// lib/motion.ts
export const dur = { flash: 0.09, fast: 0.18, base: 0.32, slow: 0.6, scene: 0.9 } as const;
export const ease = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  in: [0.7, 0, 0.84, 0],
} as const;
export const spring = {
  snap:   { type: "spring", stiffness: 520, damping: 34, mass: 0.7 }, // handles, chips, nav highlight
  object: { type: "spring", stiffness: 220, damping: 24 },            // tapes, flap, letter, Polaroids, monitor
  soft:   { type: "spring", stiffness: 90,  damping: 20 },            // parallax
} as const;
export const stagger = { letters: 0.04, items: 0.07 } as const;
export const marquee = { pxPerSec: 40, maxBoost: 1.5 } as const;
export const cycle = { everyMs: 2400, glitchMs: 180 } as const;
```

Principles:

1. **Objects have weight.** Tapes, flaps, cards and photos move on `spring.object`. Chrome moves in 180–320 ms on `ease.out`.
2. **Scroll-linked beats time-based** wherever the visitor is already scrolling. Never hijack scroll: no wheel listeners, no document-level snapping, no custom scrollbar.
3. **Animate only** `transform`, `opacity` and `clip-path`. Never width, height, top, left, box-shadow, or blur on large layers.
4. **Loops pause** when offscreen, when the tab is hidden, and on hover or focus when they contain links.
5. **Glitch discipline.** One burst lasts 180 ms at most, there is at most one per second, it has at most two light/dark flips, and full-viewport static stays under 12% opacity (WCAG 2.3.1).
6. **Reduced motion** has its own table in §11. No content is lost with it.

### 6.5 Texture and effects

| Effect | Recipe | Allowed on |
|---|---|---|
| Scanlines | `repeating-linear-gradient(0deg, rgb(0 0 0 / .18) 0 1px, transparent 1px 3px)` | inside `CrtScreen`, `TransitionOverlay` |
| Scan bar | a 12%-tall band of `rgb(255 255 255 / .06)` travelling top to bottom, 6 s linear | inside `CrtScreen` |
| Static | `noise.png` tiled, `background-position` animated with `steps(6)` over 0.5 s | `CrtScreen`, `TransitionOverlay`, 404 |
| RGB split | `text-shadow: -1px 0 rgb(255 42 42 / .6), 1px 0 rgb(25 227 255 / .6)` | OSD text inside `CrtScreen` |
| Glitch | 3 frames — x −4 px, +3 px, 0 — each with a horizontal slice `clip-path`, plus RGB split | cycler words, HUD channel label, frame counter |

Never on thumbnails, before/after images, photos or body text.

### 6.6 Rules

- Components use semantic tokens only. No raw hex and no raw millisecond or cubic-bezier values outside `globals.css` and `lib/motion.ts`. `npm run check:tokens` fails on a hex colour inside `components/`.
- Tokens are kebab-case, components PascalCase. State lives in `data-state`, scene in `data-scene`.
- Icons: inline SVG, 24 px box, 1.5 px stroke, `currentColor`. The set is home, arrow-up-right, chevron-left, chevron-right, play, rewind, pause, stop, rec, battery, close. No icon library, no emoji. Transport glyphs (`▶ ◀◀ ❙❙ ■ ●`) are SVG, not font characters.

---

## 7. Design system — components

### 7.1 Component: Button

**Description.** The only button. A pill with an OSD-face label. Used for submit, `OPEN`, `VIEW ALL`, `REWIND`, pause toggles and carousel arrows.

| Variant | Use when |
|---|---|
| `solid` | The main action on a scene. Background `--fg`, label `--bg`. |
| `signal` | The single hottest action on a cream or night scene. Background `--orange-500`, label `--black`. |
| `ghost` | Secondary actions. 1.5 px `currentColor` border. |
| `icon` | A 48 px circle holding one icon: card arrows, carousel and transport controls. |

| Property | Type | Default | Description |
|---|---|---|---|
| `variant` | `"solid" \| "signal" \| "ghost" \| "icon"` | `"solid"` | |
| `size` | `"md" \| "lg"` | `"md"` | 48 px / 56 px tall; label `--text-osd` / `--text-osd-lg` |
| `href` | `string` | — | Renders a `TapeLink` instead of a `<button>` |
| `icon` | `IconName` | — | Trailing icon; the only content in `icon` |
| `loading` | `boolean` | `false` | |
| `aria-label` | `string` | — | Required for `icon` |

| State | Visual | Behavior |
|---|---|---|
| Default | Per variant | — |
| Hover | Lifts 2 px; a trailing arrow moves 3 px, `arrow-up-right` rotates 45° | `--dur-fast`, `--ease-out` |
| Active | Scale .97 | — |
| Focus-visible | 2 px `--focus` ring, 3 px offset | — |
| Disabled | 40% opacity | `aria-disabled`, ignores input |
| Loading | Label becomes `SENDING` with a blinking block cursor | `aria-busy`, ignores input |

**Accessibility.** Role: native `button` or `a`. Keyboard: Enter, plus Space on buttons. Screen reader: the label; `icon` uses `aria-label`. Minimum target 44 × 44 px.

| Do | Don't |
|---|---|
| One `signal` button per viewport | Use `signal` on the signal scene — that is orange on orange; use `solid` there |

### 7.2 Component: OsdChip

**Description.** An on-screen-display label for timecodes, counters, tags and hints. VT323 caps, `--text-osd`, padding `2px 8px`, radius `--radius-xs`.

| Variant | Use when |
|---|---|
| `ink` | On cream, orange or images. Black background, white text. |
| `paper` | On night. White background, black text. |
| `signal` | The one live or selected thing (`NOW PLAYING`, `REC`). Orange background, black text. |
| `bare` | HUD and captions. No background, `currentColor`. |

| Property | Type | Default | Description |
|---|---|---|---|
| `tone` | `"ink" \| "paper" \| "signal" \| "bare"` | `"ink"` | |
| `blink` | `boolean` | `false` | Opacity 1 / 0 with `steps(1)`, every 1 s. Off with reduced motion |
| `as` | `"span" \| "a" \| "button"` | `"span"` | |

| State | Visual | Behavior |
|---|---|---|
| Default | Per tone | — |
| Hover / focus (interactive only) | Tone inverts | `--dur-fast` |
| Blink | On / off, no fade | Pauses offscreen |

**Accessibility.** Decorative chips are `aria-hidden`. Informative chips are plain text in reading order. A chip is never the only carrier of a state: `NOW PLAYING` is paired with `aria-current`.

| Do | Don't |
|---|---|
| Caps, 16 px or larger | Set sentences in VT323 |

### 7.3 Component: Field

**Description.** A letter-style form control: label above, a ruled line below, no box.

| Variant | Use when |
|---|---|
| `text`, `email` | Single-line input, 48 px tall |
| `textarea` | The message. Five rows on ruled paper, a line every 32 px |
| `chips` | One choice from a short list, shown as 40 px pills over native radios |

| Property | Type | Default | Description |
|---|---|---|---|
| `name`, `label` | `string` | — | The label is always visible |
| `type` | `"text" \| "email" \| "textarea" \| "chips"` | `"text"` | |
| `options` | `string[]` | — | For `chips` |
| `required` | `boolean` | `false` | |
| `error` | `string` | — | Message shown under the control |
| `maxLength` | `number` | — | A counter appears in the last 10% |

| State | Visual | Behavior |
|---|---|---|
| Default | 1.5 px `--black` rule | — |
| Hover | 2 px rule | — |
| Focus | 2 px `--orange-500` rule and a 2 px `--focus` ring | — |
| Invalid | Rule and message in `--red-600`, with an icon | `aria-invalid`; message linked by `aria-describedby` |
| Disabled | 60% opacity | Read-only while sending |

**Accessibility.** Role: native input, textarea, or a `radiogroup` of native radios. Keyboard: Tab between fields, arrow keys inside the chips. Screen reader: label, required state, then the error.

| Do | Don't |
|---|---|
| 16 px input text, so iOS does not zoom | Use the placeholder as the label |

### 7.4 Component: CrtScreen

**Description.** A live screen laid over one of the four TVs in the hero art, positioned from `scene-map` in percentages of the plate.

| Variant | Use when |
|---|---|
| `cover` | The screen needs live content. An opaque black base hides what is baked into the art. |
| `ambient` | The baked picture stays. Adds scanlines, scan bar and flicker only. |

| Property | Type | Default | Description |
|---|---|---|---|
| `rect` | `SceneRect` | — | From `SCREENS`; includes the corner radius |
| `variant` | `"cover" \| "ambient"` | `"cover"` | |
| `as` | `"div" \| "a" \| "button"` | `"div"` | |
| `href`, `label` | `string` | — | `label` becomes the stable `aria-label` |
| `children` | `ReactNode` | — | Live content |

Layers, bottom to top: black base (cover only) → content → scanlines → scan bar → vignette (`radial-gradient` to 35% black at the corners) → glass highlight (6% white, top-left).

| State | Visual | Behavior |
|---|---|---|
| Idle | Loops running | — |
| Hover / focus (interactive) | Glass highlight brightens; a `▶ OPEN` chip appears bottom-centre | Content cycle pauses |
| Offscreen / tab hidden | Frozen | All loops paused |

**Accessibility.** Cycling content is `aria-hidden`; the element's `aria-label` carries the stable meaning. Focus ring follows the screen's radius.

| Do | Don't |
|---|---|
| Take every position and radius from `scene-map` | Put scanlines anywhere outside a `CrtScreen` or the `TransitionOverlay` |

### 7.5 Component: Monitor

**Description.** The BTS frame — the owner's tablet, treated as a field monitor. Pure CSS, no image.

| Property | Type | Default | Description |
|---|---|---|---|
| `rec` | `boolean` | `true` | Shows `REC ●` with a blinking `--red-600` dot |
| `label` | `string` | `"BTS"` | Bottom-left OSD |
| `counter` | `string` | — | Bottom-right OSD, e.g. `03/08` |
| `children` | `ReactNode` | — | Screen content |

Anatomy: bezel `--black`, width `clamp(18px, 2.4vw, 44px)`, outer radius `--radius-lg` (up to 44 px at full size), screen `--cream-100`, inner radius 12 px, `--shadow-prop`. OSD in VT323, black: `REC ●` top-left, battery icon top-right, `label` bottom-left, `counter` bottom-right, four 24 px corner brackets.

| State | Visual | Behavior |
|---|---|---|
| Default | Screen content plus OSD | — |
| Empty | `NO TAPE` centred | — |

**Accessibility.** The OSD is `aria-hidden`; the children carry the semantics.

| Do | Don't |
|---|---|
| Let it bleed off the right edge on wide screens, as in `ref-bts.jpg` | Replace it with a device photo or a brand-name tablet |

### 7.6 Component: PolaroidStack

**Description.** A stack of BTS photos inside the Monitor. The top one can be thrown to the back.

| Property | Type | Default | Description |
|---|---|---|---|
| `photos` | `{ src: string; alt: string; caption?: string }[]` | — | Up to 5 are rendered at once |
| `onChange` | `(index: number) => void` | — | Drives the Monitor's counter |

Each card: `--white` frame (10 px top and sides, 40 px bottom), photo 4:5, caption in VT323 in the bottom band, `--shadow-prop`. Rotation is fixed per index in the range −7° to 7° — computed from the index, never `Math.random()` in render.

| State | Visual | Behavior |
|---|---|---|
| Rest | Fanned stack, top card flat-ish | — |
| Dragging | Top card scales 1.04, shadow deepens, cursor chip `DRAG` | Follows the pointer |
| Thrown | Flies along the throw vector, rotates up to 18°, re-enters at the back | Release past 90 px or faster than 500 px/s; `spring.object` |
| Snapped back | Returns to the top | Release short of the threshold |
| One photo | Single card | No drag, no counter |
| No photos | — | Monitor shows `NO TAPE` |

**Accessibility.** Role: `group` with `aria-roledescription="carousel"` and `aria-label="Behind the scenes photos"`. Keyboard: previous / next `icon` buttons (visible on focus, always visible on touch); `→` and `Enter` advance, `←` goes back. Screen reader: a polite live region announces "Photo 3 of 8: {alt}".

| Do | Don't |
|---|---|
| Keep clicking or tapping the top card as "next" | Auto-advance — this one is the visitor's to play with |

### 7.7 Component: MarqueeRow

**Description.** The engine for the film strip and the work rows: an endless horizontal track that drifts, speeds up with page scroll, pauses, and can be dragged.

| Property | Type | Default | Description |
|---|---|---|---|
| `direction` | `1 \| -1` | `-1` | `-1` drifts left |
| `speed` | `number` | `40` | px per second |
| `label` | `string` | — | `aria-label` for the row |
| `children` | `ReactNode` | — | Rendered twice; the second copy is `aria-hidden` and `inert` |

| State | Visual | Behavior |
|---|---|---|
| Running | Drifts at `speed × (1 + boost)` | `boost = min(1.5, abs(scroll velocity) / 800)` |
| Paused | Still | Hover, focus-within, the pause control, offscreen, tab hidden |
| Dragging | Follows the pointer 1 : 1 | Releases with inertia, then resumes |
| Static | No duplication, `overflow-x: auto` with scroll snap | Reduced motion, or when one copy is narrower than the container |

**Accessibility.** Any section with moving rows has one visible pause / play `Button` (WCAG 2.2.2). Focusing an item pauses the row and scrolls the item into view. Duplicates are never focusable.

| Do | Don't |
|---|---|
| Wrap by the width of one copy | Run a CSS keyframe marquee next to this one — one engine only |

```tsx
"use client";
// Skeleton — the wrap logic and the pause conditions are the contract.
export function MarqueeRow({ children, direction = -1, speed = 40, label }: MarqueeRowProps) {
  const wrap = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const paused = useRef(false);
  const inView = useInView(wrap, { margin: "200px" });
  const reduce = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  useAnimationFrame((_, dt) => {
    if (reduce || paused.current || !inView || !copy.current) return;
    const w = copy.current.offsetWidth; // one copy, trailing gap included
    const boost = 1 + Math.min(1.5, Math.abs(velocity.get()) / 800);
    let next = x.get() + direction * speed * boost * (dt / 1000);
    if (next <= -w) next += w;
    if (next > 0) next -= w;
    x.set(next);
  });

  return (
    <div ref={wrap} aria-label={label} role="group"
         onPointerEnter={() => (paused.current = true)} onPointerLeave={() => (paused.current = false)}
         onFocusCapture={() => (paused.current = true)} onBlurCapture={() => (paused.current = false)}>
      <motion.div style={{ x, display: "flex", width: "max-content" }}>
        <div ref={copy} style={{ display: "flex" }}>{children}</div>
        <div aria-hidden inert style={{ display: "flex" }}>{children}</div>
      </motion.div>
    </div>
  );
}
```

### 7.8 Component: FilmStrip

**Description.** `MarqueeRow` dressed as a strip of 35 mm film, carrying the clients. It straddles the boundary between BTS and Projects.

| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `Client[]` | — | |
| `label` | `string` | `"WORKED WITH"` | Text on the leader tab; also the section's `<h2>` |
| `angle` | `number` | `-3` | Degrees |

Anatomy:
- **Band:** `--black`, height `clamp(112px, 11vw, 148px)`, width `108vw`, offset `-4vw`, rotated by `angle`, vertical margins of minus half its height so it sits centred on the section boundary.
- **Perforations:** two rows of 10 × 14 px holes, 3 px radius, every 28 px, punched with a CSS mask so the scenes show through. Fallback: holes painted `--gray-900`.
- **Leader tab:** fixed at the strip's left end and does not scroll. `--cream-200`, text `--black` in `--text-label`, 8 px overlap onto the strip, tilted a further −2°.
- **Item:** avatar 64–72 px circle with a 2 px `--cream-200` ring; name in Archivo 600, 16 px, `--white`; meta in VT323, `--gray-400`; 40 px between items; a decorative edge code such as `▸ 12A` in `--gray-600` between items, `aria-hidden`.

| State | Visual | Behavior |
|---|---|---|
| Running | Drifts left, faster with scroll | `MarqueeRow` |
| Item hover / focus | Avatar scales 1.08, ring turns `--orange-500`, name underlines | Strip pauses |
| Fewer than 4 clients | Static, centred | No duplication |
| No clients | Not rendered | BTS and Projects meet directly |

**Accessibility.** The section is a `region` labelled by its `<h2>`. Items with a URL are links named "{name}, {meta}"; others are plain text. Long names truncate at 22 characters with the full name as the accessible name. A missing avatar shows initials on `--gray-900`.

| Do | Don't |
|---|---|
| Keep it to a single strip | Cross two strips into an X |

### 7.9 Component: Cassette

**Description.** A project category as a VHS tape in its sleeve. Used on the shelf (§9.4).

| Property | Type | Default | Description |
|---|---|---|---|
| `category` | `Category` | — | Label, cover image, stripe, items |
| `index` | `number` | — | Stagger order, and the `01`–`04` number on the label |
| `href` | `string` | — | `/work/<id>` |

Anatomy — the whole card is one `TapeLink`, aspect 4 : 5:
- **Sleeve** (front): `--surface`, hairline `--line`, radius `--radius-md`, padding `--space-4`, column layout. Cover image 16 : 9 at the top (radius `--radius-sm`, the category's `cover`, full colour). Under it: a three-line stripe (category stripe colour, `--orange-500`, `--cream-200`), the title in `--text-title`, then a row with an `OsdChip` count (`24 TAPES`) and an `icon` Button (`arrow-up-right`).
- **Tape** (behind the sleeve): a dark cassette, inset 6% left and right, the full card height, radius 10 px, hidden at rest. Its top 22% holds a `--cream-200` spine label (stripe, category name in VT323, `E-180`) and a window strip showing the upper halves of two reels (inline SVG: a 6-spoke hub inside a ring).

| State | Visual | Behavior |
|---|---|---|
| Rest | Sleeve only | — |
| Hover / focus | Tape rises 22% out of the sleeve; reels spin one turn per 1.2 s; cover scales 1.03; card lifts 8 px with `--shadow-lift`; arrow rotates 45° | `spring.object`; cursor chip `PLAY` |
| Pressed | Card scales .98 | — |
| Activated | Tape ejects upward by 130% and fades | 350 ms `ease.in`, then `TransitionOverlay`, then the route |
| Centred in the mobile carousel | Same as hover | The card nearest the scroller's centre |
| Empty category | Cover replaced by a `COMING SOON` tile | Not a link; `aria-disabled` |

**Accessibility.** Role: link, named "{label}, {count} pieces". Keyboard: Tab, Enter. Reels and stripes are `aria-hidden`.

| Do | Don't |
|---|---|
| Show the cover image clean and in full colour | Tint, duotone or scanline the cover — it is the work |

### 7.10 Component: ThumbCard

**Description.** One piece of work in a row. Height comes from the row; width comes from the item's aspect ratio.

| Property | Type | Default | Description |
|---|---|---|---|
| `item` | `WorkItem` | — | |
| `href` | `string` | — | Showcase: navigates to the expanded view |
| `onSelect` | `() => void` | — | Expanded view: loads the item into the slider |
| `selected` | `boolean` | `false` | |

| State | Visual | Behavior |
|---|---|---|
| Default | Image, radius `--radius-sm`, hairline `--line` | — |
| Hover / focus | Lifts 6 px, scales 1.03, `--shadow-lift`; a caption bar slides up (title in Archivo 600, 14 px, on 70% black); views chip top-right when present | `--dur-base`; cursor chip `VIEW` |
| Selected | 2 px `--orange-500` outline and a `NOW PLAYING` chip | `aria-current="true"` |
| Loading | Blurred placeholder | — |
| Image failed | `--gray-900` tile with `NO SIGNAL` | Still selectable |

**Accessibility.** Role: link or button, named "{title}, {client}". Alt text comes from `item.alt`.

| Do | Don't |
|---|---|
| Respect each item's own aspect ratio — social pieces are not 16 : 9 | Crop everything to 16 : 9 |

### 7.11 Component: CompareSlider

**Description.** The Tracking Wipe: the raw frame and the finished piece in one frame, divided by a draggable handle. BEFORE is on the left, AFTER on the right.

| Property | Type | Default | Description |
|---|---|---|---|
| `after` | `ImageRef` | — | The finished piece |
| `before` | `ImageRef` | — | Optional. Without it the slider becomes a single image |
| `title` | `string` | — | Used in alt text and labels |
| `aspect` | `"16 / 9" \| "1 / 1" \| "4 / 5" \| "9 / 16"` | `"16 / 9"` | |
| `teach` | `boolean` | `true` | Play the intro sweep once |

Anatomy: frame radius `--radius-md`, hairline `--line`. The handle is a 2 px `--cream-200` line with a 56 px round grip holding `chevron-left` and `chevron-right`. `BEFORE` and `AFTER` are `OsdChip`s at the top-left and top-right. No effects over the images.

| State | Visual | Behavior |
|---|---|---|
| Idle | Handle at 50%, both labels visible | — |
| Teach | Handle sweeps 50 → 26 → 74 → 50 | Once, when 60% in view; 1.4 s; cancelled by any input; off with reduced motion |
| Hover | Grip scales 1.1; cursor chip `DRAG` | Fine pointer only |
| Dragging | Grip scales .94; a label fades when the handle is within 12% of it | Pointer capture; position follows 1 : 1 with no easing |
| Keyboard focus | 2 px `--focus` ring on the grip | `←` `→` 2%, with Shift 10%, Home / End to 0 / 100 |
| Swapping item | Images crossfade 200 ms; handle springs back to 50% | The new pair is preloaded first |
| After only | One image, a `FINAL ONLY` chip, no handle | Not exposed as a slider |
| Loading | Blurred placeholder and a `TRACKING…` chip | Handle disabled |
| Image failed | `--surface` panel, `NO SIGNAL`, a retry Button | — |

**Accessibility.** The real control is a visually hidden `<input type="range">`; pointer dragging is an enhancement on the frame. `aria-label="Before and after: {title}"`, `aria-valuetext="62% before, 38% after"`. Both images have alt text ("Before: …", "After: …"). `touch-action: pan-y` on the frame, so a vertical swipe that starts on the slider still scrolls the page.

| Do | Don't |
|---|---|
| Drive the position through a CSS variable, not React state, so dragging re-renders nothing | Put a full-size native range input over the frame — on touch it traps vertical scrolling |

```tsx
"use client";
import { useRef } from "react";
import Image from "next/image";
import { useMotionValue, useMotionValueEvent } from "motion/react";

export function CompareSlider({ before, after, title, aspect = "16 / 9" }: CompareSliderProps) {
  const root = useRef<HTMLElement>(null);
  const range = useRef<HTMLInputElement>(null);
  const pos = useMotionValue(50); // % of the width showing BEFORE; CSS default is --pos: 50%

  useMotionValueEvent(pos, "change", (v) => {
    root.current?.style.setProperty("--pos", `${v}%`);
    if (!range.current) return;
    range.current.value = String(Math.round(v));
    range.current.setAttribute("aria-valuetext", `${Math.round(v)}% before, ${Math.round(100 - v)}% after`);
  });

  const fromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    pos.set(Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100)));
  };

  return (
    <figure ref={root} className="compare" style={{ aspectRatio: aspect }} data-cursor="DRAG">
      <div
        className="compare__frame" /* touch-action: pan-y */
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); fromPointer(e); }}
        onPointerMove={(e) => { if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e); }}
      >
        <Image src={before.src} alt={`Before: ${title}`} fill sizes="(min-width: 1280px) 1200px, 100vw" />
        <div className="compare__after">{/* clip-path: inset(0 0 0 var(--pos)) */}
          <Image src={after.src} alt={`After: ${title}`} fill sizes="(min-width: 1280px) 1200px, 100vw" priority />
        </div>
        <span className="compare__handle" aria-hidden="true" />{/* left: var(--pos) */}
      </div>
      <input
        ref={range} className="compare__range sr-only" type="range" min={0} max={100} step={2} defaultValue={50}
        aria-label={`Before and after: ${title}`}
        onChange={(e) => pos.set(Number(e.target.value))}
      />
    </figure>
  );
}
// Focus ring: .compare:has(.compare__range:focus-visible) .compare__handle { outline: 2px solid var(--focus); }
// Teach sweep: animate(pos, [50, 26, 74, 50], { duration: 1.4, ease: "easeInOut" }); stop it on first input.
```

### 7.12 Component: Envelope

**Description.** The contact artifact. An envelope whose flap opens and whose letter — the form — slides out. It closes, gets postmarked and ejects when the message is sent.

| Property | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode` | — | The `LetterForm` |
| `defaultOpen` | `boolean` | `false` | Forced `true` with reduced motion and without JavaScript |
| `status` | `"idle" \| "sending" \| "sent" \| "error"` | `"idle"` | From the form action |

Anatomy — a 3D stack inside `perspective: 1200px`, width `clamp(300px, 46vw, 640px)`, aspect 3 : 2:
- **Back panel:** `--sand-300`.
- **Letter:** `--white` paper, black text, 88% of the envelope's width, as tall as the form needs. It rises until only its bottom 15% is still in the pocket.
- **Front pocket:** `--cream-200` with a V-shaped top edge. Carries the `<h2>` `CONTACT` in `--text-title`, a 56 px `--orange-500` stamp with a small CRT glyph, and postmark rings in `--gray-600`.
- **Flap:** a `--cream-200` triangle with a `--sand-300` underside, hinged on the top edge (`transform-origin: top`), `backface-visibility: hidden`.

The stage reserves the open height from the start — letter height plus 55% of the envelope's height — so opening causes no layout shift.

| State | Visual | Behavior |
|---|---|---|
| Closed | Flap down, an `OPEN ▲` chip | Click, Enter or Space opens it. Opens by itself once, when 60% in view |
| Opening | Flap rotates up (`rotateX` 0 → −178°), then the letter rises | 500 ms, then 600 ms, `spring.object` |
| Open | Form is interactive | Focus moves to the first field only when it was opened from the keyboard |
| Invalid | Field shows its error; the envelope shakes once (x ±6 px, 3 cycles, 320 ms) | Focus moves to the first invalid field |
| Sending | Submit Button in loading state; fields read-only | — |
| Sent | Letter slides down, flap closes, a `SENT` postmark stamps on (scale 1.6 → 1, rotate −8°), the envelope slides off to the right. A receipt stays: `MESSAGE SENT`, the current timecode, a `SEND ANOTHER` Button | Live region announces "Message sent" |
| Error | Letter stays up. Banner on the letter: "Not sent. Try again, or email [EMAIL]." with a `mailto:` link | Fields keep their values |

**Accessibility.** The toggle is a `<button aria-expanded>` that controls the letter. The form is in the DOM and in normal reading order at all times; nothing depends on the animation finishing. Errors are announced through `aria-describedby`; the send result through a polite live region.

| Do | Don't |
|---|---|
| Render the form open on the server, and let JavaScript add the closed state | Trap the form inside the small envelope on phones — below 768 px the letter becomes a full-width card |

---

## 8. Global chrome

### 8.1 Remote (nav)

- **What:** a black pill. Home icon, `ABOUT ME`, `PROJECTS`, `CONTACT`, in the order of the wireframe.
- **Desktop:** fixed, top-centre, `top: 20px`. Height 48 px, padding 6 px, background `rgb(0 0 0 / .86)`, hairline `rgb(249 249 249 / .14)`, radius pill, `z-index: var(--z-remote)`. Items in VT323 20 px caps, 36 px tall, padding `0 14px`, colour `--white`.
- **Mobile (< 768):** fixed, bottom-centre, `bottom: calc(12px + env(safe-area-inset-bottom))`. Items at least 44 px tall.
- **Active item:** an `--orange-500` pill slides behind it (`layoutId`, `spring.snap`) and its text turns black. Active state comes from an IntersectionObserver: the section covering at least half of the viewport.
- **Targets:** `/#home`, `/#bts`, `/#work`, `/#contact`. On `/work` routes they navigate back to `/` through `TapeLink`.
- **States:** hover — text `--orange-500`; focus-visible — 2 px `--orange-500` ring; active — as above.
- **A11y:** `<nav aria-label="Primary">`, `aria-current="location"` on the active link, home icon has `aria-label="Home"`. The Remote does not move during the Dive.

### 8.2 HUD

A fixed, non-interactive overlay that makes scroll feel like tape transport. `pointer-events: none`, `aria-hidden="true"`, `z-index: var(--z-hud)`, inset `clamp(12px, 2vw, 28px)`, VT323 at `--text-osd-lg`. Its colour is the `--fg` of the scene underneath, set by the same observer that sets the channel.

| Corner | Shows | Logic |
|---|---|---|
| Top-left | Transport: `PLAY ▶` · `REW ◀◀` · `PAUSE ❙❙` · `STOP ■` | Scrolling down · scrolling up · no scroll for 1.2 s · within 2 px of the page end |
| Top-right | Channel: `CH 01 HOME` · `CH 02 BTS` · `CH 03 WORK` · `CH 04 CONTACT`; on `/work/[category]`: `CH 03 GAMING` | Active section. Changes with one 180 ms glitch |
| Bottom-left | `SP` | Static |
| Bottom-right | Timecode `MM:SS:FF` at 25 fps over a 02:30:00 tape | `frames = round(progress × 3750)`; written straight to the DOM node from `useMotionValueEvent` — no React state |

Below 768 px: only the channel (top-left) and the timecode (top-right), at `--text-osd`, under the safe-area inset.

### 8.3 TapeLink and TransitionOverlay

`TapeLink` is `next/link` plus a route transition. It falls back to plain navigation when the click has a modifier key, is not a left click, targets a new tab, or reduced motion is on. Browser back and forward never play the overlay.

| Step | What | Duration |
|---|---|---|
| 1 | Two black bars close from the top and the bottom to the centre line | 260 ms, `ease.in` |
| 2 | Bars hold. A strip of static at 50% opacity and an OSD line such as `CH 03 ▸ GAMING` | 140 ms |
| 3 | The route changes underneath; wait for the new page's first paint, 400 ms at most | — |
| 4 | Bars open | 320 ms, `ease.out` |

### 8.4 CursorChip

Fine pointers only. Elements opt in with `data-cursor="DRAG" | "PLAY" | "OPEN" | "VIEW"`. A `signal` OsdChip scales from 0 to 1 and follows the pointer at +16 / +16 px on `spring.snap`. The native cursor stays visible. Not rendered on touch.

### 8.5 Footer

Night scene, closing the contact section. `END OF TAPE` in `--text-section`, transparent fill with `-webkit-text-stroke: 1.5px var(--white)`. A `■ STOP` chip. A `ghost` Button `◀◀ REWIND` that scrolls to the top (the HUD shows `REW ◀◀` on the way up). Socials as text links. `© {year} Swarnava Chakraborty`.

---

## 9. Handoff specs

### 9.1 Handoff Spec: Hero — `/#home`, CH 01

#### Overview
The first screen. It says who this is in one image: the name as a giant wordmark **behind** the subject, the subject on live TVs. It ends by diving into the lower TV, which becomes the next section.

#### Layout
Two compositions. `cinema`: viewport at least 1024 px wide, or landscape with height up to 520 px. `portrait`: everything else.

```text
section#home[data-scene="cream"]   cinema with the Dive: height 240svh · otherwise: auto
└ .hero__sticky                    position: sticky; top: 0; height: 100svh; overflow: clip; display: grid; place-items: center
  └ .stage                         position: relative; container-type: inline-size
    ├ .plate                       position: absolute; aspect-ratio: 1672 / 941 — the coordinate space for the art
    │  ├ scene image               z 1
    │  ├ CrtScreen × 4             z 3
    │  ├ DiscoGlints               z 4
    │  └ cutout image              z 5
    ├ wordmark                     z 2
    ├ ghost outline (≥ 768 px)     z 6
    └ name block                   z 7
```

`.plate` must never get `transform`, `opacity`, `filter`, `will-change` or `z-index`. Any of them turns it into a stacking context, and the wordmark can then no longer sit between the scene and the subject.

| | `cinema` | `portrait` |
|---|---|---|
| Stage | `width: min(100vw, calc(100svh * 1.6265))`; `aspect-ratio: 1672 / 1028` | `width: 100vw`; `height: calc(4vw + var(--plate-h))`; `--plate-h: min(60svh, 122vw)`; `overflow: clip` |
| Plate | `left: 0; bottom: 0; width: 100%` — leaves about 8.5% of the stage height as headroom for the wordmark | `bottom: 0; left: 50%; height: var(--plate-h); margin-left: calc(var(--plate-h) * 1672 / 941 * -0.493)` — puts the subject's centre on the viewport's centre; the side props crop, both shoes stay in frame |
| Wordmark | Centred, one line, `font-size ≈ 29cqw` so the ink spans 88–90% of the stage. Cap-top ≈ 14.6% from the stage top, level with the top of the hair; baseline ≈ 47%, just above the hands. Match `ref-hero.jpg` | `top: 0`, one line, `font-size: min(30cqw, 34svh)`. The plate starts 4vw below the cap-top, so the hair overlaps the lower third of the letters |
| Name block | `left: 6.2%`, `top ≈ 50.5%` of the stage — on the wall, left of the subject, clear of the left TV's antennae | Under the stage, centred, `margin-top: var(--space-4)` |
| Ghost outline | On | On from 768 px, off below |

- **Scene image** fills the plate. Feather it into the ground: fade in over the top 9% and over the outer 5% on the left and right (`mask-image` with two gradients, `mask-composite: intersect`, plus the `-webkit-` equivalents).
- **Subject image** fills the plate exactly like the scene.
- **Ghost outline:** a second copy of the wordmark with a transparent fill and `-webkit-text-stroke: 1px rgb(249 249 249 / .4)`, in a full-stage box masked by the subject's alpha (`mask-image: url(/hero/cutout-mask.webp)`, `mask-size: 100% auto`, `mask-position: left bottom`, `mask-repeat: no-repeat`). The letters hidden behind the subject trace faintly across the jacket and nowhere else.
- **Name block:** `<h1>` `SWARNAVA CHAKRABORTY` in OSD large, black. Under it the role line in `--text-small`, `--fg-muted`. This is the page's real heading; the giant wordmark is `aria-hidden`.
- **`scene.png` contains the subject.** The scene and the cutout must never move, scale or fade relative to each other, or a double image appears. Parallax moves the wordmark and the glints only. When `scene-clean.png` exists, the subject may get its own depth.

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| `--bg` (cream) | `#EFD5BC` | Section ground — must equal the art's wall so the picture's edge disappears |
| `--fg-display` | `#E85002` | Wordmark. `ref-hero.jpg` shows `#FE0000`; use the token |
| `--fg`, `--fg-muted` | `#000000`, `#333333` | Name line, role line |
| `--font-display` | Bebas Neue, ≈ 29cqw | Wordmark |
| `--font-osd`, `--text-osd-lg` | VT323 | Name line, everything on the TV screens |
| `spring.soft`, `cycle`, `stagger.letters` | §6.4 | Parallax, cyclers, wordmark entrance |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `CrtScreen` `top` | `cover`, `as="a"` | `rect=SCREENS.top`, `label="See the work"` | OSD: `PLAY ▶` top-left, `SP` bottom-left, the live timecode bottom-right (the HUD's value). Centre: the **niche cycler** — `CONTENT → GAMING → PODCAST → CRYPTO → SOCIAL`, VT323, white, RGB split, `font-size ≈ 3.5cqw`; all five words must fit within 84% of the screen's width. Links to `/work` on `CONTENT`, otherwise to `/work/<category>` |
| `CrtScreen` `bottom` | `cover`, `as="button"` | `rect=SCREENS.bottom`, `label="Scroll to about"` | Static, with the **pillar cycler** over it — `AI → DESIGN → CREATIVITY → SCROLL ▼` — half a beat out of phase with the top TV. Smooth-scrolls to BTS, which plays the Dive. The Dive's target |
| `CrtScreen` `left`, `right` | `ambient` | `rect` | The baked picture with scanlines and scan bar |
| `DiscoGlints` | — | `origin=DISCO` | 8 soft dots (4 on `portrait`) on arms rotating around the disco ball, `mix-blend-mode: soft-light`, clipped to the plate |

The cutout sits above the screens, so the subject's hands overlap the top TV's upper edge exactly as in the art.

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Page | First load in a session | Power-on: a black overlay, a white line grows from the centre, the two black halves retract. The images are in the DOM underneath from the first paint — never hide them with `opacity: 0` |
| Wordmark | After power-on | Letters rise out of a clipped line, staggered |
| Top TV | Idle | Niche cycler: a word every 2.4 s with a 180 ms glitch between words |
| Top TV | Hover / focus | Cycle pauses, `▶ OPEN` chip, cursor chip `OPEN` |
| Bottom TV | Idle | Pillar cycler over static |
| Bottom TV | Hover / focus | Static brightens 10%, cursor chip `PLAY` |
| Hero | Pointer moves (fine pointer) | Wordmark shifts against the pointer by up to 10 px / 6 px; glints shift with it by up to 16 px |
| Hero | Scroll | The Dive |
| Hero | Offscreen or tab hidden | Every loop pauses |

#### The Dive
On only when all of these hold: `cinema` composition, `(pointer: fine)`, viewport height at least 600 px, no reduced-motion preference. Otherwise the section is `height: auto`, nothing pins, and BTS simply follows.

`p` is the scroll progress of `section#home` with offset `["start start", "end end"]`, lightly smoothed. `t = clamp((p − 0.12) / 0.73, 0, 1)` and `e = easeInOutCubic(t)`.

| `p` | What happens |
|---|---|
| 0 – 0.12 | Rest. Only the timecode moves. |
| 0.12 – 0.85 | The stage scales toward the lower TV's screen: `scale = S ** e`, `transform-origin` at the screen's centre, `translate = (viewport centre − screen centre) × e`, with `S = 1.12 × max(vw / screenWidth, vh / screenHeight)`. The Remote and the HUD stay put. |
| 0.45 – 0.85 | On the lower screen the cycler hides and the static fades to flat `--orange-500`. |
| 0.85 | The HUD flips to `CH 02 BTS` with one glitch. |
| 0.85 – 1 | Hold: the viewport is entirely flat `--orange-500`. At 1 the sticky releases, and BTS — the same colour along its top edge — scrolls in with no seam. |

```ts
// hero/useDive.ts
const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
const p = useSpring(scrollYProgress, { stiffness: 180, damping: 32, restDelta: 0.0005 });
const e = useTransform(p, (v) => easeInOutCubic(clamp01((v - 0.12) / 0.73)));
// geo is recomputed by a ResizeObserver from offsetLeft / offsetTop / offsetWidth / offsetHeight.
// Use layout values — getBoundingClientRect would include the live transform.
//   cx, cy: the lower screen's centre in viewport px at rest
//   ox, oy: the same point inside the stage
//   S: 1.12 * Math.max(innerWidth / screenW, innerHeight / screenH)
const scale = useTransform(e, (t) => Math.pow(geo.current.S, t));
const x = useTransform(e, (t) => (window.innerWidth / 2 - geo.current.cx) * t);
const y = useTransform(e, (t) => (window.innerHeight / 2 - geo.current.cy) * t);
// <motion.div className="stage" style={{ x, y, scale, transformOrigin: `${ox}px ${oy}px` }} />
```

The art goes soft past about 2× scale. That is expected: the zoom is fast and the screen itself is DOM, so it stays sharp. Do not swap in larger images mid-zoom. Set `will-change: transform` on the stage only while `0 < p < 1`. Put the power-on scale on a wrapper around the stage, never on the stage itself.

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 1024 px, fine pointer, height ≥ 600 px | `cinema`, Dive on, parallax on |
| ≥ 1024 px, touch or short | `cinema`, no Dive, no parallax. One channel-change burst (static at 10% opacity, 120 ms) when BTS reaches 60% of the viewport |
| < 1024 px | `portrait`; 4 glints; ghost outline from 768 px |
| Landscape, height ≤ 520 px | `cinema` scaled to the height, no Dive |

#### Edge Cases
- **No JavaScript, or before hydration:** the full composite renders from the server. The top TV shows `CONTENT`, the lower one `SCROLL ▼`.
- **Font not loaded yet:** the stage's aspect ratio reserves the space; the fallback stack is condensed; no layout shift.
- **Ultra-wide or short viewport:** the stage is limited by height, cream fills the sides, and the feathered edges hide the picture's rectangle.
- **Image fails:** the cream ground, wordmark and name block still read. No broken-image icon.
- **Resize or rotation mid-Dive:** geometry recomputes; transforms derive only from progress.
- **Reload part-way down:** the same — there is no state to restore.
- **Long role line:** wraps to two lines at 28ch; a third line is truncated.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Power-on overlay | First load per session | White line grows from the centre, black halves retract up and down | 160 ms + 420 ms | `ease.out` |
| Stage wrapper | After power-on | `scale 1.04 → 1` | 900 ms | `ease.out` |
| Wordmark letters | After power-on | Each rises from a clipped line, `y: 100% → 0`, 40 ms stagger | 600 ms | `ease.out` |
| Name line | 300 ms after the wordmark | Types on, one character every 28 ms | ≈ 560 ms | `steps` |
| Top TV word | Every 2400 ms | Glitch out / in, 3 frames | 180 ms | `steps(3)` |
| Bottom TV word | Every 2400 ms, offset 1200 ms | Static burst between words | 180 ms | `steps(3)` |
| Scan bar, all four TVs | Loop | A lighter band travels top to bottom | 6 s | linear |
| Disco glints | Loop | Arms rotate around the ball; each dot's opacity 0 → .5 → 0 | 30–50 s per turn | linear |
| Wordmark parallax | Pointer move | Up to 10 px x / 6 px y, against the pointer | — | `spring.soft` |
| The Dive | Scroll | See above | scroll-linked | `easeInOutCubic` on progress |

#### Accessibility Notes
- The `<h1>` is the name block. The wordmark, the ghost outline, the cycling words and all OSD are `aria-hidden`.
- The top TV link and the bottom TV button have stable `aria-label`s and a 2 px `--focus` ring that follows the screen's radius.
- Scene image `alt=""`; cutout `alt="Swarnava sitting on a stack of retro TVs in a studio"`.
- Focus order: skip link → Remote → top TV → bottom TV → BTS.
- Power-on, glitches and static stay within the limits of §6.4.

---

### 9.2 Handoff Spec: BTS — `/#bts`, CH 02

#### Overview
About the person. A huge white `BTS.`, a short about text, and a field monitor on the right with a stack of behind-the-scenes Polaroids the visitor can flick through. It is the world inside the TV the Dive just entered.

#### Layout
- `section#bts[data-scene="signal"]`, `min-height: 100svh`, padding `var(--section-y) 0 calc(var(--section-y) + 74px)` (the extra clears the film strip), `overflow-x: clip`.
- A faint vertical stripe texture over the ground — `repeating-linear-gradient(90deg, rgb(0 0 0 / .035) 0 1px, transparent 1px 7.5vw)` — masked to fade in over the top 20%.
- **≥ 1024 px:**
  - `BTS.` — columns 1–6, at the top, `--text-mega`, `--fg-display` (white), `line-height: .8`. The full stop is part of the word.
  - About block — columns 1–5, `var(--space-8)` under the word: about paragraphs in `--text-lead`, black, max 46ch; then three `ink` OsdChips — `DESIGN`, `ARTIFICIAL INTELLIGENCE`, `CREATIVITY`, the three book spines from the hero art; then a `ghost` Button `SEE THE WORK ↘` to `#work`.
  - Monitor — `position: absolute; left: 48%; top: 50%; width: 62vw; aspect-ratio: 4 / 3`, vertically centred, resting at −2°, bleeding about 10vw off the right edge as in `ref-bts.jpg`.
- **< 1024 px:** one column — word, about block, then the Monitor at `width: 100%`, no rotation, no bleed, `margin-top: var(--space-12)`.
- Inside the Monitor: `PolaroidStack` centred, card width 44% of the screen (52% below 768 px).

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| `--bg` (signal) | `#E85002` plus two glows | Ground. Flat along the top edge |
| `--fg-display` | `#F9F9F9` | `BTS.` only — 3.6 : 1, large text |
| `--fg` | `#000000` | All paragraph text — 5.6 : 1 |
| `--cream-100` | `#FFE2C4` | Monitor screen |
| `--text-mega`, `--text-lead` | §6.2 | Word, about copy |
| `--shadow-prop`, `--radius-lg` | §6.3 | Monitor, Polaroids |
| `spring.object`, `stagger.items` | §6.4 | Monitor, Polaroids, line reveals |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `Monitor` | — | `rec`, `label="BTS"`, `counter` | Counter mirrors the stack, e.g. `03/08` |
| `PolaroidStack` | — | `photos`, `onChange` | §7.6 |
| `OsdChip` × 3 | `ink` | — | The pillars |
| `Button` | `ghost`, `md` | `href="#work"` | |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Monitor | Section scrolling in | Slides in from the right and settles — scroll-linked, not pinned |
| Polaroid | Drag, tap, keys | §7.6 |
| Counter | Photo changes | Updates with a 90 ms glitch |
| REC dot | Always | Blinks |
| About lines | First time in view | Reveal line by line, once |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 1024 px | Two zones, Monitor bleeds right, −2° |
| 768–1023 px | One column, Monitor full width |
| < 768 px | The same, with Polaroids at 52% of the screen width and prev / next buttons always visible |

#### Edge Cases
- **About copy missing:** placeholders show in brackets; the layout holds for 1 to 3 paragraphs.
- **Very long about copy (over 120 words):** the left column grows; the Monitor stays centred on the section, never on the text.
- **One photo / no photos:** §7.6.
- **Portrait and landscape photos mixed:** every photo is cropped to 4 : 5 with `object-fit: cover`.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| `BTS.` letters | Section top reaches 75% of the viewport | Each rises from a clipped line, 60 ms stagger | 600 ms | `ease.out` |
| Monitor | Scroll, section progress 0 → 0.45 | `x: 28vw → 0`, `rotate: 6° → −2°` | scroll-linked | linear map, `spring.soft` smoothing |
| About lines | In view, once | Clip reveal with `y: 12px → 0`, 70 ms stagger | 500 ms | `ease.out` |
| Pillar chips | After the lines | `scale .9 → 1` with opacity, 60 ms stagger | 320 ms | `spring.snap` |
| Polaroid throw | Release past the threshold | Flies along the throw vector, rotates up to 18°, re-enters at the back | — | `spring.object` |
| REC dot | Loop | Opacity 1 / 0 | 1 s | `steps(1)` |

#### Accessibility Notes
- `<h2>` reads "BTS" visually; its accessible name is "Behind the scenes — about" (`aria-label`).
- Reading order: heading, about text, pillars, button, then the photo carousel.
- No paragraph text in white on this scene, and no text over the red glow.

---

### 9.3 Handoff Spec: Worked with — film strip

#### Overview
Social proof as an object: a strip of film carrying the creators and brands Swarnava has worked with, running across the seam between the orange and the black.

#### Layout
- Its own `<section data-scene="night">` with zero height contribution: the `FilmStrip` is positioned with negative vertical margins so it is centred on the BTS / Projects boundary, above both (`z-index: 2`).
- Rotated −3°, `108vw` wide. `overflow-x: clip` on the page wrapper so it never causes a horizontal scrollbar.
- The leader tab holds the `<h2>` `WORKED WITH`.
- One pause / play `icon` Button at the strip's right end, upright (not rotated).

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| `--black`, `--cream-200` | | Band, leader tab, avatar ring |
| `--white`, `--gray-400`, `--gray-600` | | Name, meta, edge codes |
| `--orange-500` | | Hover ring |
| `--text-label`, `--text-osd` | §6.2 | Tab, meta |
| `marquee` | 40 px/s, boost up to +150% | Drift |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `FilmStrip` | — | `items`, `label`, `angle={-3}` | §7.8 |
| `Button` | `icon` | `aria-label="Pause the film strip"` | Toggles to play |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Strip | Page scrolling | Speeds up with scroll velocity, in the same direction regardless of scroll direction |
| Strip | Hover, focus-within, paused | Stops |
| Strip | Drag | Scrubs; cursor chip `DRAG` |
| Item | Hover / focus | §7.8 |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 768 px | Height up to 148 px, avatars 72 px |
| < 768 px | Height 112 px, avatars 56 px, angle −4° so the tilt still reads on a narrow screen |

#### Edge Cases
- **Fewer than 4 clients:** static, centred, no duplication.
- **No clients:** the strip and its heading are not rendered; the sections meet directly.
- **Missing avatar:** initials on `--gray-900`.
- **Long name:** truncated at 22 characters; full name in the accessible name.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Strip | In view | Slides in from the right by 12vw while fading | 600 ms | `ease.out` |
| Track | Loop | Drift left at 40 px/s × (1 + boost) | — | linear |
| Item | Hover / focus | Avatar `scale 1 → 1.08`, ring colour | 180 ms | `ease.out` |

#### Accessibility Notes
- The pause control is the first focusable thing in the section.
- Duplicated items are `aria-hidden` and `inert`.
- Edge codes and perforations are decorative.

---

### 9.4 Handoff Spec: Projects — `/#work`, CH 03, the shelf

#### Overview
The four niches as four VHS tapes on a shelf. Picking one loads that category.

#### Layout
- `section#work[data-scene="night"]`, padding `calc(var(--section-y) + 74px) 0 var(--section-y)`.
- Heading row: an OSD caption `CH 03 — PICK A TAPE` (left) and an `OsdChip` `04 TAPES` (right) above `<h2>` `PROJECTS` in `--text-section`, `--fg-display`.
- Shelf: `Cassette` × 4 — Gaming, Podcast, Crypto, Social Media, in that order.
  - ≥ 1280 px: 4 columns, 24 px gap.
  - 768–1279 px: 2 × 2.
  - < 768 px: a horizontal scroll-snap carousel — cards `72vw` wide, 16 px gap, `scroll-snap-type: x mandatory`, edge padding `--gutter` — with four pagination dots underneath (active dot `--orange-500`).
- Under the shelf: a `ghost` `lg` Button `VIEW ALL TAPES ↗` to `/work`.

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| `--bg`, `--surface`, `--line` (night) | `#000000`, `#333333`, 14% white | Ground, sleeves, hairlines |
| `--fg-display`, `--fg-muted` | `#F9F9F9`, `#A7A7A7` | Heading, captions |
| `--stripe-*`, `--orange-500`, `--cream-200` | §6.1 | Label stripes — gaming orange, podcast mustard, crypto blue, social pink |
| `--text-section`, `--text-title` | §6.2 | Heading, tape titles |
| `spring.object`, `stagger.items` | §6.4 | Tape rise, entrance |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `Cassette` × 4 | — | `category`, `index`, `href` | §7.9 |
| `Button` | `ghost`, `lg` | `href="/work"` | |
| `OsdChip` | `paper` | — | Count of categories that have items |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Cassette | Hover / focus | Tape rises, reels spin |
| Cassette | Click / Enter | Tape ejects, `TransitionOverlay`, then `/work/<category>` |
| Carousel (mobile) | Swipe | The centred card takes the hover state; dots follow |
| Dots | Tap | Scroll to that card |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 1280 px | 4-up |
| 768–1279 px | 2 × 2 |
| < 768 px | Snap carousel with dots; tapes rest 12% out of their sleeves, since there is no hover |

#### Edge Cases
- **A category with no items:** `COMING SOON`, not a link; the count chip excludes it.
- **Missing cover:** the sleeve shows a `--gray-900` tile with the category name in `--text-label`.
- **Long category label (Social Media):** allowed to wrap to two lines; all four titles align to the same baseline grid.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| `PROJECTS` letters | In view | Rise from a clipped line, 40 ms stagger | 600 ms | `ease.out` |
| Cassettes | In view | `y: 40px → 0` with opacity, 70 ms stagger | 600 ms | `ease.out` |
| Tape | Hover / focus | `y: 0 → −22%` | — | `spring.object` |
| Reels | While hovered | Rotate, one turn per 1.2 s | loop | linear |
| Tape | Activate | `y → −130%` and fade | 350 ms | `ease.in` |

#### Accessibility Notes
- The shelf is a `<ul>`; each cassette a single link.
- The mobile carousel is a scrollable region with `aria-label="Project categories"`; the dots are buttons labelled by category.
- Focusing a cassette shows everything hover shows.

---

### 9.5 Handoff Spec: Showcase — `/work`

#### Overview
Everything, by category. Four bands; in each, two rows of work drift in opposite directions.

#### Layout
- `data-scene="night"` for the whole page.
- Header: `<h1>` `ALL TAPES` in `--text-section`; an OSD caption with the total count on the right.
- Chip row: `ALL · GAMING · PODCAST · CRYPTO · SOCIAL MEDIA` — anchor links, sticky at `top: 84px` (under the Remote), the active chip follows scroll.
- Four `CategoryBand`s, `id` = category id, `scroll-margin-top: 140px`, 96–128 px apart. Each band:
  - Header row: `<h2>` title in `--text-title`; a hairline that fills the space to the right (the dash in the wireframe); a count chip; a `ghost` Button `OPEN ↗` to `/work/<category>`.
  - Row A drifts left, row B drifts right, 16 px apart. Row height `clamp(132px, 15vw, 216px)`. Items alternate between rows: A takes items 0, 2, 4…; B takes 1, 3, 5….
- One pause / play Button per page, in the header.
- Then `Contact` and `Footer`.

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| night scene tokens | §6.1 | Whole page |
| `--text-section`, `--text-title`, `--text-osd` | §6.2 | Headings, chips |
| `--radius-sm`, `--shadow-lift` | §6.3 | Thumbs |
| `marquee` | §6.4 | Rows |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `MarqueeRow` × 2 per band | — | `direction={-1}` and `direction={1}` | §7.7 |
| `ThumbCard` | — | `item`, `href="/work/<category>?t=<slug>"` | §7.10 |
| `OsdChip` | `paper` / `signal` | — | Anchor chips; active one is `signal` |
| `Button` | `ghost`, `icon` | — | `OPEN`, pause |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Rows | Scroll | Speed up with scroll velocity |
| Rows | Hover, focus, drag | Pause; drag scrubs |
| Thumb | Click | `TapeLink` to the expanded view with that item selected |
| Chip | Click | Smooth-scrolls to the band |
| Arriving from a cassette or with a hash | Load | Scrolls to that band |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 1024 px | As specified |
| < 1024 px | Chip row scrolls horizontally; row height 132–160 px |
| < 480 px | Band header stacks: title, then count and `OPEN` on one line |

#### Edge Cases
- **Fewer than 8 items:** a row that does not overflow the container goes static and left-aligned.
- **4 items or fewer:** a single row.
- **No items:** the band and its chip are hidden.
- **Mixed aspect ratios:** rows keep one height; widths vary.
- **Slow connection:** thumbs load lazily with blurred placeholders; rows start drifting only after the first copy has laid out.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Band title | In view | Rises from a clipped line | 600 ms | `ease.out` |
| Hairline | In view | `scaleX: 0 → 1` from the left | 900 ms | `ease.out` |
| Rows | Loop | Drift ±40 px/s × (1 + boost) | — | linear |
| Thumb | Hover / focus | Lift, scale, caption bar | 320 ms | `ease.out` |

#### Accessibility Notes
- One `<h1>`, four `<h2>`s.
- The chip row is a `<nav aria-label="Categories">` with `aria-current` on the active chip.
- With reduced motion, rows are static and scroll horizontally.

---

### 9.6 Handoff Spec: Expanded view — `/work/[category]`

#### Overview
One category in depth. The before/after slider is the proof of the craft; the rows under it change what it shows.

#### Layout
- `data-scene="night"`. `generateStaticParams` from the categories; an unknown id calls `notFound()`.
- Header: a `ghost` Button `◀ ALL TAPES` to `/work`; `<h1>` with the category label and the wireframe's dash (`GAMING —`) in `--text-title`; on the right, `icon` Buttons for the previous and next category.
- `CompareSlider`, centred: `width: min(100%, 1200px, calc(78svh * aspect))`.
- Meta row under it: the title in Archivo 600, 20 px; a client chip; a views chip and a `WATCH ↗` link when the data exists; on the right, a counter `01 / 24` with previous / next item Buttons.
- `MORE FROM THIS TAPE` caption, then two `MarqueeRow`s in opposite directions with every item of the category. The selected one shows `NOW PLAYING`.
- Then `Contact` and `Footer`.
- The selected item is in the URL: `?t=<slug>`. Selecting another calls `router.replace` with `scroll: false`. An unknown slug falls back to the first item.

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| night scene tokens | §6.1 | Whole page |
| `--cream-200` | `#EFD5BC` | Slider handle |
| `--orange-500` | `#E85002` | Selected outline, `NOW PLAYING` |
| `--radius-md` | 16 px | Slider frame |
| `spring.snap`, `spring.object` | §6.4 | Handle, teach sweep |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `CompareSlider` | — | `before`, `after`, `title`, `aspect` | §7.11 |
| `MarqueeRow` × 2 | — | opposite directions | |
| `ThumbCard` | — | `onSelect`, `selected` | Buttons here, not links |
| `Button` | `ghost`, `icon` | — | Back, category and item navigation |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Slider | All | §7.11 |
| Thumb | Click | Loads the pair into the slider; scrolls the slider into view if it is off-screen |
| Prev / next item | Click | Same as selecting that thumb |
| Prev / next category | Click | `TapeLink` to that category |
| Page | Load with `?t=` | That item is selected and its pair gets `priority` |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 1024 px | As specified |
| < 1024 px | Slider full width inside the gutters; meta row wraps to two lines |
| Any, with a 9 : 16 item | Slider height capped at 78svh and centred |

#### Edge Cases
- **No `before` image:** after-only state.
- **`before` and `after` differ in aspect:** both `object-fit: cover` to the item's `aspect`.
- **A single item:** no rows, no counter, no item navigation.
- **Image error:** §7.11.
- **Very long title:** two lines, then ellipsis.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Slider | Enters after the route transition | `y: 24px → 0` with opacity | 600 ms | `ease.out` |
| Handle | First time 60% in view | Teach sweep 50 → 26 → 74 → 50 | 1.4 s | ease-in-out |
| Images | Item change | Crossfade | 200 ms | linear |
| Handle | Item change | Back to 50% | — | `spring.snap` |
| `NOW PLAYING` chip | Item change | Glitch once | 180 ms | `steps(3)` |

#### Accessibility Notes
- After an item change, a polite live region announces "Now showing {title}".
- The slider's range input comes before the rows in tab order.
- Arrow keys act on the slider only while it has focus.

---

### 9.7 Handoff Spec: Contact — `/#contact`, CH 04

#### Overview
The ask. An envelope opens, the letter is the form, and sending it mails the tape back.

#### Layout
- `section#contact[data-scene="night"]`, padding `var(--section-y) 0`, one centred column, max-width 720 px.
- Order: an OSD caption `CH 04 — LEAVE A MESSAGE`; the contact line in `--text-lead`, `--fg-muted`; the `Envelope` stage; a row of direct links (email, socials) in Archivo 500.
- The stage reserves the open height (§7.12).
- Below 768 px the letter is a full-width card above a shorter pocket graphic (40% of its desktop height).
- The component is shared: it also closes `/work` and `/work/[category]`.

Form, top to bottom:

| Field | Type | Rules | Error copy |
|---|---|---|---|
| Name | `text` | required, 2–80 characters | "Add your name." |
| Email | `email` | required, valid email | "That email doesn't look right." |
| What do you need? | `chips` | Gaming · Podcast · Crypto · Social media · Something else (default) | — |
| Message | `textarea` | required, 20–2000 characters | "Tell me a bit more — at least 20 characters." |
| `company` | hidden honeypot | must stay empty | silently dropped |
| Submit | `signal` `lg` Button | label `SEND ▶` | — |

The action returns `{ ok: true }` or `{ ok: false, fieldErrors?, formError? }`.

#### Design Tokens Used
| Token | Value | Usage |
|---|---|---|
| `--cream-200`, `--sand-300` | | Envelope front and flap; back panel and flap underside |
| `--white`, `--black` | | Letter paper, form text |
| `--red-600` | `#C10801` | Errors — 6.0 : 1 on the letter |
| `--orange-500` | | Stamp, focus rule, submit |
| `--text-title` | §6.2 | `CONTACT` on the envelope |
| `spring.object`, `dur.slow` | §6.4 | Flap, letter |

#### Components
| Component | Variant | Props | Notes |
|---|---|---|---|
| `Envelope` | — | `status` | §7.12 |
| `Field` × 4 | `text`, `email`, `chips`, `textarea` | — | §7.3 |
| `Button` | `signal`, `lg` | `loading` | Full width below 768 px |
| `OsdChip` | `signal` | — | `OPEN ▲`, `SENT` |

#### States and Interactions
| Element | State | Behavior |
|---|---|---|
| Envelope | Closed → open → sending → sent / error | §7.12 |
| Form | Submit with errors | First invalid field focused; one shake |
| Form | Server or network error | Banner on the letter; values kept |
| Form | No email backend configured | Submit opens the visitor's mail app through a `mailto:` built from the fields, then shows the sent state |
| Receipt | `SEND ANOTHER` | Resets to open with empty fields |

#### Responsive Behavior
| Breakpoint | Changes |
|---|---|
| ≥ 768 px | Envelope `clamp(300px, 46vw, 640px)` wide; the letter rises out of it |
| < 768 px | The letter is a full-width card; the flap opens behind it; submit is full width |

#### Edge Cases
- **JavaScript off:** the form is open and posts to the action; the result renders on the server.
- **Double submit:** ignored while sending.
- **Rate limited:** "Too many messages. Try again in a minute, or email [EMAIL]."
- **Pasted long message:** counter appears from 1800 characters; input stops at 2000.
- **Autofill:** styled to keep the ruled-line look (no yellow box).

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Envelope | In view | `y: 40px → 0` with opacity | 600 ms | `ease.out` |
| Flap | Open | `rotateX: 0 → −178°`; its z-order swaps at 90° | 500 ms | `spring.object` |
| Letter | After the flap | Rises until 15% remains in the pocket | 600 ms | `spring.object` |
| Fields | After the letter | Fade up, 70 ms stagger | 320 ms | `ease.out` |
| Envelope | Invalid submit | `x: ±6px`, 3 cycles | 320 ms | linear |
| Postmark | Sent | `scale 1.6 → 1`, `rotate 0 → −8°` | 180 ms | `spring.snap` |
| Envelope | Sent, after the postmark | Slides off to the right | 600 ms | `ease.in` |
| Receipt | After the envelope leaves | Fades in | 320 ms | `ease.out` |

#### Accessibility Notes
- `<h2>` is the `CONTACT` on the envelope front.
- The toggle is a real button with `aria-expanded`; the form never leaves the DOM.
- Every field has a visible label; errors are linked and announced; the send result is announced.
- Targets are at least 44 px; input text is 16 px.

---

### 9.8 Handoff Spec: Not found and loading

#### Overview
`NO SIGNAL` — the 404 — and the route loading state.

#### Layout
- **404:** night scene, full viewport. A band of seven vertical colour bars built from the palette — `--cream-200`, `--stripe-mustard`, `--stripe-blue`, `--stripe-pink`, `--orange-500`, `--red-600`, `--gray-900` — across the top 60%, static at 20% opacity over everything, `<h1>` `NO SIGNAL` in `--text-section`, an OSD caption `CH -- NOT FOUND`, and a `solid` Button `◀ BACK TO CH 01`.
- **`loading.tsx`:** night ground with a centred `TRACKING…` OsdChip. No spinner, no percentage.

#### Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Static | Loop | `steps(6)` | 0.5 s | steps |
| `NO SIGNAL` | Load | Glitch once | 180 ms | `steps(3)` |
| `TRACKING…` | Loop | The ellipsis steps through 1, 2, 3 dots | 900 ms | `steps(3)` |

#### Accessibility Notes
- The 404 has a real `<h1>` and one obvious way back. Bars and static are decorative.

---

## 10. Responsive — global rules

| Range | Changes |
|---|---|
| < 480 px | Gutter 16 px. Remote at the bottom. HUD shows channel and timecode only. Portrait hero. Shelf carousel. Letter as a sheet. |
| 480–767 px | The same, gutter from `4vw`. |
| 768–1023 px | Portrait hero with the ghost outline. BTS in one column. Shelf 2 × 2. Envelope with the rising letter. Remote at the top. |
| 1024–1279 px | Cinema hero. Dive on fine pointers. BTS in two zones. Shelf 2 × 2. |
| ≥ 1280 px | Full spec. Shelf 4-up. Content capped at `--content-max`. |
| ≥ 1920 px | The stage is limited by height; type clamps reach their maximum. |

- Decide by capability, not by width alone: hover effects behind `(hover: hover)`, parallax, cursor chip and the Dive behind `(pointer: fine)`.
- Use `svh` for anything tied to the viewport's height. Never `vh` on iOS, never `background-attachment: fixed`.
- No horizontal scrollbar at any width. The film strip and the Monitor are clipped by `overflow-x: clip` on their sections, never by `overflow: hidden` on `html` or `body`.
- Touch targets are 44 × 44 px or larger.
- Respect `env(safe-area-inset-*)` for the Remote and the HUD.

---

## 11. Accessibility — global rules

- Target WCAG 2.2 AA.
- Landmarks: `header` (Remote), `main`, `footer`. A skip link to `#main` is the first focusable element.
- One `<h1>` per route; sections use `<h2>`. The giant display words are either the real heading or `aria-hidden` duplicates — never both read aloud.
- Every artifact has a keyboard path: TVs (link, button), Polaroids (buttons, arrows), film strip and rows (pause control, focusable items), cassettes (links), slider (range input), envelope (button, native form).
- Focus is always visible: a 2 px `--focus` ring with a 3 px offset. Never remove outlines.
- Contrast follows the table in §6.1.
- Anything that moves for more than 5 seconds can be paused (WCAG 2.2.2). Nothing flashes more than three times a second (2.3.1).
- The HUD, the cycler text, perforations, edge codes, reels, stripes, scanlines and static are `aria-hidden`.
- Images of work have real alt text from the content file; decorative images use `alt=""`.

**With `prefers-reduced-motion: reduce`:**

| Feature | Becomes |
|---|---|
| Power-on | Off |
| TV cyclers | Static: `CONTENT` on the top TV, `SCROLL ▼` on the lower one |
| Parallax, glints | Off; glints are still |
| The Dive | Off — the hero is one screen and BTS follows |
| Channel glitch, static bursts | Off; labels swap instantly |
| Film strip, work rows | Static, horizontally scrollable |
| Polaroid stack | Buttons or tap swap photos with a 150 ms crossfade |
| Cassette | No rise, no spin; outline and arrow change only |
| Route transition | A 150 ms fade |
| Slider teach sweep | Off |
| Envelope | Starts open; sending crossfades to the receipt |

---

## 12. Performance — hard limits

| Metric | Limit |
|---|---|
| LCP on `/`, Lighthouse mobile | ≤ 2.5 s. The LCP element is the scene image |
| CLS | ≤ 0.05 |
| INP | ≤ 200 ms |
| Lighthouse mobile on `/` | Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95 |
| Hero images, transferred | ≤ 350 KB for scene and cutout together |
| First-load JS on `/` | ≤ 200 KB gzipped |
| Longest frame during the Dive | ≤ 32 ms on a mid-range laptop |

- Scene image: `priority`, `fetchPriority="high"`, `sizes="(max-width: 1023px) 217vw, 100vw"`. Cutout: eager, same `sizes`, no blur placeholder. Everything below the fold is lazy.
- If mobile LCP misses the limit, add pre-cropped hero files for screens up to 520 px wide (crop x 440–1210 of the plate) through `getImageProps` and `<picture>`, and offset the scene map by the crop.
- `PolaroidStack`, `FilmStrip`, `CompareSlider` and `Envelope` load through `next/dynamic`. Sections below the fold use `content-visibility: auto` with `contain-intrinsic-size`.
- Loops run only while their element is in view and the tab is visible.
- `will-change` goes on an element only while it animates.
- Fonts: three families, self-hosted by `next/font`; preload the display and OSD faces only.

---

## 13. Content model

```ts
// content/work.ts, content/clients.ts, content/site.ts
export type Aspect = "16 / 9" | "1 / 1" | "4 / 5" | "9 / 16";
export type CategoryId = "gaming" | "podcast" | "crypto" | "social-media";

export interface ImageRef { src: string; width: number; height: number }

export interface WorkItem {
  slug: string;
  title: string;      // ≤ 60 characters
  alt: string;        // describes the finished piece
  client?: string;
  after: ImageRef;    // the finished piece
  before?: ImageRef;  // raw frame or first draft, same aspect
  aspect: Aspect;
  views?: string;     // as supplied, e.g. "1.2M" — never computed, never invented
  href?: string;      // link to the live video or post
}

export interface Category {
  id: CategoryId;
  label: "GAMING" | "PODCAST" | "CRYPTO" | "SOCIAL MEDIA";
  niche: "GAMING" | "PODCAST" | "CRYPTO" | "SOCIAL"; // the word on the hero TV
  stripe: "orange" | "mustard" | "blue" | "pink";
  cover: ImageRef;
  items: WorkItem[];
}

export interface Client { name: string; meta?: string; avatar?: ImageRef; href?: string }

export interface Site {
  name: "Swarnava Chakraborty";
  wordmark: "SWARNAVA";
  role: string;       // ≤ 48 characters
  about: string[];    // 1–3 paragraphs, about 90 words in total
  pillars: ["AI", "DESIGN", "CREATIVITY"];
  contactLine: string; // ≤ 80 characters
  email: string;
  socials: { label: string; href: string }[];
  btsPhotos: { src: string; alt: string; caption?: string }[];
}
```

**Fixed copy — use exactly:** `SWARNAVA` · `SWARNAVA CHAKRABORTY` · `CONTENT` `GAMING` `PODCAST` `CRYPTO` `SOCIAL` · `AI` `DESIGN` `CREATIVITY` · `SCROLL ▼` · `BTS.` · `WORKED WITH` · `PROJECTS` · `ALL TAPES` · `CONTACT` · `END OF TAPE` · `OPEN` · `VIEW ALL TAPES` · `SEE THE WORK` · `MORE FROM THIS TAPE` · `BEFORE` `AFTER` · `NOW PLAYING` · `FINAL ONLY` · `TRACKING…` · `SEND` `SENDING` `MESSAGE SENT` `SEND ANOTHER` · `REWIND` · `NO SIGNAL` · `NO TAPE` · `COMING SOON`.

**Placeholders — until the owner supplies the real thing:**

| Key | Placeholder | Limit |
|---|---|---|
| `site.role` | `[ROLE LINE]` | 48 characters |
| `site.about` | `[ABOUT — PARAGRAPH 1]`, `[ABOUT — PARAGRAPH 2]` | about 90 words in total |
| `site.contactLine` | `[CONTACT LINE]` | 80 characters |
| `site.email`, `site.socials` | `[EMAIL]`, `[SOCIAL LABEL]` | up to 5 socials |
| `site.btsPhotos` | grey 4 : 5 tiles labelled `[BTS PHOTO 01]` … | 6–8 |
| `clients` | `[CLIENT NAME]`, `[SUBS]`, initials avatar | 6 or more |
| `work[...].items` | grey tiles labelled `[GAMING 01 — AFTER]`, `[GAMING 01 — BEFORE]` | 8 or more per category |

Placeholders render visibly, in brackets. `npm run check:content` lists every one that remains.

---

## 14. Build order and acceptance

**Phase 0 — Audit or scaffold.** Report what exists and how it maps to §7 before changing anything.

**Phase 1 — Foundation:** tokens, fonts, scenes, layout, Remote, HUD, Footer, 404.
- [ ] Every token in §6 is in `globals.css`; `npm run check:tokens` passes.
- [ ] Fonts load through `next/font`; CLS stays under 0.05 when they swap.
- [ ] Remote: reachable by keyboard, `aria-current` follows scroll, the highlight slides.
- [ ] HUD: the timecode changes on every scroll frame with no React re-render; the channel flips at section boundaries; transport shows PLAY, REW, PAUSE and STOP at the right times.
- [ ] Skip link, landmarks and the 404 page work.

**Phase 2 — Hero, static.**
- [ ] At 1024, 1440 and 1920 px (`cinema`) and 360, 390, 430 and 768 px (`portrait`), the `?debug=screens` boxes sit inside each TV's glass within 2 px.
- [ ] The subject and the scene never misalign — no doubled edges anywhere.
- [ ] The wordmark is behind the subject; the ghost outline shows only over the subject.
- [ ] Portrait: both shoes in frame, the hair overlaps the lower third of the wordmark, the wordmark is one line at 90% of the viewport or wider.
- [ ] No visible rectangle where the picture meets the cream ground.
- [ ] The LCP element is the scene image and LCP is within the limit.

**Phase 3 — Hero, live:** cyclers, static, glints, parallax, power-on, then the Dive.
- [ ] The top TV fully hides the baked `CONTENT`; all five words fit; the hands still overlap the TV's top edge.
- [ ] The Dive plays forwards and backwards with scroll, ends on flat orange covering the whole viewport, and enters BTS with no seam.
- [ ] The Dive is off on touch, below 1024 px, on short viewports and with reduced motion.
- [ ] No frame over 32 ms during the Dive.
- [ ] Every loop pauses offscreen and when the tab is hidden.

**Phase 4 — BTS.**
- [ ] `BTS.` is white; every paragraph is black; no text over the red glow.
- [ ] The Monitor bleeds off the right edge from 1024 px and is full width below.
- [ ] The stack works by drag, tap and keyboard; the counter and the live region update; one photo and no photos both hold.

**Phase 5 — Film strip.**
- [ ] It straddles the orange / black boundary at −3° with no horizontal scrollbar at any width.
- [ ] It speeds up with scroll, pauses on hover and focus, drags, and has a pause control.
- [ ] Static with fewer than 4 clients; absent with none.

**Phase 6 — Work:** shelf, transition, `/work`, `/work/[category]`, slider.
- [ ] Shelf is 4-up, 2 × 2 and a carousel in the three ranges; the tape rises and the reels spin on hover and on keyboard focus.
- [ ] Clicking a tape plays the transition and lands on the category. Cmd / Ctrl-click opens a new tab without it. Browser back plays nothing.
- [ ] `/work`: two rows per band move in opposite directions; the chips follow scroll.
- [ ] Slider: mouse, touch and keyboard all work; a vertical swipe that starts on it still scrolls the page; `aria-valuetext` updates.
- [ ] After-only, loading and error states exist; 16 : 9, 1 : 1, 4 : 5 and 9 : 16 items all display correctly.
- [ ] `?t=` selects the item on load; selecting another updates the URL without a scroll jump.

**Phase 7 — Contact.**
- [ ] The form works with JavaScript off. With it, the envelope opens once when in view.
- [ ] Validation, error and sent states match §9.7; values survive an error.
- [ ] Sends through Resend when the env vars exist; the `mailto:` fallback works without them.

**Phase 8 — Passes.**
- [ ] Keyboard-only walkthrough of all three routes: everything reachable, focus visible, order logical.
- [ ] With reduced motion, every row of the table in §11 holds.
- [ ] Lighthouse mobile on `/` meets §12.
- [ ] Safari on macOS and iOS, Chrome and Firefox: masks, sticky, text stroke and `svh` all behave.
- [ ] `CONTENT-TODO.md` is complete.

---

## 15. Options — not the default; build only when asked

**Colour themes.** A theme is a mapping from section to scene, switched by one attribute on `<html>`.

| Theme | Mapping | Trade-off |
|---|---|---|
| `tape` (default) | Hero cream → BTS signal → everything else night | The brand gradient as a journey. Work pops on black. |
| `paper` | Everything cream; BTS stays signal; tapes and film stay black objects | Calmer and more editorial. Thumbnails pop less. |
| `night` | Everything night, hero included | The most dramatic. Needs the hero art re-rendered on a dark wall — ask before using. |

**Wordmark colour** is one token, `--fg-display` on the cream scene: `#E85002` (default, on brand) · `#C10801` (deeper, 4.5 : 1 on cream) · `#000000` (maximum legibility) · `#FE0000` (the original, off palette).

**Alternative landing directions:**

| Direction | Idea | Needs |
|---|---|---|
| B — The Wipe | The hero itself is the before/after slider: the raw studio shot on the left, the finished key art on the right. The page proves the skill before a word is read. | The unedited studio photo in the same framing |
| C — Shelf first | The landing opens on the four tapes; the portrait moves to BTS. The fastest to build and the least personal. | Nothing new |

---

## 16. Don'ts and traps

**Don't:**
- Add sections, testimonials, stat counters, skill bars, a blog, a percentage preloader, a cookie banner or a dark-mode toggle.
- Use emoji, an icon library, stock illustration, or a second animation library.
- Hijack scroll or style the scrollbar.
- Put effects on the work.
- Hard-code a colour, a duration or an easing in a component.
- Ship a placeholder as if it were real.
- Regenerate, AI-upscale or retouch the supplied photo of the person.
- Add video backgrounds, WebGL or sound.

**Traps:**
1. `scene.png` already contains the subject. Move the scene and the cutout as one or you get a double image.
2. `.plate` must not become a stacking context (§9.1).
3. `position: sticky` stops working under any ancestor with `overflow: hidden`, `auto` or `scroll`. Use `overflow: clip`.
4. Measure Dive geometry from layout offsets, not from `getBoundingClientRect` mid-transform.
5. Rotations and offsets that look random must be derived from the index, or hydration will mismatch.
6. Marquee duplicates must be `inert`, or keyboard users tab through everything twice.
7. `next/image` with `fill` needs a positioned parent with a set aspect ratio.
8. `mask-composite` needs its `-webkit-` twin; test the feathered scene edges and the ghost outline in Safari.
9. On the ghost outline set `paint-order: stroke fill`, or the stroke eats into the letter shapes.
10. A full-size native range input over the slider traps vertical scrolling on touch (§7.11).

---

## 17. Report back

When you finish, or stop, reply with:

1. **What exists** — routes and components, each mapped to its section in this file.
2. **Deviations** — anything built differently from this spec, and why.
3. **Measured values** — the corrected `SCREENS` rects, `DISCO`, the wordmark's final `font-size`, the three stripe colours.
4. **Numbers** — Lighthouse scores for `/`, hero transfer size, first-load JS, the longest Dive frame.
5. **`CONTENT-TODO.md`** — every remaining placeholder, and every asset still needed from §5.4.
6. **Design system audit**, in this form:

```markdown
## Design System Audit

### Summary
**Components reviewed:** [X] | **Issues found:** [X] | **Score:** [X/100]

### Naming Consistency
| Issue | Components | Recommendation |
|-------|------------|----------------|

### Token Coverage
| Category | Defined | Hardcoded Values Found |
|----------|---------|------------------------|
| Colors | [X] | [X] |
| Spacing | [X] | [X] |
| Typography | [X] | [X] |
| Motion | [X] | [X] |

### Component Completeness
| Component | States | Variants | Docs | Score |
|-----------|--------|----------|------|-------|

### Priority Actions
1. …
```
