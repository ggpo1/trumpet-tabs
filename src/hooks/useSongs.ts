import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { createFolder, createSong, type Song, type SongFolder } from '../types';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [folders, setFolders] = useState<SongFolder[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [songsData, foldersData] = await Promise.all([api.fetchSongs(), api.fetchFolders()]);
      setSongs(songsData.map((song) => ({ ...song, folderId: song.folderId ?? null })));
      setFolders(foldersData);
      setActiveId((current) => current ?? songsData[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить песни');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSongs();
    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [loadSongs]);

  const activeSong = songs.find((s) => s.id === activeId) ?? null;

  const persistSong = useCallback((song: Song) => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      api.updateSong(song).catch((err) => {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения');
      });
    }, 400);
  }, []);

  const updateActive = useCallback(
    (patch: Partial<Song>) => {
      if (!activeId) return;
      setSongs((prev) => {
        const next = prev.map((s) =>
          s.id === activeId ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s,
        );
        const updated = next.find((s) => s.id === activeId);
        if (updated) persistSong(updated);
        return next;
      });
    },
    [activeId, persistSong],
  );

  const createNewSong = async (folderId: string | null = null) => {
    setError(null);
    try {
      const song = await api.createSong(createSong({ folderId }));
      setSongs((prev) => [song, ...prev]);
      setActiveId(song.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать песню');
    }
  };

  const deleteSong = async (id: string) => {
    setError(null);
    try {
      await api.deleteSong(id);
      setSongs((prev) => {
        const next = prev.filter((s) => s.id !== id);
        if (activeId === id) setActiveId(next[0]?.id ?? null);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить песню');
    }
  };

  const duplicateSong = async (song: Song) => {
    setError(null);
    try {
      const copy = createSong({
        ...song,
        title: `${song.title} (копия)`,
        notes: song.notes.map((n) => ({ ...n, id: crypto.randomUUID() })),
      });
      const created = await api.createSong(copy);
      setSongs((prev) => [created, ...prev]);
      setActiveId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось скопировать песню');
    }
  };

  const importSong = async (song: Song) => {
    setError(null);
    try {
      const created = await api.createSong(song);
      setSongs((prev) => [created, ...prev]);
      setActiveId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось импортировать песню');
    }
  };

  const createNewFolder = async (name?: string) => {
    setError(null);
    try {
      const folder = await api.createFolder(createFolder({ name: name?.trim() || 'Новая папка' }));
      setFolders((prev) => [...prev, folder].sort((a, b) => a.name.localeCompare(b.name, 'ru')));
      return folder;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать папку');
      return null;
    }
  };

  const renameFolder = async (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError(null);
    try {
      const folder = folders.find((f) => f.id === id);
      if (!folder) return;
      const updated = await api.updateFolder({ ...folder, name: trimmed });
      setFolders((prev) =>
        prev.map((f) => (f.id === id ? updated : f)).sort((a, b) => a.name.localeCompare(b.name, 'ru')),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось переименовать папку');
    }
  };

  const deleteFolderById = async (id: string) => {
    setError(null);
    try {
      await api.deleteFolder(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
      setSongs((prev) => prev.map((s) => (s.folderId === id ? { ...s, folderId: null } : s)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось удалить папку');
    }
  };

  const moveSongToFolder = async (songId: string, folderId: string | null) => {
    setError(null);
    const song = songs.find((s) => s.id === songId);
    if (!song || song.folderId === folderId) return;

    const updated = { ...song, folderId, updatedAt: new Date().toISOString() };
    setSongs((prev) => prev.map((s) => (s.id === songId ? updated : s)));

    try {
      await api.updateSong(updated);
    } catch (err) {
      setSongs((prev) => prev.map((s) => (s.id === songId ? song : s)));
      setError(err instanceof Error ? err.message : 'Не удалось переместить песню');
    }
  };

  return {
    songs,
    folders,
    activeSong,
    activeId,
    loading,
    error,
    setActiveId,
    updateActive,
    createNewSong,
    deleteSong,
    duplicateSong,
    importSong,
    createNewFolder,
    renameFolder,
    deleteFolderById,
    moveSongToFolder,
    reload: loadSongs,
  };
}
