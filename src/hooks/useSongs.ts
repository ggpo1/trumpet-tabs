import { useCallback, useEffect, useRef, useState } from 'react';
import * as api from '../api';
import { createSong, type Song } from '../types';

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimerRef = useRef<number | null>(null);

  const loadSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.fetchSongs();
      setSongs(data);
      setActiveId((current) => current ?? data[0]?.id ?? null);
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

  const createNewSong = async () => {
    setError(null);
    try {
      const song = await api.createSong(createSong());
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

  return {
    songs,
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
    reload: loadSongs,
  };
}
