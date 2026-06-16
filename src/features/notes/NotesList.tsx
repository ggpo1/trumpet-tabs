import { NoteCard } from '../../components/NoteCard';
import type { TabNote } from '../../types';

interface NotesListProps {
  notes: TabNote[];
  selectedNoteId: string | null;
  playingNoteId: string | null;
  onSelect: (id: string) => void;
  onUpdate: (id: string, patch: Partial<TabNote>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
}

export function NotesList({
  notes,
  selectedNoteId,
  playingNoteId,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
}: NotesListProps) {
  return (
    <section className="notes-list">
      <h2>Ноты ({notes.length})</h2>
      {notes.length === 0 ? (
        <p className="empty-notes">Пока нет нот — добавьте первую через панель выше</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note, index) => (
            <NoteCard
              key={note.id}
              note={note}
              index={index}
              selected={selectedNoteId === note.id}
              playing={playingNoteId === note.id}
              onSelect={() => onSelect(note.id)}
              onUpdate={(patch) => onUpdate(note.id, patch)}
              onDelete={() => onDelete(note.id)}
              onMoveUp={() => onMove(note.id, -1)}
              onMoveDown={() => onMove(note.id, 1)}
              canMoveUp={index > 0}
              canMoveDown={index < notes.length - 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}
