"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ASPECTS, STRIPES, type Category, type Client, type Content, type ImageRef, type WorkItem } from "@/content/types";
import { logout, saveContent, uploadImage } from "@/app/admin/actions";
import "./admin.css";

type Tab = "site" | "clients" | "tapes" | "bts";
type Edit = (fn: (d: Content) => void) => void;
type Issue = { path: string; message: string };

const pad = (n: number) => String(n).padStart(2, "0");

function moveIn<T>(list: T[], i: number, d: -1 | 1) {
  const j = i + d;
  if (j < 0 || j >= list.length) return;
  [list[i], list[j]] = [list[j], list[i]];
}

/** Hosts cap request bodies (Vercel: 4.5 MB). Big photos are scaled to ≤ 2560 px and
 *  re-encoded in the browser first; the server then makes the final WebP. */
const UPLOAD_MAX = 4 * 1024 * 1024;
async function shrink(file: File): Promise<File> {
  if (file.size <= UPLOAD_MAX || file.type === "image/gif") return file;
  try {
    const bmp = await createImageBitmap(file);
    for (const [edge, q] of [[2560, 0.9], [2048, 0.85], [1600, 0.8]] as const) {
      const k = Math.min(1, edge / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * k);
      c.height = Math.round(bmp.height * k);
      c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/webp", q));
      if (blob && blob.size <= UPLOAD_MAX) return new File([blob], file.name.replace(/\.\w+$/, ".webp"), { type: "image/webp" });
    }
  } catch {
    /* fall through: the server reports it */
  }
  return file;
}

/* ── Fields ─────────────────────────────────────────────────── */

function Text({
  label,
  value,
  onChange,
  max,
  hint,
  multiline = false,
  placeholder,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  max?: number;
  hint?: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const v = value ?? "";
  return (
    <label className="admin-field">
      <span>
        {label}
        {max ? <em className={v.length > max ? "over" : undefined}>{`${v.length}/${max}`}</em> : null}
      </span>
      {multiline ? (
        <textarea value={v} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} />
      ) : (
        <input value={v} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
      {hint ? <small>{hint}</small> : null}
    </label>
  );
}

function Select<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="admin-field">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

function ImageField({
  label,
  value,
  onChange,
  kind,
  optional = false,
}: {
  label: string;
  value: ImageRef | undefined;
  onChange: (v: ImageRef | undefined) => void;
  kind: "work" | "cover" | "client" | "bts";
  optional?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("file", await shrink(file));
    fd.set("kind", kind);
    const r = await uploadImage(fd);
    setBusy(false);
    if (input.current) input.current.value = "";
    if (r.ok) onChange(r.image);
    else setError(r.error);
  };
  return (
    <div className="admin-image">
      <span className="admin-image__label">{label}</span>
      <div className="admin-image__box" data-empty={!value || undefined}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element -- admin preview of the stored file
          <img src={value.src} alt="" />
        ) : (
          <span>NO IMAGE</span>
        )}
      </div>
      <div className="admin-image__row">
        <button type="button" className="admin-btn" onClick={() => input.current?.click()} disabled={busy}>
          {busy ? "UPLOADING…" : value ? "REPLACE" : "UPLOAD"}
        </button>
        {optional && value ? (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onChange(undefined)}>
            REMOVE
          </button>
        ) : null}
        {value && value.width ? <small>{`${value.width} × ${value.height}`}</small> : null}
      </div>
      {error ? <p className="admin-error">{error}</p> : null}
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
}

function RowTools({ onUp, onDown, onDelete, what }: { onUp: () => void; onDown: () => void; onDelete: () => void; what: string }) {
  return (
    <div className="admin-tools">
      <button type="button" className="admin-icon" onClick={onUp} aria-label={`Move ${what} up`}>
        ▲
      </button>
      <button type="button" className="admin-icon" onClick={onDown} aria-label={`Move ${what} down`}>
        ▼
      </button>
      <button type="button" className="admin-icon admin-icon--danger" onClick={() => confirm(`Delete ${what}?`) && onDelete()} aria-label={`Delete ${what}`}>
        ✕
      </button>
    </div>
  );
}

/** A list of short strings (paragraphs, pillars, hero words). */
function StringList({
  label,
  items,
  onChange,
  max,
  min = 0,
  multiline = false,
  hint,
}: {
  label: string;
  items: string[];
  onChange: (v: string[]) => void;
  max: number;
  min?: number;
  multiline?: boolean;
  hint?: string;
}) {
  return (
    <fieldset className="admin-list">
      <legend>{label}</legend>
      {hint ? <small>{hint}</small> : null}
      {items.map((v, i) => (
        <div key={i} className="admin-list__row">
          <Text label={`${pad(i + 1)}`} value={v} multiline={multiline} onChange={(nv) => onChange(items.map((x, j) => (j === i ? nv : x)))} />
          <RowTools
            what={`${label} ${i + 1}`}
            onUp={() => {
              const n = [...items];
              moveIn(n, i, -1);
              onChange(n);
            }}
            onDown={() => {
              const n = [...items];
              moveIn(n, i, 1);
              onChange(n);
            }}
            onDelete={() => items.length > min && onChange(items.filter((_, j) => j !== i))}
          />
        </div>
      ))}
      {items.length < max ? (
        <button type="button" className="admin-btn admin-btn--ghost" onClick={() => onChange([...items, ""])}>
          + ADD
        </button>
      ) : null}
    </fieldset>
  );
}

/* ── Tabs ───────────────────────────────────────────────────── */

function SiteTab({ doc, edit }: { doc: Content; edit: Edit }) {
  const s = doc.site;
  return (
    <div className="admin-grid">
      <section className="admin-card">
        <h2 className="admin-h">COPY</h2>
        <Text label="Role line (hero, page title)" value={s.role} max={48} onChange={(v) => edit((d) => void (d.site.role = v))} />
        <Text label="Contact line (above the envelope)" value={s.contactLine} max={80} onChange={(v) => edit((d) => void (d.site.contactLine = v))} />
        <Text label="Email" value={s.email} onChange={(v) => edit((d) => void (d.site.email = v))} />
        <StringList label="About (BTS)" items={s.about} max={3} min={1} multiline onChange={(v) => edit((d) => void (d.site.about = v))} hint="1–3 paragraphs, about 90 words in all." />
      </section>
      <section className="admin-card">
        <h2 className="admin-h">HERO</h2>
        <StringList
          label="TV words"
          items={s.heroNiches}
          max={8}
          min={1}
          onChange={(v) => edit((d) => void (d.site.heroNiches = v))}
          hint="CONTENT first. A word that matches a tape's niche opens that tape; any other opens /work."
        />
        <StringList label="Pillars (left TV, BTS chips)" items={s.pillars} max={5} min={1} onChange={(v) => edit((d) => void (d.site.pillars = v))} />
      </section>
      <section className="admin-card">
        <h2 className="admin-h">SOCIALS</h2>
        <small>Instagram and LinkedIn also get the hero&rsquo;s round buttons. Use full https:// links.</small>
        {s.socials.map((so, i) => (
          <div key={i} className="admin-row">
            <Text label="Label" value={so.label} onChange={(v) => edit((d) => void (d.site.socials[i].label = v))} />
            <Text label="Link" value={so.href} placeholder="https://…" onChange={(v) => edit((d) => void (d.site.socials[i].href = v))} />
            <Select
              label="Button"
              value={so.kind ?? "none"}
              options={["none", "instagram", "linkedin"] as const}
              onChange={(v) => edit((d) => void (d.site.socials[i].kind = v === "none" ? undefined : v))}
            />
            <RowTools
              what={`social ${so.label}`}
              onUp={() => edit((d) => moveIn(d.site.socials, i, -1))}
              onDown={() => edit((d) => moveIn(d.site.socials, i, 1))}
              onDelete={() => edit((d) => void d.site.socials.splice(i, 1))}
            />
          </div>
        ))}
        {s.socials.length < 5 ? (
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => edit((d) => void d.site.socials.push({ label: "", href: "https://" }))}>
            + ADD SOCIAL
          </button>
        ) : null}
      </section>
    </div>
  );
}

function ClientsTab({ doc, edit }: { doc: Content; edit: Edit }) {
  const up = (i: number, patch: Partial<Client>) => edit((d) => void Object.assign(d.clients[i], patch));
  return (
    <div className="admin-stack">
      <p className="admin-note">
        Shown on the Worked With reel. With a YouTube <code>@handle</code> and <code>YOUTUBE_API_KEY</code> set, the subscriber count is live (refreshed daily); otherwise the static line shows.
      </p>
      {doc.clients.map((c, i) => (
        <section key={i} className="admin-card admin-item">
          <ImageField label="Photo / logo (square)" kind="client" optional value={c.avatar} onChange={(v) => up(i, { avatar: v })} />
          <div className="admin-item__fields">
            <div className="admin-row">
              <Text label="Name" value={c.name} max={60} onChange={(v) => up(i, { name: v })} />
              <Text label="Role" value={c.role} max={40} placeholder="THUMBNAIL DESIGNER" onChange={(v) => up(i, { role: v })} />
            </div>
            <div className="admin-row">
              <Text label="YouTube @handle" value={c.channel} placeholder="@channel" onChange={(v) => up(i, { channel: v })} />
              <Text label="Subscribers (static)" value={c.meta} max={40} placeholder="4M+ SUBSCRIBERS" onChange={(v) => up(i, { meta: v })} />
              <Text label="Link" value={c.href} placeholder="https://youtube.com/@…" onChange={(v) => up(i, { href: v })} />
            </div>
            <Text label="Work — what was delivered" value={c.work} max={140} onChange={(v) => up(i, { work: v })} />
            <Text label="Result — as measured (never invented)" value={c.result} max={140} onChange={(v) => up(i, { result: v })} />
          </div>
          <RowTools
            what={`client ${c.name || i + 1}`}
            onUp={() => edit((d) => moveIn(d.clients, i, -1))}
            onDown={() => edit((d) => moveIn(d.clients, i, 1))}
            onDelete={() => edit((d) => void d.clients.splice(i, 1))}
          />
        </section>
      ))}
      <button type="button" className="admin-btn admin-btn--primary" onClick={() => edit((d) => void d.clients.push({ name: "" }))}>
        + ADD CLIENT
      </button>
    </div>
  );
}

function newItem(cat: Category): WorkItem {
  let n = cat.items.length + 1;
  while (cat.items.some((it) => it.slug === `${cat.id}-${pad(n)}`)) n++;
  return { slug: `${cat.id}-${pad(n)}`, title: "", alt: "", aspect: cat.items[0]?.aspect ?? "16 / 9", after: undefined as unknown as ImageRef };
}

function TapesTab({ doc, edit }: { doc: Content; edit: Edit }) {
  const [sel, setSel] = useState(0);
  const ci = Math.min(sel, doc.categories.length - 1);
  const cat = doc.categories[ci];
  const upCat = (patch: Partial<Category>) => edit((d) => void Object.assign(d.categories[ci], patch));
  const upItem = (i: number, patch: Partial<WorkItem>) => edit((d) => void Object.assign(d.categories[ci].items[i], patch));

  return (
    <div className="admin-tapes">
      <nav className="admin-card admin-tapes__list" aria-label="Tapes">
        <h2 className="admin-h">TAPES</h2>
        {doc.categories.map((c, i) => (
          <button key={i} type="button" className="admin-tape" aria-current={i === ci || undefined} onClick={() => setSel(i)}>
            <span>{c.label || "(new tape)"}</span>
            <em>{pad(c.items.length)}</em>
          </button>
        ))}
        <button
          type="button"
          className="admin-btn admin-btn--ghost"
          onClick={() => {
            edit((d) => void d.categories.push({ id: `tape-${d.categories.length + 1}`, label: "NEW TAPE", niche: "NEW", stripe: "orange", items: [] }));
            setSel(doc.categories.length);
          }}
        >
          + ADD TAPE
        </button>
      </nav>

      {cat ? (
        <div className="admin-stack">
          <section className="admin-card">
            <div className="admin-row admin-row--top">
              <h2 className="admin-h">{cat.label}</h2>
              <RowTools
                what={`the ${cat.label} tape and all its pieces`}
                onUp={() => {
                  edit((d) => moveIn(d.categories, ci, -1));
                  setSel(Math.max(0, ci - 1));
                }}
                onDown={() => {
                  edit((d) => moveIn(d.categories, ci, 1));
                  setSel(Math.min(doc.categories.length - 1, ci + 1));
                }}
                onDelete={() => {
                  edit((d) => void d.categories.splice(ci, 1));
                  setSel(0);
                }}
              />
            </div>
            <div className="admin-item">
              <ImageField label="Cover (16 : 9)" kind="cover" optional value={cat.cover} onChange={(v) => upCat({ cover: v })} />
              <div className="admin-item__fields">
                <div className="admin-row">
                  <Text label="Label" value={cat.label} max={24} onChange={(v) => upCat({ label: v })} />
                  <Text label="Hero TV word" value={cat.niche} max={12} onChange={(v) => upCat({ niche: v })} />
                  <Select label="Stripe" value={cat.stripe} options={STRIPES} onChange={(v) => upCat({ stripe: v })} />
                </div>
                <Text label="URL id" value={cat.id} hint={`/work/${cat.id || "…"} — lowercase and dashes; changing it changes the link.`} onChange={(v) => upCat({ id: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
              </div>
            </div>
          </section>

          {cat.items.map((it, i) => (
            <details key={`${ci}-${i}`} className="admin-card admin-piece" open={!it.after || undefined}>
              <summary>
                {it.after ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin preview
                  <img src={it.after.src} alt="" />
                ) : (
                  <span className="admin-piece__empty">NO IMAGE</span>
                )}
                <span className="admin-piece__title">{it.title || "(untitled)"}</span>
                {it.featured ? <span className="admin-badge">FEATURED</span> : null}
                {it.before ? <span className="admin-badge admin-badge--ghost">BEFORE / AFTER</span> : null}
              </summary>
              <div className="admin-item">
                <div className="admin-stack admin-stack--tight">
                  <ImageField label="After — the finished piece" kind="work" value={it.after} onChange={(v) => upItem(i, { after: v as ImageRef })} />
                  <ImageField label="Before — raw frame (same aspect)" kind="work" optional value={it.before} onChange={(v) => upItem(i, { before: v })} />
                </div>
                <div className="admin-item__fields">
                  <Text label="Title" value={it.title} max={60} onChange={(v) => upItem(i, { title: v })} />
                  <Text label="Alt text — describe the finished piece" value={it.alt} max={200} onChange={(v) => upItem(i, { alt: v })} />
                  <div className="admin-row">
                    <Text label="Client" value={it.client} max={60} onChange={(v) => upItem(i, { client: v })} />
                    <Select label="Aspect" value={it.aspect} options={ASPECTS} onChange={(v) => upItem(i, { aspect: v })} />
                    <Text label="Views (as supplied)" value={it.views} max={20} placeholder="1.2M" onChange={(v) => upItem(i, { views: v })} />
                  </div>
                  <div className="admin-row">
                    <Text label="Link to the video / post" value={it.href} placeholder="https://…" onChange={(v) => upItem(i, { href: v })} />
                    <Text label="Slug" value={it.slug} onChange={(v) => upItem(i, { slug: v.toLowerCase().replace(/[^a-z0-9-]/g, "-") })} />
                  </div>
                  <label className="admin-check">
                    <input type="checkbox" checked={Boolean(it.featured)} onChange={(e) => upItem(i, { featured: e.target.checked })} />
                    Feature full-width at the top of the home grid (needs a Before image)
                  </label>
                </div>
              </div>
              <RowTools
                what={`piece “${it.title || it.slug}”`}
                onUp={() => edit((d) => moveIn(d.categories[ci].items, i, -1))}
                onDown={() => edit((d) => moveIn(d.categories[ci].items, i, 1))}
                onDelete={() => edit((d) => void d.categories[ci].items.splice(i, 1))}
              />
            </details>
          ))}
          <button type="button" className="admin-btn admin-btn--primary" onClick={() => edit((d) => void d.categories[ci].items.push(newItem(d.categories[ci])))}>
            + ADD PIECE TO {cat.label}
          </button>
        </div>
      ) : (
        <p className="admin-note">No tapes yet — add one.</p>
      )}
    </div>
  );
}

function BtsTab({ doc, edit }: { doc: Content; edit: Edit }) {
  const photos = doc.site.btsPhotos;
  return (
    <div className="admin-stack">
      <p className="admin-note">Shown in the BTS tablet, one per scroll step. Portrait 4 : 5 works best.</p>
      <div className="admin-photos">
        {photos.map((p, i) => (
          <section key={i} className="admin-card admin-photo">
            <ImageField
              label={`Photo ${pad(i + 1)}`}
              kind="bts"
              value={p.src ? { src: p.src, width: 0, height: 0 } : undefined}
              onChange={(v) => edit((d) => void (d.site.btsPhotos[i].src = v?.src ?? ""))}
            />
            <Text label="Alt text" value={p.alt} max={200} onChange={(v) => edit((d) => void (d.site.btsPhotos[i].alt = v))} />
            <Text label="Caption" value={p.caption} max={60} onChange={(v) => edit((d) => void (d.site.btsPhotos[i].caption = v))} />
            <RowTools
              what={`photo ${i + 1}`}
              onUp={() => edit((d) => moveIn(d.site.btsPhotos, i, -1))}
              onDown={() => edit((d) => moveIn(d.site.btsPhotos, i, 1))}
              onDelete={() => edit((d) => void d.site.btsPhotos.splice(i, 1))}
            />
          </section>
        ))}
      </div>
      {photos.length < 24 ? (
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => edit((d) => void d.site.btsPhotos.push({ src: "", alt: "" }))}>
          + ADD PHOTO
        </button>
      ) : null}
    </div>
  );
}

/** "categories.2.items.3.after.src" → "Tapes › GAMING › piece 4 › after.src". */
function where(doc: Content, path: string) {
  const p = path.split(".");
  if (p[0] === "categories") {
    const cat = doc.categories[Number(p[1])];
    const head = `Tapes › ${cat?.label ?? `tape ${Number(p[1]) + 1}`}`;
    if (p[2] === "items") return `${head} › piece ${Number(p[3]) + 1} › ${p.slice(4).join(".")}`;
    return `${head} › ${p.slice(2).join(".")}`;
  }
  if (p[0] === "clients") return `Clients › ${doc.clients[Number(p[1])]?.name || `client ${Number(p[1]) + 1}`} › ${p.slice(2).join(".")}`;
  if (p[1] === "btsPhotos") return `BTS › photo ${Number(p[2]) + 1} › ${p.slice(3).join(".")}`;
  return `Site › ${p.slice(1).join(".")}`;
}

/* ── App ────────────────────────────────────────────────────── */

export function AdminApp({ initial }: { initial: Content }) {
  const [saved, setSaved] = useState(initial);
  const [doc, setDoc] = useState(() => structuredClone(initial));
  const [tab, setTab] = useState<Tab>("site");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState("");
  const [saving, start] = useTransition();
  const dirty = useMemo(() => JSON.stringify(doc) !== JSON.stringify(saved), [doc, saved]);

  const edit: Edit = (fn) =>
    setDoc((prev) => {
      const next = structuredClone(prev);
      fn(next);
      return next;
    });

  const save = () =>
    start(async () => {
      setStatus("SAVING…");
      const r = await saveContent(doc);
      if (r.ok) {
        setSaved(r.content);
        setDoc(structuredClone(r.content));
        setIssues([]);
        setStatus(`SAVED ${new Date(r.savedAt).toLocaleTimeString()} — LIVE ON THE SITE`);
      } else {
        setIssues(r.issues);
        setStatus("NOT SAVED — FIX THE FIELDS LISTED BELOW");
      }
    });

  // Ctrl / ⌘ + S saves; leaving with unsaved changes asks first.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "site", label: "SITE" },
    { id: "clients", label: "CLIENTS", count: doc.clients.length },
    { id: "tapes", label: "TAPES", count: doc.categories.reduce((n, c) => n + c.items.length, 0) },
    { id: "bts", label: "BTS PHOTOS", count: doc.site.btsPhotos.length },
  ];

  return (
    <div className="admin">
      <p className="admin-mobile">The admin works on a desktop or laptop screen (1024 px or wider).</p>
      <div className="admin-app">
        <header className="admin-bar">
          <p className="admin-osd">
            <span className="admin-rec" aria-hidden="true" /> TAPE 01 — ADMIN
          </p>
          <nav className="admin-tabs" aria-label="Sections">
            {tabs.map((t) => (
              <button key={t.id} type="button" aria-pressed={tab === t.id} onClick={() => setTab(t.id)}>
                {t.label}
                {t.count !== undefined ? <em>{pad(t.count)}</em> : null}
              </button>
            ))}
          </nav>
          <div className="admin-bar__actions">
            <span className="admin-status" aria-live="polite">
              {status || (dirty ? "UNSAVED CHANGES" : "ALL SAVED")}
            </span>
            <button type="button" className="admin-btn admin-btn--ghost" disabled={!dirty || saving} onClick={() => confirm("Discard all unsaved changes?") && setDoc(structuredClone(saved))}>
              DISCARD
            </button>
            <button type="button" className="admin-btn admin-btn--primary" disabled={!dirty || saving} onClick={save}>
              {saving ? "SAVING…" : "SAVE ▶"}
            </button>
            <a className="admin-btn admin-btn--ghost" href="/" target="_blank" rel="noopener">
              VIEW SITE ↗
            </a>
            <form action={logout}>
              <button type="submit" className="admin-btn admin-btn--ghost">
                SIGN OUT
              </button>
            </form>
          </div>
        </header>

        {issues.length ? (
          <div className="admin-issues" role="alert">
            <p>Not saved. Fix these, then save again:</p>
            <ul>
              {issues.map((i, k) => (
                <li key={k}>
                  <strong>{where(doc, i.path)}</strong> — {i.message}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <main className="admin-main">
          {tab === "site" ? <SiteTab doc={doc} edit={edit} /> : null}
          {tab === "clients" ? <ClientsTab doc={doc} edit={edit} /> : null}
          {tab === "tapes" ? <TapesTab doc={doc} edit={edit} /> : null}
          {tab === "bts" ? <BtsTab doc={doc} edit={edit} /> : null}
        </main>
      </div>
    </div>
  );
}
