import type { Song, SongFolder } from './types';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || response.statusText;
    try {
      const json = JSON.parse(text) as { error?: string };
      if (json.error) message = json.error;
    } catch {
      // keep raw text
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function fetchSongs(): Promise<Song[]> {
  return request<Song[]>('/songs');
}

export async function createSong(song: Song): Promise<Song> {
  return request<Song>('/songs', {
    method: 'POST',
    body: JSON.stringify(song),
  });
}

export async function updateSong(song: Song): Promise<Song> {
  return request<Song>(`/songs/${song.id}`, {
    method: 'PUT',
    body: JSON.stringify(song),
  });
}

export async function deleteSong(id: string): Promise<void> {
  await request<void>(`/songs/${id}`, { method: 'DELETE' });
}

export async function fetchFolders(): Promise<SongFolder[]> {
  return request<SongFolder[]>('/folders');
}

export async function createFolder(folder: SongFolder): Promise<SongFolder> {
  return request<SongFolder>('/folders', {
    method: 'POST',
    body: JSON.stringify(folder),
  });
}

export async function updateFolder(folder: SongFolder): Promise<SongFolder> {
  return request<SongFolder>(`/folders/${folder.id}`, {
    method: 'PUT',
    body: JSON.stringify(folder),
  });
}

export async function deleteFolder(id: string): Promise<void> {
  await request<void>(`/folders/${id}`, { method: 'DELETE' });
}
