import Image from "next/image";
import type { Client } from "@/content/types";
import { compactCount, subscriberCounts } from "@/lib/youtube";
import { Icon } from "../ui/Icon";
import { MarqueeGroup, MarqueePauseButton, MarqueeRow } from "../work/MarqueeRow";

const initials = (name: string) =>
  name
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

/** One client as a VHS sleeve: a halftone portrait in a torn orange frame, the channel's
 *  subscriber count (live from YouTube when a key and @handle are set), what was delivered
 *  and what it did. */
function TapeCard({ client, index, subs }: { client: Client; index: number; subs?: number }) {
  const live = subs !== undefined;
  const subsLine = live ? `${compactCount(subs)} SUBSCRIBERS` : client.meta;
  return (
    <article className="tape-card" data-tilt={index % 2 ? "right" : "left"} data-marquee-item>
      <header className="tape-card__osd" aria-hidden="true">
        <span>
          <Icon name="play" size="0.75em" /> {10 + index}A
        </span>
        <span className="tape-card__rec" data-live={live || undefined}>
          <Icon name="rec" size="0.75em" /> {live ? "LIVE" : "SP"}
        </span>
      </header>
      <div className="tape-card__photo">
        <span className="tape-card__tear" aria-hidden="true" />
        <span className="tape-card__frame">
          {client.avatar ? (
            <Image src={client.avatar.src} alt="" width={240} height={240} sizes="240px" />
          ) : (
            <span className="tape-card__initials" aria-hidden="true">
              {initials(client.name)}
            </span>
          )}
        </span>
      </div>
      <div className="tape-card__label">
        <h3 className="tape-card__name">{client.name}</h3>
        {client.role ? <p className="tape-card__role">{client.role}</p> : null}
        {subsLine ? <p className="tape-card__subs">{subsLine}</p> : null}
        {client.work || client.result ? (
          <dl className="tape-card__log">
            {client.work ? (
              <div>
                <dt>WORK</dt>
                <dd>{client.work}</dd>
              </div>
            ) : null}
            {client.result ? (
              <div>
                <dt>RESULT</dt>
                <dd>{client.result}</dd>
              </div>
            ) : null}
          </dl>
        ) : null}
        {client.href ? (
          <a className="tape-card__link" href={client.href} target="_blank" rel="noopener noreferrer">
            VISIT CHANNEL <Icon name="arrow-up-right" size="0.9em" />
            <span className="sr-only"> — {client.name} (opens in a new tab)</span>
          </a>
        ) : null}
      </div>
    </article>
  );
}

/** Worked with — the channels, on an endless reel of VHS sleeves (§9.3). */
export async function Clients({ clients }: { clients: Client[] }) {
  if (clients.length === 0) return null;
  const counts = await subscriberCounts(clients.flatMap((c) => (c.channel ? [c.channel] : [])));
  const cards = clients.map((c, i) => <TapeCard key={c.name} client={c} index={i} subs={c.channel ? counts[c.channel] : undefined} />);
  const moving = clients.length >= 4;

  return (
    <section id="clients" className="clients scene" data-scene="night" aria-labelledby="worked-with">
      <MarqueeGroup>
        <div className="wrap clients__head">
          <p className="clients__osd" aria-hidden="true">
            <Icon name="rec" size="0.8em" className="clients__rec" /> REC · CLIENT TAPES
          </p>
          <div className="clients__disco" aria-hidden="true">
            <span className="clients__disco-ball" />
          </div>
          <h2 id="worked-with" className="clients__title t-section">
            WORKED <em>WITH</em>
          </h2>
          <p className="clients__lede t-lead">The channels I design for — what I made for them, and what it did.</p>
          {moving ? (
            <div className="clients__pause">
              <MarqueePauseButton what="the client reel" />
            </div>
          ) : null}
        </div>
        {moving ? (
          <MarqueeRow label="Clients" className="clients__reel">
            {cards}
          </MarqueeRow>
        ) : (
          <div className="clients__reel clients__reel--static" role="list" aria-label="Clients">
            {cards}
          </div>
        )}
      </MarqueeGroup>
    </section>
  );
}
