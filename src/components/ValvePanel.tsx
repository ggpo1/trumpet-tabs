import type { Valves } from '../types';
import { valvesToString } from '../types';

interface ValvePanelProps {
  valves: Valves;
  onChange: (valves: Valves) => void;
  size?: 'sm' | 'lg';
  readOnly?: boolean;
}

export function ValvePanel({ valves, onChange, size = 'lg', readOnly = false }: ValvePanelProps) {
  const toggle = (index: number) => {
    if (readOnly) return;
    const next: Valves = [...valves] as Valves;
    next[index] = !next[index];
    onChange(next);
  };

  return (
    <div className={`valve-panel valve-panel--${size}`}>
      <div className="valve-panel__code">{valvesToString(valves)}</div>
      <div className="valve-panel__buttons">
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            type="button"
            className={`valve-btn ${valves[i] ? 'valve-btn--pressed' : ''}`}
            onClick={() => toggle(i)}
            disabled={readOnly}
            aria-label={`Клапан ${i + 1}${valves[i] ? ', зажат' : ', открыт'}`}
            aria-pressed={valves[i]}
          >
            <span className="valve-btn__num">{i + 1}</span>
            <span className="valve-btn__stem" />
          </button>
        ))}
      </div>
    </div>
  );
}
