import type { Song } from './types';

const STORAGE_KEY = 'trumpet-tabs-songs';

export function loadSongs(): Song[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Song[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSongs(songs: Song[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

export function exportSongJson(song: Song): string {
  return JSON.stringify(song, null, 2);
}

export function importSongJson(json: string): Song {
  const data = JSON.parse(json) as Song;
  if (!data.title || !Array.isArray(data.notes)) {
    throw new Error('Неверный формат файла');
  }
  return {
    ...data,
    id: crypto.randomUUID(),
    updatedAt: new Date().toISOString(),
  };
}
