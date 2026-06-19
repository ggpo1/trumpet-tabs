export type Valves = [boolean, boolean, boolean];

export type NoteDuration = 'eighth' | 'quarter' | 'half' | 'whole';

export interface TabNote {
  id: string;
  label: string;
  valves: Valves;
  duration: NoteDuration;
  lyric: string;
}

export interface SongFolder {
  id: string;
  name: string;
  updatedAt: string;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  tempo: number;
  notes: TabNote[];
  folderId: string | null;
  updatedAt: string;
}

export interface SongRow {
  id: string;
  title: string;
  artist: string;
  tempo: number;
  notes: TabNote[];
  folder_id: string | null;
  updated_at: Date;
  created_at: Date;
}

export interface SongFolderRow {
  id: string;
  name: string;
  updated_at: Date;
  created_at: Date;
}
