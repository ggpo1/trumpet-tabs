import type { Song } from '../../types';

interface SongSidebarProps {
  songs: Song[];
  activeId: string | null;
  onSelectSong: (id: string) => void;
  onCreateSong: () => void;
}

export function SongSidebar({ songs, activeId, onSelectSong, onCreateSong }: SongSidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <h1>Trumpet Tabs</h1>
        <button type="button" className="btn btn--small btn--primary" onClick={onCreateSong}>
          + Новая
        </button>
      </div>

      <ul className="song-list">
        {songs.map((song) => (
          <li key={song.id}>
            <button
              type="button"
              className={`song-item ${song.id === activeId ? 'song-item--active' : ''}`}
              onClick={() => onSelectSong(song.id)}
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
  );
}
