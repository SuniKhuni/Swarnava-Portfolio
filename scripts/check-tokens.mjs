// npm run check:tokens
// 1. Every token from §6 exists in app/globals.css.
// 2. Nothing under components/ hard-codes a colour, a duration or an easing:
//    no hex, no rgb()/hsl(), no raw ms/s durations, no cubic-bezier(), no numeric `duration:` literals.
import { readFile, readdir } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const globals = await readFile(join(root, "app/globals.css"), "utf8");

const REQUIRED = [
  // §6.1 colour
  "black", "gray-900", "gray-600", "gray-400", "white", "orange-500", "orange-400", "red-600", "sand-300",
  "gradient-brand", "cream-200", "cream-100", "stripe-mustard", "stripe-pink", "stripe-blue",
  "bg", "fg", "fg-muted", "fg-display", "accent", "surface", "on-surface", "line", "focus",
  // §6.2 type
  "font-display", "font-osd", "font-body", "text-mega", "text-section", "text-title", "text-label", "text-lead",
  "text-body", "text-small", "text-osd-lg", "text-osd",
  // §6.3 space, shape, layers
  "space-1", "space-2", "space-3", "space-4", "space-6", "space-8", "space-12", "space-16", "space-24", "space-32",
  "gutter", "section-y", "content-max", "radius-xs", "radius-sm", "radius-md", "radius-lg", "radius-pill",
  "shadow-prop", "shadow-lift", "z-sticky", "z-remote", "z-hud", "z-cursor", "z-overlay", "z-skip",
  // §6.4 motion
  "dur-flash", "dur-fast", "dur-base", "dur-slow", "dur-scene", "ease-out", "ease-in-out", "ease-in",
];
const missing = REQUIRED.filter((t) => !new RegExp(`--${t}\\s*:`).test(globals));
for (const scene of ["cream", "signal", "night"]) {
  if (!globals.includes(`[data-scene="${scene}"]`)) missing.push(`[data-scene="${scene}"]`);
}

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(p);
  }
  return out;
}

const RULES = [
  { name: "hex colour", re: /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g },
  { name: "raw rgb()/hsl() colour", re: /\b(?:rgba?|hsla?)\(/g },
  { name: "cubic-bezier easing", re: /cubic-bezier\(/g },
  { name: "raw duration", re: /(?<![\w.-])(?!0m?s\b)\d*\.?\d+m?s\b(?![\w-])/g, css: true },
  { name: "raw duration in a string", re: /["'`][^"'`]*?\b(?!0m?s\b)\d*\.?\d+ms\b/g, ts: true },
  { name: "numeric duration literal", re: /\bduration:\s*\d/g, ts: true },
];

const problems = [];
for (const file of await walk(join(root, "components"))) {
  const isCss = file.endsWith(".css");
  const lines = (await readFile(file, "utf8")).split("\n");
  lines.forEach((line, i) => {
    const code = line.replace(/\/\*.*?\*\/|\/\/.*$/g, ""); // ignore comments
    for (const r of RULES) {
      if (r.css && !isCss) continue;
      if (r.ts && isCss) continue;
      // data: URIs may carry SVG fill keywords; skip them for colour rules
      const scan = r.name.includes("colour") ? code.replace(/url\("data:[^"]*"\)/g, "") : code;
      for (const m of scan.matchAll(r.re)) problems.push(`${relative(root, file)}:${i + 1}  ${r.name}: ${m[0].trim()}`);
    }
  });
}

if (missing.length) console.error(`Missing tokens in app/globals.css:\n  ${missing.join("\n  ")}`);
if (problems.length) console.error(`Hard-coded values in components/:\n  ${problems.join("\n  ")}`);
if (missing.length || problems.length) process.exit(1);
console.log(`check:tokens — ${REQUIRED.length} tokens present, 3 scenes, components/ clean.`);
