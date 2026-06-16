import { ValvePanel } from '../../components/ValvePanel';
import type { Valves } from '../../types';

interface QuickAddNoteProps {
  draftLabel: string;
  draftValves: Valves;
  onLabelChange: (label: string) => void;
  onValvesChange: (valves: Valves) => void;
  onAdd: () => void;
}

export function QuickAddNote({
  draftLabel,
  draftValves,
  onLabelChange,
  onValvesChange,
  onAdd,
}: QuickAddNoteProps) {
  return (
    <section className="quick-add">
      <h2>Быстрое добавление ноты</h2>
      <p className="hint">
        Нажмите клапаны 1–3 или введите ноту (до, ре, G…) — подставится стандартная аппликатура Bb-трубы
      </p>
      <div className="quick-add__row">
        <input
          type="text"
          placeholder="Нота (необязательно)"
          value={draftLabel}
          onChange={(e) => onLabelChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <ValvePanel valves={draftValves} onChange={onValvesChange} />
        <button type="button" className="btn btn--primary" onClick={onAdd}>
          + Добавить ноту
        </button>
      </div>
    </section>
  );
}
