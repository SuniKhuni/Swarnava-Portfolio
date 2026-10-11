import { getSite } from "@/content/store";
import { OsdChip } from "../ui/OsdChip";
import { Icon } from "../ui/Icon";
import { RewindButton } from "./RewindButton";

/** END OF TAPE (§8.5). Night scene, closing the contact section. */
export async function Footer() {
  const site = await getSite();
  const year = new Date().getFullYear();
  return (
    <footer className="footer scene" data-scene="night">
      <div className="wrap footer__inner">
        <p className="footer__end t-section" aria-label="End of tape">
          END OF TAPE
        </p>
        <div className="footer__row">
          <OsdChip tone="paper">
            <Icon name="stop" size="0.7em" /> STOP
          </OsdChip>
          <RewindButton />
        </div>
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
