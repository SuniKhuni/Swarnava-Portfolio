// npm run check:content — lists every placeholder still in /content (and the env-driven ones).
// Exits 0 so it can run anywhere; pass --strict to fail while placeholders remain.
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { siteUrl } = await import(new URL("../content/site.ts", import.meta.url));
const { contentSchema } = await import(new URL("../content/schema.ts", import.meta.url));
const raw = JSON.parse(await readFile(join(root, "content", "data", "content.json"), "utf8"));
const valid = contentSchema.safeParse(raw);
if (!valid.success) {
  console.error("content/data/content.json does not validate:");
  for (const i of valid.error.issues) console.error(`  ${i.path.join(".")}: ${i.message}`);
  process.exit(1);
}
const { site, clients, categories } = raw;

const isPh = (v) => typeof v === "string" && (/^\[.*\]$/.test(v.trim()) || v.includes("/placeholder/"));
const found = [];
const add = (key, value) => isPh(value) && found.push(`${key.padEnd(44)} ${value}`);

add("site.role", site.role);
site.about.forEach((p, i) => add(`site.about[${i}]`, p));
add("site.contactLine", site.contactLine);
add("site.email", site.email);
site.socials.forEach((s, i) => {
  add(`site.socials[${i}].label`, s.label);
  if (!/^https?:/.test(s.href)) found.push(`${`site.socials[${i}].href`.padEnd(44)} ${s.href}  (not a real profile link)`);
});
site.btsPhotos.forEach((p, i) => {
  add(`site.btsPhotos[${i}].src`, p.src);
  add(`site.btsPhotos[${i}].alt`, p.alt);
  add(`site.btsPhotos[${i}].caption`, p.caption);
});
clients.forEach((c, i) => {
  add(`clients[${i}].name`, c.name);
  add(`clients[${i}].meta`, c.meta);
  add(`clients[${i}].work`, c.work);
  add(`clients[${i}].result`, c.result);
  if (!c.channel) found.push(`${`clients[${i}].channel`.padEnd(44)} (missing — no live subscriber count)`);
  if (!c.avatar) found.push(`${`clients[${i}].avatar`.padEnd(44)} (missing — initials shown)`);
});
for (const c of categories) {
  if (c.cover) add(`work.${c.id}.cover`, c.cover.src);
  c.items.forEach((it, i) => {
    const k = `work.${c.id}.items[${i}]`;
    add(`${k}.title`, it.title);
    add(`${k}.alt`, it.alt);
    add(`${k}.client`, it.client);
    add(`${k}.after`, it.after.src);
    if (it.before) add(`${k}.before`, it.before.src);
  });
}
if (/localhost/.test(siteUrl)) found.push(`${"NEXT_PUBLIC_SITE_URL".padEnd(44)} unset — metadata, sitemap and robots use ${siteUrl}`);

const env = await readFile(join(root, ".env.local"), "utf8").catch(() => "");
for (const v of ["RESEND_API_KEY", "CONTACT_TO_EMAIL"]) {
  if (!process.env[v] && !new RegExp(`^${v}=.+`, "m").test(env)) found.push(`${v.padEnd(44)} unset — contact form falls back to mailto:`);
}

console.log(found.length ? `${found.length} placeholders remain:\n\n${found.join("\n")}` : "No placeholders remain.");
if (process.argv.includes("--strict") && found.length) process.exit(1);
