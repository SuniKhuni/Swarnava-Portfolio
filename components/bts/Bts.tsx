import type { BtsPhoto } from "@/content/types";
import { Rise } from "../fx/Rise";
import { LineReveal } from "../fx/LineReveal";
import { OsdChip } from "../ui/OsdChip";
import { Button } from "../ui/Button";
import { BtsDeck } from "./BtsDeck";

// The three book spines from the hero art.
const PILLARS = ["DESIGN", "ARTIFICIAL INTELLIGENCE", "CREATIVITY"];

/** CH 02 — about the person, inside the TV the Dive just entered (§9.2). */
export function Bts({ about, photos }: { about: string[]; photos: BtsPhoto[] }) {
  return (
    <section
      id="bts"
      tabIndex={-1}
      className="bts scene"
      data-scene="signal"
      data-channel="02"
      data-channel-label="BTS"
      aria-labelledby="bts-title"
      style={{ "--photos": Math.max(1, photos.length) } as React.CSSProperties}
    >
      <div className="bts__texture" aria-hidden="true" />
      {/* Desktop: the whole screen holds still while scrolling deals the photos (bts.css). */}
      <div className="bts__pin">
      <div className="wrap bts__grid">
        <div className="bts__copy">
          <h2 id="bts-title" className="bts__title t-mega" aria-label="Behind the scenes — about">
            <Rise text="BTS." stagger="bts" />
          </h2>
          <LineReveal
            paragraphs={about}
            className="t-lead bts__para"
            after={
              <>
                <ul className="bts__pillars" aria-label="Pillars">
                  {PILLARS.map((p, i) => (
                    <li key={p} style={{ "--i": i } as React.CSSProperties}>
                      <OsdChip tone="ink">{p}</OsdChip>
                    </li>
                  ))}
                </ul>
                <Button variant="ghost" href="#work" icon="arrow-up-right" iconTurn={90}>
                  SEE THE WORK
                </Button>
              </>
            }
          />
        </div>
      </div>
      <BtsDeck photos={photos} />
      </div>
    </section>
  );
}
