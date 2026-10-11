import { z } from "zod";
import type { Aspect, Content, Stripe } from "./types";

// Repeated here (type-checked against types.ts) so scripts can load this file with plain Node.
const ASPECTS = ["16 / 9", "1 / 1", "4 / 5", "9 / 16"] as const satisfies readonly Aspect[];
const STRIPES = ["orange", "mustard", "blue", "pink"] as const satisfies readonly Stripe[];

// Validates content/data/content.json on every admin save (and in check:content).
// Links only ever go to http(s), mailto, an on-page anchor or a site path — never javascript:.

const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => text(max).min(1, "Required");
const optional = (max: number) =>
  text(max)
    .optional()
    .transform((v) => (v === "" ? undefined : v));

const link = z
  .string()
  .trim()
  .max(500)
  .refine((v) => /^(https?:\/\/[^\s]+|mailto:[^\s]+|#[\w-]*|\/(?!\/)[^\s]*)$/i.test(v), "Use https://…, mailto:…, #section or /path");
const optionalLink = z
  .union([link, z.literal("")])
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Images are files this site serves: /media/… (uploads), /placeholder/… or /hero/…. */
const image = z.object(
  {
  src: z
    .string()
    .trim()
    .regex(/^\/(media|placeholder|hero|bts|clients|work)\/[\w./-]+$/, "Upload an image"),
  width: z.number().int().positive().max(10000),
  height: z.number().int().positive().max(10000),
  },
  { error: "Upload an image" },
);

const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and dashes");

export const workItemSchema = z.object({
  slug,
  title: required(60),
  alt: required(200),
  client: optional(60),
  after: image,
  before: image.optional(),
  aspect: z.enum(ASPECTS),
  views: optional(20),
  href: optionalLink,
  featured: z.boolean().optional(),
});

export const categorySchema = z.object({
  id: slug,
  label: required(24).transform((v) => v.toUpperCase()),
  niche: required(12).transform((v) => v.toUpperCase()),
  stripe: z.enum(STRIPES),
  cover: image.optional(),
  items: z.array(workItemSchema).max(200),
});

export const clientSchema = z.object({
  name: required(60),
  meta: optional(40),
  channel: z
    .union([z.string().trim().regex(/^(@[\w.-]{3,40}|UC[\w-]{22})$/, "@handle or UC… channel ID"), z.literal("")])
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
  avatar: image.optional(),
  href: optionalLink,
  role: optional(40),
  work: optional(140),
  result: optional(140),
});

export const siteSchema = z.object({
  role: required(48),
  about: z.array(required(800)).min(1).max(3),
  pillars: z.array(required(24)).min(1).max(5),
  contactLine: required(80),
  email: required(120),
  socials: z
    .array(
      z.object({
        label: required(24),
        href: link,
        kind: z.enum(["instagram", "linkedin"]).optional(),
      }),
    )
    .max(5),
  heroNiches: z.array(required(12).transform((v) => v.toUpperCase())).min(1).max(8),
  btsPhotos: z
    .array(
      z.object({
        src: image.shape.src,
        alt: required(200),
        caption: optional(60),
      }),
    )
    .max(24),
});

export const contentSchema = z
  .object({
    site: siteSchema,
    clients: z.array(clientSchema).max(60),
    categories: z.array(categorySchema).max(12),
  })
  .superRefine((c, ctx) => {
    const ids = new Set<string>();
    c.categories.forEach((cat, i) => {
      if (ids.has(cat.id)) ctx.addIssue({ code: "custom", path: ["categories", i, "id"], message: "Two tapes share this id" });
      ids.add(cat.id);
      const slugs = new Set<string>();
      cat.items.forEach((it, j) => {
        if (slugs.has(it.slug)) ctx.addIssue({ code: "custom", path: ["categories", i, "items", j, "slug"], message: "Two pieces share this slug" });
        slugs.add(it.slug);
      });
    });
  }) satisfies z.ZodType<Content, unknown>;
