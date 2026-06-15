import type { TabNote } from '../types';
import { valvesToString } from '../types';

interface SequenceStripProps {
  notes: TabNote[];
  selectedId: string | null;
  playingId: string | null;
  onSelect: (id: string) => void;
}

export function SequenceStrip({ notes, selectedId, playingId, onSelect }: SequenceStripProps) {
  if (notes.length === 0) {
    return (
      <div className="sequence-strip sequence-strip--empty">
        Добавьте ноты — здесь появится схема аппликатуры
      </div>
    );
  }

  return (
    <div className="sequence-strip">
      {notes.map((note, i) => (
        <button
          key={note.id}
          type="button"
          className={[
            'sequence-chip',
            selectedId === note.id ? 'sequence-chip--selected' : '',
            playingId === note.id ? 'sequence-chip--playing' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          onClick={() => onSelect(note.id)}
          title={note.label || `Нота ${i + 1}`}
        >
          <span className="sequence-chip__label">{note.label || '—'}</span>
          <span className="sequence-chip__valves">{valvesToString(note.valves)}</span>
          {note.lyric && <span className="sequence-chip__lyric">{note.lyric}</span>}
        </button>
      ))}
    </div>
  );
}
