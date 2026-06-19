import { useEffect, useMemo, useState } from 'react';
import type { Song, SongFolder } from '../../types';

const COLLAPSED_KEY = 'trumpet-tabs:collapsed-folders';

function loadCollapsed(): Set<string> {
  try {
    const raw = localStorage.getItem(COLLAPSED_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCollapsed(ids: Set<string>) {
  localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...ids]));
}

interface SongSidebarProps {
  songs: Song[];
  folders: SongFolder[];
  activeId: string | null;
  onSelectSong: (id: string) => void;
  onCreateSong: (folderId?: string | null) => void;
  onCreateFolder: (name?: string) => Promise<SongFolder | null>;
  onRenameFolder: (id: string, name: string) => void;
  onDeleteFolder: (id: string) => void;
  onMoveSong: (songId: string, folderId: string | null) => void;
}

function SongListItem({
  song,
  activeId,
  folders,
  onSelectSong,
  onMoveSong,
}: {
  song: Song;
  activeId: string | null;
  folders: SongFolder[];
  onSelectSong: (id: string) => void;
  onMoveSong: (songId: string, folderId: string | null) => void;
}) {
  return (
    <li className="song-list__item">
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
      {folders.length > 0 && (
        <select
          className="song-item__folder-select"
          value={song.folderId ?? ''}
          title="Папка"
          aria-label={`Папка для «${song.title}»`}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onMoveSong(song.id, e.target.value || null)}
        >
          <option value="">Без папки</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      )}
    </li>
  );
}

export function SongSidebar({
  songs,
  folders,
  activeId,
  onSelectSong,
  onCreateSong,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder,
  onMoveSong,
}: SongSidebarProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    saveCollapsed(collapsed);
  }, [collapsed]);

  const songsByFolder = useMemo(() => {
    const grouped = new Map<string | null, Song[]>();
    for (const song of songs) {
      const key = song.folderId;
      const list = grouped.get(key) ?? [];
      list.push(song);
      grouped.set(key, list);
    }
    for (const list of grouped.values()) {
      list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    }
    return grouped;
  }, [songs]);

  const ungroupedSongs = songsByFolder.get(null) ?? [];

  const toggleFolder = (folderId: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) next.delete(folderId);
      else next.add(folderId);
      return next;
    });
  };

  const submitNewFolder = async () => {
    const name = newFolderName.trim() || 'Новая папка';
    await onCreateFolder(name);
    setNewFolderName('');
    setCreatingFolder(false);
  };

  const startRename = (folder: SongFolder) => {
    setRenamingId(folder.id);
    setRenameValue(folder.name);
  };

  const submitRename = (folderId: string) => {
    onRenameFolder(folderId, renameValue);
    setRenamingId(null);
    setRenameValue('');
  };

  const handleDeleteFolder = (folder: SongFolder) => {
    const count = songsByFolder.get(folder.id)?.length ?? 0;
    const message =
      count > 0
        ? `Удалить папку «${folder.name}»? ${count} песен останутся без папки.`
        : `Удалить папку «${folder.name}»?`;
    if (confirm(message)) onDeleteFolder(folder.id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar__head">
        <h1>Trumpet Tabs</h1>
        <div className="sidebar__actions">
          <button type="button" className="btn btn--small btn--primary" onClick={() => onCreateSong()}>
            + Новая
          </button>
          <button
            type="button"
            className="btn btn--small"
            title="Новая папка"
            onClick={() => setCreatingFolder(true)}
          >
            📁
          </button>
        </div>
      </div>

      {creatingFolder && (
        <form
          className="folder-create"
          onSubmit={(e) => {
            e.preventDefault();
            void submitNewFolder();
          }}
        >
          <input
            autoFocus
            value={newFolderName}
            placeholder="Название папки"
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setCreatingFolder(false);
                setNewFolderName('');
              }
            }}
          />
          <button type="submit" className="btn btn--small btn--primary">
            OK
          </button>
        </form>
      )}

      <div className="song-list-scroll">
        {folders.map((folder) => {
          const folderSongs = songsByFolder.get(folder.id) ?? [];
          const isCollapsed = collapsed.has(folder.id);

          return (
            <section key={folder.id} className="folder-group">
              <div className="folder-group__head">
                <button
                  type="button"
                  className="folder-group__toggle"
                  aria-expanded={!isCollapsed}
                  onClick={() => toggleFolder(folder.id)}
                >
                  {isCollapsed ? '▶' : '▼'}
                </button>

                {renamingId === folder.id ? (
                  <input
                    className="folder-group__rename"
                    autoFocus
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => submitRename(folder.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') submitRename(folder.id);
                      if (e.key === 'Escape') setRenamingId(null);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    className="folder-group__title"
                    onDoubleClick={() => startRename(folder)}
                    title="Двойной клик — переименовать"
                  >
                    {folder.name}
                    <span className="folder-group__count">{folderSongs.length}</span>
                  </button>
                )}

                <div className="folder-group__actions">
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    title="Добавить песню в папку"
                    onClick={() => onCreateSong(folder.id)}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm"
                    title="Переименовать"
                    onClick={() => startRename(folder)}
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    className="icon-btn icon-btn--sm icon-btn--danger"
                    title="Удалить папку"
                    onClick={() => handleDeleteFolder(folder)}
                  >
                    ×
                  </button>
                </div>
              </div>

              {!isCollapsed && (
                <ul className="song-list">
                  {folderSongs.length === 0 ? (
                    <li className="folder-group__empty">Папка пуста</li>
                  ) : (
                    folderSongs.map((song) => (
                      <SongListItem
                        key={song.id}
                        song={song}
                        activeId={activeId}
                        folders={folders}
                        onSelectSong={onSelectSong}
                        onMoveSong={onMoveSong}
                      />
                    ))
                  )}
                </ul>
              )}
            </section>
          );
        })}

        {ungroupedSongs.length > 0 && (
          <section className="folder-group folder-group--ungrouped">
            {folders.length > 0 && <h2 className="folder-group__section-title">Без папки</h2>}
            <ul className="song-list">
              {ungroupedSongs.map((song) => (
                <SongListItem
                  key={song.id}
                  song={song}
                  activeId={activeId}
                  folders={folders}
                  onSelectSong={onSelectSong}
                  onMoveSong={onMoveSong}
                />
              ))}
            </ul>
          </section>
        )}

        {songs.length === 0 && folders.length === 0 && (
          <p className="sidebar__empty">Нет песен — создайте первую</p>
        )}
      </div>
    </aside>
  );
}
