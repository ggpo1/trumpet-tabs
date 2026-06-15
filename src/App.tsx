import { useCallback, useEffect, useRef, useState } from 'react';
import { NoteCard } from './components/NoteCard';
import { SequenceStrip } from './components/SequenceStrip';
import { ValvePanel } from './components/ValvePanel';
import {
  exportSongJson,
  importSongJson,
  loadSongs,
  saveSongs,
} from './storage';
import {
  createNote,
  createSong,
  guessValvesFromLabel,
  type Song,
  type TabNote,
  type Valves,
} from './types';

function useSongs() {
  const [songs, setSongs] = useState<Song[]>(() => loadSongs());
  const [activeId, setActiveId] = useState<string | null>(() => loadSongs()[0]?.id ?? null);

  useEffect(() => {
    saveSongs(songs);
  }, [songs]);

  const activeSong = songs.find((s) => s.id === activeId) ?? null;

  const updateActive = useCallback(
    (patch: Partial<Song>) => {
      if (!activeId) return;
      setSongs((prev) =>
        prev.map((s) =>
          s.id === activeId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
        ),
      );
    },
    [activeId],
  );

  const createNewSong = () => {
    const song = createSong();
    setSongs((prev) => [song, ...prev]);
    setActiveId(song.id);
  };

  const deleteSong = (id: string) => {
    setSongs((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const duplicateSong = (song: Song) => {
    const copy = createSong({
      ...song,
      title: `${song.title} (копия)`,
      notes: song.notes.map((n) => ({ ...n, id: crypto.randomUUID() })),
    });
    setSongs((prev) => [copy, ...prev]);
    setActiveId(copy.id);
  };

  return {
    songs,
    activeSong,
    activeId,
    setActiveId,
    updateActive,
    createNewSong,
    deleteSong,
    duplicateSong,
    importSong: (song: Song) => {
      setSongs((prev) => [song, ...prev]);
      setActiveId(song.id);
    },
  };
}

export default function App() {
  const {
    songs,
    activeSong,
    activeId,
    setActiveId,
    updateActive,
    createNewSong,
    deleteSong,
    duplicateSong,
    importSong,
  } = useSongs();

  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [playingNoteId, setPlayingNoteId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [draftValves, setDraftValves] = useState<Valves>([false, false, false]);
  const [draftLabel, setDraftLabel] = useState('');
  const playTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedNote = activeSong?.notes.find((n) => n.id === selectedNoteId) ?? null;

  useEffect(() => {
    return () => {
      if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setSelectedNoteId(null);
    setPlayingNoteId(null);
    setIsPlaying(false);
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
      valves: hint ? ([...hint] as Valves) : [...draftValves] as Valves,
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

  const durationMs = (duration: TabNote['duration'], tempo: number) => {
    const beat = 60000 / tempo;
    const map = { eighth: 0.5, quarter: 1, half: 2, whole: 4 };
    return beat * map[duration];
  };

  const stopPlayback = () => {
    if (playTimerRef.current) window.clearTimeout(playTimerRef.current);
    setIsPlaying(false);
    setPlayingNoteId(null);
  };

  const playSequence = () => {
    if (!activeSong || activeSong.notes.length === 0 || isPlaying) return;
    setIsPlaying(true);
    let i = 0;

    const step = () => {
      const note = activeSong.notes[i];
      if (!note) {
        stopPlayback();
        return;
      }
      setPlayingNoteId(note.id);
      setSelectedNoteId(note.id);
      const ms = durationMs(note.duration, activeSong.tempo);
      playTimerRef.current = window.setTimeout(() => {
        i += 1;
        if (i >= activeSong.notes.length) stopPlayback();
        else step();
      }, ms);
    };

    step();
  };

  const handleExport = () => {
    if (!activeSong) return;
    const blob = new Blob([exportSongJson(activeSong)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeSong.title.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const song = importSongJson(String(reader.result));
        importSong(song);
      } catch {
        alert('Не удалось импортировать файл');
      }
    };
    reader.readAsText(file);
  };

  if (!activeSong && songs.length === 0) {
    return (
      <div className="app app--empty">
        <header className="hero">
          <h1>Trumpet Tabs</h1>
          <p>Редактор аппликатуры для трубы — отмечайте клапаны и собирайте песни</p>
          <button type="button" className="btn btn--primary" onClick={createNewSong}>
            Создать первую песню
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__head">
          <h1>Trumpet Tabs</h1>
          <button type="button" className="btn btn--small btn--primary" onClick={createNewSong}>
            + Новая
          </button>
        </div>

        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.id}>
              <button
                type="button"
                className={`song-item ${song.id === activeId ? 'song-item--active' : ''}`}
                onClick={() => setActiveId(song.id)}
              >
                <span className="song-item__title">{song.title}</span>
                <span className="song-item__meta">
                  {song.notes.length} нот · {song.tempo} BPM
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="workspace">
        {activeSong && (
          <>
            <header className="song-header">
              <div className="song-header__fields">
                <input
                  className="song-title-input"
                  value={activeSong.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Название песни"
                />
                <input
                  className="song-artist-input"
                  value={activeSong.artist}
                  onChange={(e) => updateActive({ artist: e.target.value })}
                  placeholder="Исполнитель"
                />
              </div>
              <div className="song-header__controls">
                <label className="tempo-field">
                  <span>BPM</span>
                  <input
                    type="number"
                    min={40}
                    max={240}
                    value={activeSong.tempo}
                    onChange={(e) => updateActive({ tempo: Number(e.target.value) || 100 })}
                  />
                </label>
                <button
                  type="button"
                  className="btn"
                  onClick={isPlaying ? stopPlayback : playSequence}
                  disabled={activeSong.notes.length === 0}
                >
                  {isPlaying ? 'Стоп' : '▶ Проиграть'}
                </button>
                <button type="button" className="btn" onClick={handleExport}>
                  Экспорт
                </button>
                <button type="button" className="btn" onClick={() => fileInputRef.current?.click()}>
                  Импорт
                </button>
                <button type="button" className="btn" onClick={() => duplicateSong(activeSong)}>
                  Копия
                </button>
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => {
                    if (confirm('Удалить эту песню?')) deleteSong(activeSong.id);
                  }}
                >
                  Удалить
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,application/json"
                  hidden
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImport(file);
                    e.target.value = '';
                  }}
                />
              </div>
            </header>

            <SequenceStrip
              notes={activeSong.notes}
              selectedId={selectedNoteId}
              playingId={playingNoteId}
              onSelect={setSelectedNoteId}
            />

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
                  onChange={(e) => {
                    const label = e.target.value;
                    setDraftLabel(label);
                    const hint = guessValvesFromLabel(label);
                    if (hint) setDraftValves([...hint] as Valves);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && addNote()}
                />
                <ValvePanel valves={draftValves} onChange={setDraftValves} />
                <button type="button" className="btn btn--primary" onClick={addNote}>
                  + Добавить ноту
                </button>
              </div>
            </section>

            {selectedNote && (
              <section className="selected-preview">
                <h3>Выбранная нота</h3>
                <ValvePanel
                  valves={selectedNote.valves}
                  onChange={(valves) => updateNote(selectedNote.id, { valves })}
                  size="lg"
                />
              </section>
            )}

            <section className="notes-list">
              <h2>Ноты ({activeSong.notes.length})</h2>
              {activeSong.notes.length === 0 ? (
                <p className="empty-notes">Пока нет нот — добавьте первую через панель выше</p>
              ) : (
                <div className="notes-grid">
                  {activeSong.notes.map((note, index) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      index={index}
                      selected={selectedNoteId === note.id}
                      playing={playingNoteId === note.id}
                      onSelect={() => setSelectedNoteId(note.id)}
                      onUpdate={(patch) => updateNote(note.id, patch)}
                      onDelete={() => deleteNote(note.id)}
                      onMoveUp={() => moveNote(note.id, -1)}
                      onMoveDown={() => moveNote(note.id, 1)}
                      canMoveUp={index > 0}
                      canMoveDown={index < activeSong.notes.length - 1}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className="reference">
              <h2>Справка: клапаны Bb-трубы</h2>
              <div className="reference-grid">
                {[
                  ['до / C', '○'],
                  ['ре / D', '1'],
                  ['ми / E', '1+2'],
                  ['фа / F', '1'],
                  ['соль / G', '○'],
                  ['ля / A', '1+2'],
                  ['си / B', '2'],
                ].map(([note, fingering]) => (
                  <div key={note} className="reference-item">
                    <span>{note}</span>
                    <strong>{fingering}</strong>
                  </div>
                ))}
              </div>
              <p className="hint">○ — все клапаны открыты. Цифры — зажатые клапаны.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
