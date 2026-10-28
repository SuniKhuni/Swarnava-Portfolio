import type { ReactNode } from "react";
import { Icon } from "../ui/Icon";

type MonitorProps = {
  rec?: boolean;
  label?: string;
  counter?: ReactNode;
  empty?: boolean;
  hideOsd?: boolean;
  children?: ReactNode;
};

/** The owner's tablet as a field monitor (§7.5). Pure CSS; the OSD is decorative. */
export function Monitor({ rec = true, label = "BTS", counter, empty = false, hideOsd = false, children }: MonitorProps) {
  return (
    <div className="monitor">
      <div className="monitor__screen">
        {empty ? <p className="monitor__empty">NO TAPE</p> : children}
        {!hideOsd ? (
          <div className="monitor__osd" aria-hidden="true">
            <span className="monitor__corner monitor__corner--tl" />
            <span className="monitor__corner monitor__corner--tr" />
            <span className="monitor__corner monitor__corner--bl" />
            <span className="monitor__corner monitor__corner--br" />
            {rec ? (
              <span className="monitor__rec">
                REC <Icon name="rec" size="0.8em" className="monitor__dot" />
              </span>
            ) : null}
            <Icon name="battery" size={28} className="monitor__battery" />
            <span className="monitor__label">{label}</span>
            {counter ? <span className="monitor__counter">{counter}</span> : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
