import { useEffect, useState } from 'react';
import {
  createNote,
  guessValvesFromLabel,
  type Song,
  type TabNote,
  type Valves,
} from '../types';

interface UseNotesEditorOptions {
  activeSong: Song | null;
  activeId: string | null;
  updateActive: (patch: Partial<Song>) => void;
}

export function useNotesEditor({ activeSong, activeId, updateActive }: UseNotesEditorOptions) {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [draftValves, setDraftValves] = useState<Valves>([false, false, false]);
  const [draftLabel, setDraftLabel] = useState('');

  const selectedNote = activeSong?.notes.find((n) => n.id === selectedNoteId) ?? null;

  useEffect(() => {
    setSelectedNoteId(null);
  }, [activeId]);

  const updateNote = (id: string, patch: Partial<TabNote>) => {
    if (!activeSong) return;
    const notes = activeSong.notes.map((n) => {
      if (n.id !== id) return n;
      const updated = { ...n, ...patch };
      if (patch.label !== undefined) {
        const hint = guessValvesFromLabel(patch.label);
        if (hint && patch.valves === undefined) updated.valves = [...hint] as Valves;
      }
      return updated;
    });
    updateActive({ notes });
  };

  const addNote = () => {
    if (!activeSong) return;
    const hint = guessValvesFromLabel(draftLabel);
    const note = createNote({
      label: draftLabel,
      valves: hint ? ([...hint] as Valves) : ([...draftValves] as Valves),
    });
    updateActive({ notes: [...activeSong.notes, note] });
    setSelectedNoteId(note.id);
    setDraftLabel('');
    setDraftValves([false, false, false]);
  };

  const deleteNote = (id: string) => {
    if (!activeSong) return;
    updateActive({ notes: activeSong.notes.filter((n) => n.id !== id) });
    if (selectedNoteId === id) setSelectedNoteId(null);
  };

  const moveNote = (id: string, direction: -1 | 1) => {
    if (!activeSong) return;
    const idx = activeSong.notes.findIndex((n) => n.id === id);
    const target = idx + direction;
    if (idx < 0 || target < 0 || target >= activeSong.notes.length) return;
    const notes = [...activeSong.notes];
    [notes[idx], notes[target]] = [notes[target], notes[idx]];
    updateActive({ notes });
  };

  const handleDraftLabelChange = (label: string) => {
    setDraftLabel(label);
    const hint = guessValvesFromLabel(label);
    if (hint) setDraftValves([...hint] as Valves);
  };

  return {
    selectedNoteId,
    setSelectedNoteId,
    selectedNote,
    draftValves,
    setDraftValves,
    draftLabel,
    handleDraftLabelChange,
    updateNote,
    addNote,
    deleteNote,
    moveNote,
  };
}
