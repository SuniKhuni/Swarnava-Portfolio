import { getSite } from "@/content/store";
import Envelope from "./Envelope";

/** CH 04 — the ask. Shared by /, /work and /work/[category] (§9.7). */
export async function Contact() {
  const site = await getSite();
  const hasBackend = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);
  return (
    <section id="contact" className="contact scene" data-scene="night" data-channel="04" data-channel-label="CONTACT" aria-labelledby="contact-title">
      <div className="contact__col">
        <p className="t-osd-lg contact__caption">CH 04 — LEAVE A MESSAGE</p>
        <p className="t-lead contact__line">{site.contactLine}</p>
        <Envelope hasBackend={hasBackend} email={site.email} />
        <ul className="contact__direct">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          {site.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href}>{s.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
