import type { RefObject } from 'react';
import type { Song } from '../../types';

interface SongHeaderProps {
  song: Song;
  isPlaying: boolean;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onUpdate: (patch: Partial<Song>) => void;
  onPlay: () => void;
  onStop: () => void;
  onExport: () => void;
  onImportClick: () => void;
  onImportFile: (file: File) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function SongHeader({
  song,
  isPlaying,
  fileInputRef,
  onUpdate,
  onPlay,
  onStop,
  onExport,
  onImportClick,
  onImportFile,
  onDuplicate,
  onDelete,
}: SongHeaderProps) {
  return (
    <header className="song-header">
      <div className="song-header__fields">
        <input
          className="song-title-input"
          value={song.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Название песни"
        />
        <input
          className="song-artist-input"
          value={song.artist}
          onChange={(e) => onUpdate({ artist: e.target.value })}
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
            value={song.tempo}
            onChange={(e) => onUpdate({ tempo: Number(e.target.value) || 100 })}
          />
        </label>
        <button
          type="button"
          className="btn"
          onClick={isPlaying ? onStop : onPlay}
          disabled={song.notes.length === 0}
        >
          {isPlaying ? 'Стоп' : '▶ Проиграть'}
        </button>
        <button type="button" className="btn" onClick={onExport}>
          Экспорт
        </button>
        <button type="button" className="btn" onClick={onImportClick}>
          Импорт
        </button>
        <button type="button" className="btn" onClick={onDuplicate}>
          Копия
        </button>
        <button type="button" className="btn btn--danger" onClick={onDelete}>
          Удалить
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImportFile(file);
            e.target.value = '';
          }}
        />
      </div>
    </header>
  );
}
