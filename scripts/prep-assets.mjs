// Prepares public assets from /_assets-src.
//   public/hero/scene.png, public/hero/cutout.png — copied as-is; next/image serves them.
//   public/hero/wordmark.png — the red brushed wordmark (owner-supplied).
//   public/fx/noise.png — a 128 × 128 greyscale noise tile.
//   public/placeholder/** — labelled grey tiles for every placeholder path referenced in /content.
import { mkdir, copyFile, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "_assets-src");
const pub = join(root, "public");

async function ensureDir(p) {
  await mkdir(p, { recursive: true });
}

async function hero() {
  await ensureDir(join(pub, "hero"));
  for (const f of ["scene.png", "cutout.png"]) {
    if (!existsSync(join(src, f))) throw new Error(`Missing /_assets-src/${f}`);
    await copyFile(join(src, f), join(pub, "hero", f));
  }
  // The red brushed wordmark (owner-supplied artwork).
  if (!existsSync(join(src, "wordmark.png"))) throw new Error("Missing /_assets-src/wordmark.png");
  await copyFile(join(src, "wordmark.png"), join(pub, "hero", "wordmark.png"));
  // Tablet scene (owner-supplied, no subject): placed in the plate's 1672 × 941 frame so its
  // TV stack sits under the cutout — same scale, shifted (+53, −20); the uncovered left
  // 53 px repeat the image's edge. Screen rects for it: SCREENS_TABLET in lib/scene-map.ts.
  if (!existsSync(join(src, "scene-tablet-src.png"))) throw new Error("Missing /_assets-src/scene-tablet-src.png");
  const t = sharp(join(src, "scene-tablet-src.png"));
  const edge = await t.clone().extract({ left: 0, top: 20, width: 1, height: 941 }).resize(53, 941, { kernel: "nearest" }).png().toBuffer();
  const body = await t.clone().extract({ left: 0, top: 20, width: 1589, height: 941 }).png().toBuffer();
  await sharp({ create: { width: 1672, height: 941, channels: 3, background: "#efd5bc" } })
    .composite([
      { input: edge, left: 0, top: 0 },
      { input: body, left: 53, top: 0 },
    ])
    .png()
    .toFile(join(pub, "hero", "scene-tablet.png"));
  console.log("hero: scene, cutout, wordmark, scene-tablet");
}

async function noise() {
  await ensureDir(join(pub, "fx"));
  const size = 128;
  const buf = Buffer.alloc(size * size);
  // Deterministic LCG so the tile is identical on every run.
  let s = 0x2f6b1;
  for (let i = 0; i < buf.length; i++) {
    s = (s * 1664525 + 1013904223) >>> 0;
    buf[i] = s >>> 24;
  }
  await sharp(buf, { raw: { width: size, height: size, channels: 1 } }).toColourspace("b-w").png({ compressionLevel: 9 }).toFile(join(pub, "fx", "noise.png"));
  console.log("fx: noise.png 128×128");
}

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");

function tileSvg(w, h, lines, tone) {
  const bg = tone === "dark" ? "#333333" : "#A7A7A7";
  const fg = tone === "dark" ? "#F9F9F9" : "#000000";
  const rule = tone === "dark" ? "#646464" : "#646464";
  const fs = Math.round(Math.min(w, h * 1.4) / 17);
  const inset = Math.round(Math.min(w, h) * 0.04);
  const text = lines
    .map((l, i) => `<text x="50%" y="${h / 2 + (i - (lines.length - 1) / 2) * fs * 1.5}" font-size="${i === 0 ? fs : fs * 0.62}" text-anchor="middle" dominant-baseline="middle">${esc(l)}</text>`)
    .join("");
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
      <rect width="100%" height="100%" fill="${bg}"/>
      <rect x="${inset}" y="${inset}" width="${w - inset * 2}" height="${h - inset * 2}" fill="none" stroke="${rule}" stroke-width="${Math.max(2, fs / 10)}" stroke-dasharray="${fs / 2} ${fs / 3}"/>
      <g fill="${fg}" font-family="Consolas, 'DejaVu Sans Mono', monospace" font-weight="700">${text}</g>
    </svg>`,
  );
}

const SIZE = { "16x9": [1280, 720], "1x1": [1080, 1080], "4x5": [1080, 1350], "9x16": [1080, 1920] };

async function placeholders() {
  // Every /placeholder/… path in the content document gets a grey tile.
  const data = JSON.parse(await readFile(join(root, "content", "data", "content.json"), "utf8"));
  const paths = new Set();
  for (const c of data.categories) {
    if (c.cover) paths.add(c.cover.src);
    for (const it of c.items) {
      paths.add(it.after.src);
      if (it.before) paths.add(it.before.src);
    }
  }
  for (const p of data.site.btsPhotos) paths.add(p.src);
  for (const c of data.clients) if (c.avatar) paths.add(c.avatar.src);

  let n = 0;
  for (const p of paths) {
    if (!p.startsWith("/placeholder/")) continue;
    const m = p.match(/\/placeholder\/(work|bts)\/(.+?)-(\d{2}|cover)(?:-(after|before))?-(\d+x\d+)\.webp$/);
    if (!m) {
      console.warn(`skip: cannot parse ${p}`);
      continue;
    }
    const [, kind, name, num, which, tag] = m;
    const [w, h] = SIZE[tag];
    const label = name.replace(/-/g, " ").toUpperCase();
    let lines;
    let tone;
    if (kind === "bts") {
      lines = [`[BTS PHOTO ${num}]`, "4 : 5 · PORTRAIT"];
      tone = "light";
    } else if (num === "cover") {
      lines = [`[${label} — COVER]`, `${tag.replace("x", " : ")} · ${w} × ${h}`];
      tone = "dark";
    } else {
      lines = [`[${label} ${num} — ${which.toUpperCase()}]`, `${tag.replace("x", " : ")} · ${w} × ${h}`];
      tone = which === "after" ? "dark" : "light";
    }
    const out = join(pub, p);
    await ensureDir(dirname(out));
    await sharp(tileSvg(w, h, lines, tone)).webp({ quality: 70 }).toFile(out);
    n++;
  }
  console.log(`placeholders: ${n} tiles`);
}

await hero();
await noise();
await placeholders();
await writeFile(join(pub, "placeholder", "README.txt"), "Generated by scripts/prep-assets.mjs. Placeholders only — replace via /content.\n");
