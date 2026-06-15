import type { TabNote } from '../types';
import { DURATION_LABELS } from '../types';
import { ValvePanel } from './ValvePanel';

interface NoteCardProps {
  note: TabNote;
  index: number;
  selected: boolean;
  playing: boolean;
  onSelect: () => void;
  onUpdate: (patch: Partial<TabNote>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function NoteCard({
  note,
  index,
  selected,
  playing,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: NoteCardProps) {
  return (
    <article
      className={`note-card ${selected ? 'note-card--selected' : ''} ${playing ? 'note-card--playing' : ''}`}
      onClick={onSelect}
    >
      <div className="note-card__index">{index + 1}</div>

      <div className="note-card__body" onClick={(e) => e.stopPropagation()}>
        <div className="note-card__row">
          <label className="field">
            <span>Нота</span>
            <input
              type="text"
              value={note.label}
              placeholder="G, до, ми..."
              onChange={(e) => onUpdate({ label: e.target.value })}
            />
          </label>
          <label className="field field--narrow">
            <span>Длит.</span>
            <select
              value={note.duration}
              onChange={(e) => onUpdate({ duration: e.target.value as TabNote['duration'] })}
            >
              {Object.entries(DURATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="field">
          <span>Текст / слог</span>
          <input
            type="text"
            value={note.lyric}
            placeholder="слово из песни..."
            onChange={(e) => onUpdate({ lyric: e.target.value })}
          />
        </label>

        <ValvePanel
          valves={note.valves}
          onChange={(valves) => onUpdate({ valves })}
          size="sm"
        />
      </div>

      <div className="note-card__actions" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="icon-btn" onClick={onMoveUp} disabled={!canMoveUp} title="Выше">
          ↑
        </button>
        <button type="button" className="icon-btn" onClick={onMoveDown} disabled={!canMoveDown} title="Ниже">
          ↓
        </button>
        <button type="button" className="icon-btn icon-btn--danger" onClick={onDelete} title="Удалить">
          ×
        </button>
      </div>
    </article>
  );
}
