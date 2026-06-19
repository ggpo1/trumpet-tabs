import type { Song } from './types';

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
    folderId: data.folderId ?? null,
    updatedAt: new Date().toISOString(),
  };
}
