import { ValvePanel } from '../../components/ValvePanel';
import type { TabNote, Valves } from '../../types';

interface SelectedNotePreviewProps {
  note: TabNote;
  onPreview: () => void;
  onValvesChange: (valves: Valves) => void;
}

export function SelectedNotePreview({ note, onPreview, onValvesChange }: SelectedNotePreviewProps) {
  return (
    <section className="selected-preview">
      <div className="selected-preview__head">
        <h3>Выбранная нота</h3>
        <button type="button" className="btn btn--small" onClick={onPreview}>
          ♪ Послушать
        </button>
      </div>
      <ValvePanel valves={note.valves} onChange={onValvesChange} size="lg" />
    </section>
  );
}
