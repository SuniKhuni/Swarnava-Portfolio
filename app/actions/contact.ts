"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { getSite } from "@/content/store";
import { CONTACT_COPY, CONTACT_LIMITS, NEEDS, type ContactState } from "@/components/contact/contact-shared";

const schema = z.object({
  name: z.string().trim().min(CONTACT_LIMITS.name.min, CONTACT_COPY.name).max(CONTACT_LIMITS.name.max, CONTACT_COPY.name),
  email: z.email(CONTACT_COPY.email),
  need: z.enum(NEEDS).catch("Something else"),
  message: z.string().trim().min(CONTACT_LIMITS.message.min, CONTACT_COPY.message).max(CONTACT_LIMITS.message.max, CONTACT_COPY.message),
});

// A simple per-IP limit: 3 messages a minute. In memory — per server instance, which is enough for a portfolio.
const RATE = { windowMs: 60_000, max: 3 };
const hits = new Map<string, number[]>();

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    need: String(formData.get("need") ?? "Something else"),
    message: String(formData.get("message") ?? ""),
  };

  // Honeypot: bots fill every field. Pretend it worked and drop it.
  if (String(formData.get("company") ?? "") !== "") return { ok: true };

  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const fieldErrors: ContactState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as "name" | "email" | "message";
      fieldErrors[key] ??= issue.message;
    }
    return { ok: false, fieldErrors, values };
  }

  const site = await getSite();
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE.windowMs);
  if (recent.length >= RATE.max) return { ok: false, formError: CONTACT_COPY.rateLimited(site.email), values };
  recent.push(now);
  hits.set(ip, recent);

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    // No backend configured. With JS the client opens a mailto: before it ever gets here.
    return { ok: false, formError: CONTACT_COPY.notSent(site.email), mailto: true, values };
  }

  const { name, email, need, message } = parsed.data;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL ?? "Tape 01 <onboarding@resend.dev>",
        to: [to],
        reply_to: email,
        subject: `New message — ${need} — ${name}`,
        text: `${message}\n\n— ${name} <${email}>\nNeeds: ${need}`,
      }),
    });
    if (!res.ok) return { ok: false, formError: CONTACT_COPY.notSent(site.email), values };
  } catch {
    return { ok: false, formError: CONTACT_COPY.notSent(site.email), values };
  }
  return { ok: true };
}
