// Shared by the server action and the client-side check, so both say the same thing.

export const NEEDS = ["Gaming", "Podcast", "Crypto", "Social media", "Something else"] as const;

export const CONTACT_LIMITS = {
  name: { min: 2, max: 80 },
  message: { min: 20, max: 2000 },
} as const;

export const CONTACT_COPY = {
  name: "Add your name.",
  email: "That email doesn't look right.",
  message: "Tell me a bit more — at least 20 characters.",
  notSent: (email: string) => `Not sent. Try again, or email ${email}.`,
  rateLimited: (email: string) => `Too many messages. Try again in a minute, or email ${email}.`,
} as const;

export type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export type ContactState = {
  ok: boolean;
  fieldErrors?: FieldErrors;
  formError?: string;
  /** No email backend: the visitor's mail app is the way through. */
  mailto?: boolean;
  values?: { name: string; email: string; need: string; message: string };
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function checkFields(v: { name: string; email: string; message: string }): FieldErrors {
  const e: FieldErrors = {};
  const name = v.name.trim();
  if (name.length < CONTACT_LIMITS.name.min || name.length > CONTACT_LIMITS.name.max) e.name = CONTACT_COPY.name;
  if (!EMAIL_RE.test(v.email.trim())) e.email = CONTACT_COPY.email;
  const msg = v.message.trim();
  if (msg.length < CONTACT_LIMITS.message.min || msg.length > CONTACT_LIMITS.message.max) e.message = CONTACT_COPY.message;
  return e;
}

export function mailtoFor(to: string, v: { name: string; email: string; need: string; message: string }) {
  const subject = `Project enquiry — ${v.need}`;
  const body = `${v.message.trim()}\n\n— ${v.name.trim()} (${v.email.trim()})`;
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
