import { getSite } from "@/content/store";
import { OsdChip } from "../ui/OsdChip";
import { Icon } from "../ui/Icon";
import { RewindButton } from "./RewindButton";
import { FooterNav } from "./FooterNav";

// The tape-label colours as a strip of test bars: the signal ends here.
const BARS = ["cream", "mustard", "pink", "orange", "red", "blue", "gray"] as const;

/** END OF TAPE (§8.5). Night scene, closing the contact section. */
export async function Footer() {
  const site = await getSite();
  const year = new Date().getFullYear();
  return (
    <footer className="footer scene ambient" data-scene="night">
      <div className="footer__bars" aria-hidden="true">
        {BARS.map((b) => (
          <span key={b} data-bar={b} />
        ))}
      </div>
      <div className="wrap footer__inner">
        <div className="footer__row footer__row--top">
          <div className="footer__transport">
            <OsdChip tone="paper">
              <Icon name="stop" size="0.7em" /> STOP
            </OsdChip>
            <RewindButton />
          </div>
          <FooterNav />
        </div>
        {/* The words fill in as they scroll into view (chrome.css): the tape running out. */}
        <p className="footer__end" aria-label="End of tape">
          END OF TAPE
        </p>
        <div className="footer__row footer__row--meta">
          <ul className="footer__socials">
            {site.socials.map((s) => (
              <li key={s.label}>
                <a href={s.href}>{s.label}</a>
              </li>
            ))}
          </ul>
          <p className="t-small">© {year} Swarnava Chakraborty</p>
        </div>
      </div>
    </footer>
  );
}
