# Swarnava — Tape 01

Portfolio for Swarnava Chakraborty. The whole site behaves like a VHS tape playing on the stack of TVs in the hero art:
scroll is timecode, sections are channels, the nav is a remote, and route changes are channel changes.
The full brief is `prompt.md`; what is still placeholder is in `CONTENT-TODO.md`.

## Run

```bash
npm install
npm run prep:assets   # copies /_assets-src into /public, plus the noise tile and placeholder tiles
npm run dev
```

Production: `npm run build && npm start`. Copy `.env.example` to `.env.local` for the site URL and the contact backend.

## Admin (`/admin`)

A hidden, desktop-only dashboard (not linked, `noindex`, disallowed in robots.txt) for the site's copy, clients,
tapes and their pieces, and BTS photos — add, edit, reorder, delete, upload images. Set `ADMIN_PASSWORD` and
`ADMIN_SECRET` in `.env.local` (see `.env.example`); changing the password signs every session out.

- Content is validated by `content/schema.ts` on every save and stored in Supabase (production) or
  `content/data/content.json` (local). Uploads become WebP (metadata stripped), served from `/media/…`.
- A save rewrites the JSON and revalidates every page, so the static pages update without a rebuild.
- Needs a server with a writable disk (the Fly.io setup below). On read-only serverless hosting (e.g. Vercel)
  the dashboard can't write. `CONTENT_DIR` moves content + uploads to a persistent disk (seeded from the repo).

## Deploy — swarnava.xyz on Vercel + Supabase

- **Vercel** runs the site (pages, /admin, contact form). Push to GitHub → Vercel builds it.
- **Supabase** stores the content (table `site_content`, one row `main`) and admin uploads (public
  bucket `media`), via `lib/supabase.ts`. Without `SUPABASE_*` env vars the site uses local files.
- **gen.xyz** keeps the domain: `A @ → 76.76.21.21`, `CNAME www → cname.vercel-dns.com`.

Supabase, once: new project (region Mumbai) → SQL editor:

```sql
create table public.site_content (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
alter table public.site_content enable row level security;
```

then Storage → new **public** bucket `media` (image/webp, 15 MB). On the first build the repo's
`content/data/content.json` is copied into the table; after that the table is the source of truth.

Vercel env vars: `NEXT_PUBLIC_SITE_URL=https://swarnava.xyz`, `ADMIN_PASSWORD`, `ADMIN_SECRET`,
`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (+ optional `YOUTUBE_API_KEY`, `RESEND_API_KEY`, `CONTACT_TO_EMAIL`).

Uploads are shrunk in the browser to under 4 MB first (Vercel's request limit is 4.5 MB).

*Alternative:* `Dockerfile` + `fly.toml` run the same site on any Docker host with a disk at `/data`
(`CONTENT_DIR`) instead of Supabase.

## Scripts

| Script | Does |
|---|---|
| `npm run prep:assets` | Hero plate, the wordmark, `fx/noise.png`, and a grey tile for every placeholder path in `/content` |
| `npm run check:tokens` | Every §6 token exists in `app/globals.css`; nothing under `components/` hard-codes a colour, duration or easing |
| `npm run check:content` | Lists every placeholder still in `/content` and unset env (`--strict` exits non-zero) |
| `npm run lint` / `npm run typecheck` | ESLint (Next core-web-vitals + TS) / `tsc --noEmit` |

`?debug=screens` (development only) draws every scene-map rect as a magenta box over the hero.

## Map

```text
app/            routes: / · /work · /work/[category] · /admin · /media · not-found; layout, globals.css (all tokens), actions/contact.ts, OG, sitemap, robots
components/
  admin/        AdminApp (dashboard), AdminLogin
  chrome/       Remote, Hud, TapeLink + TransitionOverlay, CursorChip, SceneObserver, Footer
  hero/         Hero, Intro, BrushWordmark, CrtScreen, TvPictures, Cycler, DiscoGlints, PlatePicture, useDive
  bts/          Bts, BtsDeck, Monitor, PolaroidStack (client-only), PolaroidStatic
  clients/      Clients (VHS-sleeve reel, live YouTube counts via lib/youtube.ts)
  work/         Projects, Shelf, Cassette, CategoryBand, MarqueeRow, ThumbCard, CompareSlider, ExpandedView
  contact/      Contact, Envelope, LetterForm
  ui/ fx/       Button, OsdChip, Field, Icon · Rise, LineReveal, effect CSS
content/        data/content.json (all copy and media, edited from /admin), media/ (uploads), schema.ts, store.ts, types.ts
lib/            motion.ts (timings), scene-map.ts (measured), scroll.ts, motion-style.ts, channel.ts, hooks.ts
```

## Notes for whoever edits this next

- Colours, durations and easings live in `app/globals.css` and `lib/motion.ts` only. `check:tokens` enforces it.
- First-load JS is kept under 200 KB: the first-load path binds Motion values with `useMotionStyle` and drives state with CSS;
  only the Polaroid stack (client-only) and the slider use Motion's renderer and animation engine.
- No route `loading.tsx`: a streamed fallback would hide the page from visitors without JavaScript. Slow routes show
  `TRACKING…` in the tape transition instead.
- `.plate` in the hero must never become a stacking context (no transform, opacity, filter, will-change or z-index).
- The name is the owner's artwork (`_assets-src/wordmark.png`), placed by its *letters'* box (`lib/wordmark.ts` — re-measure if the file changes), so the brush
  can overhang freely. The first-visit intro flies that same image onto the hero's copy, then fades to reveal the subject in front.
- Fonts in `assets/fonts` are OFL (licence alongside); used only by the OG image.
