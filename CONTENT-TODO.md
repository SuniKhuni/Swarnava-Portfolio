# CONTENT-TODO — Tape 01

> All of this is now edited from **/admin** — the file paths below show where each value lives in `content/data/content.json`.

Everything the site shows that is **not** real yet. Placeholders render visibly, in brackets.
`npm run check:content` prints the live, line-by-line list (215 entries at handover); this file groups them.

## 1. Copy — `content/site.ts`

| Key | Placeholder now | Limit | Where it shows |
|---|---|---|---|
| `site.role` | `[ROLE LINE]` | 48 characters | Hero name block, page `<title>`, OG title, JSON-LD `jobTitle` |
| `site.about[0]`, `site.about[1]` | `[ABOUT — PARAGRAPH 1]`, `[ABOUT — PARAGRAPH 2]` | 1–3 paragraphs, ~90 words in total | BTS |
| `site.contactLine` | `[CONTACT LINE]` | 80 characters | Contact, above the envelope |
| `site.email` | `[EMAIL]` | — | Contact links, the `mailto:` fallback, error banners |
| `site.socials` | `INSTAGRAM`, `LINKEDIN` → `#contact` | up to 5 | Hero round buttons, contact and footer; real profile URLs also feed JSON-LD `sameAs` |

## 2. BTS photos — `content/site.ts` → `site.btsPhotos`

8 grey 4 : 5 tiles labelled `[BTS PHOTO 01]` … `[BTS PHOTO 08]`, each with `[BTS PHOTO NN — ALT TEXT]` and `[CAPTION NN]`.
Needed: **6–8 portrait photos, 4 : 5, at least 1200 px tall, each with alt text and a short caption.**
Put them in `public/bts/` and point `src` at them.

## 3. Clients — `content/clients.ts`

6 entries: `[CLIENT NAME 01]` … `[CLIENT NAME 06]`, meta `[SUBS]`, no avatar (initials show), no link.
Needed per client: **square avatar (256 px or larger), name, subscriber count or handle, link.**
Also per client (new): **YouTube @handle** (`channel`, for the live subscriber count), **what was delivered** (`work`, one line)
and **the result** (`result`, as measured — never invented).
Put avatars in `public/clients/`. With fewer than 4 clients the reel goes static and centred; with none it disappears.

## 4. Work — `content/work.ts`

Mark 1–3 strong before/after pieces `featured: true` — they lead the home bento full-width with the slider
(placeholders: GAMING 01, PODCAST 01). Curating 10–15 showcase pieces out of the archive is the owner's pick.

| Category | Items now | Aspects used by the placeholders | Cover |
|---|---|---|---|
| Gaming | 8 | all 16 : 9 | `[GAMING — COVER]` |
| Podcast | 8 | all 16 : 9 | `[PODCAST — COVER]` |
| Crypto | 8 | all 16 : 9 | `[CRYPTO — COVER]` |
| Social media | 8 | 9 : 16, 4 : 5, 1 : 1 mixed; item 08 has no "before" (exercises FINAL ONLY) | `[SOCIAL MEDIA — COVER]` |

Every item carries placeholder `title` (`[GAMING 01 — TITLE]`), `alt` (`[GAMING 01 — ALT TEXT]`), `client` (`[CLIENT NAME]`),
and grey `after` / `before` tiles. No item has `views` or `href` — never invent them.
Needed per item: **final image, the raw "before" in the same aspect, title (≤ 60 characters), alt text, client, optional view count (as supplied) and link.**
Eight or more per category fills two rows. Put files in `public/work/<category>/` and replace the `placeholderItems(...)` calls.

## 5. Assets still needed

**From the new hero mock (Oct 2026):** the mock shows **five** TVs (DESIGN, CONTENT, the static set, **AI**, the sunset)
plus a camcorder and warmer lighting. The supplied `scene.png` has four TVs, so four are live today. To wire the fifth:

- **The new hero art at full resolution** (1672 px wide or more; ideally 3344 px), *without* the SWARNAVA lettering baked in —
  the name is drawn by the site, behind the subject.
- **A matching cutout** (subject only, transparent, pixel-aligned), as for the current art.
- Then: drop both into `_assets-src/` as `scene.png` / `cutout.png`, re-measure the five screen rects in `lib/scene-map.ts`,
  add the AI set as a fifth `CrtScreen`, run `npm run prep:assets`.

From §5.4:

1. **Hero at 2×** (3344 × 1882) — the 1672 px art is soft on retina desktops. v1 ships with what exists.
2. **`scene-blank.png`** — same frame, all four TV screens blank. Today the screens are covered with black; this would let them be transparent overlays.
3. **`scene-clean.png`** — same frame, no subject. Unlocks subject parallax (§9.1).
4. **BTS photos** — see §2 above.
5. **Clients** — see §3 above.
6. **Work** — see §4 above.
7. **Copy** — see §1 above.
8. **An OSD font file with a licence**, only if an exact match to the art's on-screen text is wanted. VT323 is used meanwhile.

When the hero art changes, re-measure `lib/scene-map.ts` (the method is in the comments there) and run `npm run prep:assets`.
Phones show only the subject and his TV stack, tablets also the two side TV sets: the prop extents are plate
coordinates in the `.stage` / `.plate__scene` rules of `components/hero/hero.css` — re-measure those too.

## 6. Configuration

| Variable | Now | Effect |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | unset → `http://localhost:3000` | `metadataBase`, sitemap, robots, JSON-LD `url` |
| `RESEND_API_KEY`, `CONTACT_TO_EMAIL` | unset | Without both, the form hands the message to the visitor's mail app (`mailto:`); without JS it shows the "Not sent… email [EMAIL]" banner |
| `YOUTUBE_API_KEY` | unset | Live subscriber counts on the client cards (YouTube Data API v3, cached a day); without it the static `meta` shows |
| `CONTACT_FROM_EMAIL` | unset → `Tape 01 <onboarding@resend.dev>` | Sender; needs a domain verified in Resend for production |

See `.env.example`.

## 7. Assumptions to confirm with the owner (§1.2)

1. Display face Bebas Neue, OSD face VT323, body Archivo.
2. Contact emails through Resend, with a `mailto:` fallback.
3. Colour journey cream → orange → black.
4. Clicking a project tape goes straight to that category's expanded view.
5. All copy, clients and work items are placeholders until supplied.

## 8. Social links — `content/site.ts`

`site.socials`: real Instagram and LinkedIn profile URLs (`https://…`). Until then the hero's round buttons point at the contact section.

## 9. Admin panel — built

Everything in sections 1–4 and 8 is edited at **`/admin`** (desktop, password in `.env.local`), not in code:
copy, socials, hero TV words, clients (photo, role, @handle, work, result), tapes and pieces (images,
before/after, featured, views, links), BTS photos. The data file is `content/data/content.json`.
New tapes this round: **WEB3** and **DEVELOPER** (placeholder pieces) so every hero tag opens its own page.
