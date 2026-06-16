import type { Valves } from "../types";

interface ValvePanelProps {
  valves: Valves;
  onChange: (valves: Valves) => void;
  size?: "sm" | "lg";
  readOnly?: boolean;
}

export function ValvePanel({ valves, onChange, size = "lg", readOnly = false }: ValvePanelProps) {
  const toggle = (index: number) => {
    if (readOnly) return;
    const next: Valves = [...valves] as Valves;
    next[index] = !next[index];
    onChange(next);
  };

  return (
    <div className={`valve-panel valve-panel--${size}`}>
      <div className="valve-panel__buttons">
        {[0, 1, 2].map((i) => {
          const isPressed = valves[i];
          const num = (
            <span key={`num-${i}`} className={`valve-btn__num ${isPressed ? "valve-btn__num--pressed" : ""}`}>
              {i + 1}
            </span>
          );
          const stem = <span key={`stem-${i}`} className="valve-btn__stem" />;
          const components = isPressed ? [num, stem] : [stem, num];

          return (
            <button
              key={i}
              type="button"
              className={`valve-btn ${isPressed ? "valve-btn--pressed" : ""}`}
              onClick={() => toggle(i)}
              disabled={readOnly}
              aria-label={`Клапан ${i + 1}${isPressed ? ", зажат" : ", открыт"}`}
              aria-pressed={isPressed}
            >
              {components}
            </button>
          );
        })}
      </div>
    </div>
  );
}
